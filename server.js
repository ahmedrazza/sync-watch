const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const { ExpressPeerServer } = require('peer');

app.use(express.static('public'));

// PeerJS Server for Video Calls
const peerServer = ExpressPeerServer(http, { debug: true });
app.use('/peerjs', peerServer);

// State Memory (Stores the movie URL for new users)
let currentVideoUrl = null;

io.on('connection', (socket) => {
	console.log('User connected:', socket.id);

	// 1. Send current video to new user immediately
	if (currentVideoUrl) {
		socket.emit('update-video', currentVideoUrl);
	}

	// 2. Video Sync Logic
	socket.on('sync-action', (data) => {
		socket.broadcast.emit('sync-action', data);
	});

	socket.on('change-video', (url) => {
		currentVideoUrl = url;
		io.emit('update-video', url);
	});

	// 3. Chat Logic
	socket.on('chat-message', (data) => {
		io.emit('chat-message', data);
	});

	// 4. Video Call Logic
	socket.on('join-room', (peerId) => {
		socket.broadcast.emit('user-connected', peerId);
	});

	// 5. HEARTBEAT LISTENER (Anti-Sleep)
	socket.on('heartbeat', () => {
		// Just listening to this event keeps the connection active
		// No action needed, the traffic itself prevents timeout
	});
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log(`Server running on port ${PORT}`));
