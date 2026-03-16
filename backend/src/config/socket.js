const { Server } = require('socket.io');

let io;

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || "http://localhost:5173",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        // Teacher joins a specific room for their section
        socket.on('join_section_monitor', (sectionId) => {
            socket.join(`room_${sectionId}`);
            console.log(`Teacher joined monitoring for section: ${sectionId}`);
        });

        // Student's browser emits a cheat alert
        socket.on('student_cheat_alert', (data) => {
            console.log(`Cheat alert received from ${data.studentName} in room_${data.sectionId}: ${data.eventType}`);
            io.to(`room_${data.sectionId}`).emit('receive_cheat_alert', data);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

module.exports = { initSocket, getIO };
