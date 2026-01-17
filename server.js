const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const { ExpressPeerServer } = require('peer');

app.use(express.static('public'));

// PeerJS Server
const peerServer = ExpressPeerServer(http, { debug: true });
app.use('/peerjs', peerServer);

let currentVideoUrl = null;

io.on('connection', (socket) => {
	if (currentVideoUrl) socket.emit('update-video', currentVideoUrl);

	socket.on('sync-action', (data) =>
		socket.broadcast.emit('sync-action', data),
	);
	socket.on('change-video', (url) => {
		currentVideoUrl = url;
		io.emit('update-video', url);
	});

	socket.on('chat-message', (msg) => io.emit('chat-message', msg));
	socket.on('join-room', (peerId) =>
		socket.broadcast.emit('user-connected', peerId),
	);
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log(`Server running on port ${PORT}`));
