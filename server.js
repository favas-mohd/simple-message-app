const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let users = []; // Array to store connected users
let messageHistory = []; // Array to store chat messages

// Serve static files from the 'public' directory
app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('A user connected');

    // Send existing messages to the new user
    socket.emit('load messages', messageHistory);

    // Handle setting the username
    socket.on('set username', (username) => {
        socket.username = username; // Store username in socket
        users.push(username); // Add user to the list
        io.emit('user list', users); // Emit updated user list to all clients
    });

    // Handle incoming chat messages
    socket.on('chat message', (data) => {
        const timestamp = new Date().toLocaleTimeString();
        const message = { user: data.user, text: data.text, timestamp }; // Create message object
        messageHistory.push(message); // Store message in history
        io.emit('chat message', message); // Emit the new message to all clients
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected');
        if (socket.username) {
            users = users.filter(user => user !== socket.username); // Remove user from the list
            io.emit('user list', users); // Emit updated user list to all clients
        }
    });
});

// Start the server and listen on port 3000
server.listen(3000, () => {
    console.log('Listening on *:3000');
});
