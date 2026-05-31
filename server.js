const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;

let players = {};

io.on('connection', (socket) => {
    console.log('✅ Игрок подключился:', socket.id);
    
    players[socket.id] = {
        id: socket.id,
        x: 200 + Math.random() * 700,
        y: 200 + Math.random() * 300,
        angle: Math.random() * Math.PI * 2,
        vx: 0,
        vy: 0,
        speed: 0,
        color: `hsl(${Math.random() * 360}, 70%, 55%)`,
        crashed: false,
        respawnTimer: 0
    };
    
    io.emit('playersUpdate', players);
    
    socket.on('playerMove', (data) => {
        if (players[socket.id]) {
            players[socket.id] = { ...players[socket.id], ...data };
            io.emit('playersUpdate', players);
        }
    });
    
    socket.on('playerCrash', (crashData) => {
        io.emit('crashEffect', { id: socket.id, ...crashData });
    });
    
    socket.on('disconnect', () => {
        delete players[socket.id];
        io.emit('playersUpdate', players);
        console.log('❌ Игрок отключился:', socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`🎮 Сервер запущен на порту ${PORT}`);
    console.log(`🔗 Открой: http://localhost:${PORT}`);
});
