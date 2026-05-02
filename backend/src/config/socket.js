const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const { redisClient } = require('./redis');

let io;

const initSocket = async (server) => {
    try {
        // Create pub/sub clients for Redis Adapter
        const pubClient = redisClient.duplicate();
        const subClient = redisClient.duplicate();

        await Promise.all([pubClient.connect(), subClient.connect()]);
        
        io = new Server(server, {
            cors: {
                origin: [
                    "http://localhost:5173",
                    "https://fair-play-liart.vercel.app",
                    process.env.CLIENT_URL
                ].filter(Boolean),
                methods: ["GET", "POST"],
                credentials: true
            }
        });

        io.adapter(createAdapter(pubClient, subClient));
        console.log('📡 Socket.io Redis Adapter integrated');
    } catch (err) {
        console.warn('⚠️  Could not initialize Socket.io Redis Adapter. Falling back to local adapter.');
        
        io = new Server(server, {
            cors: {
                origin: [
                    "http://localhost:5173",
                    "https://fair-play-liart.vercel.app",
                    process.env.CLIENT_URL
                ].filter(Boolean),
                methods: ["GET", "POST"],
                credentials: true
            }
        });
    }

    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        // --- EXAM MONITORING & HEAT MAP ---
        
        // Student joins a specific assignment room for live tracking
        socket.on('join_exam', ({ assignmentId, studentId, studentName, rollNumber }) => {
            const roomName = `exam_${assignmentId}`;
            socket.join(roomName);
            
            // Track assignment for disconnects
            socket.activeAssignmentId = assignmentId;
            socket.activeStudentId = studentId;

            console.log(`Student ${studentName} (Roll: ${rollNumber}) joined exam room: ${roomName}`);
            
            // Notify teachers in the monitoring room that a student has joined/is active
            io.to(`monitor_${assignmentId}`).emit('student_status_update', {
                studentId,
                studentName,
                rollNumber,
                status: 'ACTIVE',
                timestamp: new Date().toLocaleTimeString()
            });
        });

        // Teacher joins monitoring for a specific assignment
        socket.on('teacher_join_monitoring', (assignmentId) => {
            const monitorRoom = `monitor_${assignmentId}`;
            socket.join(monitorRoom);
            console.log(`Teacher joined monitoring for assignment: ${assignmentId}`);
        });

        // Live progress update from student to teacher
        socket.on('student_progress_update', async ({ assignmentId, studentId, progress, currentQuestion, tabStatus }) => {
            const data = {
                studentId,
                progress,
                currentQuestion,
                tabStatus, // 'ACTIVE' or 'FLAGGED'
                timestamp: new Date().toLocaleTimeString()
            };

            // 1. Broadcast to all teachers in the monitoring room
            io.to(`monitor_${assignmentId}`).emit('receive_progress_update', data);

            // 2. Store in Redis Hash for persistence (so teachers don't lose data on refresh)
            try {
                await redisClient.hSet(`active_exam:${assignmentId}:progress`, studentId, JSON.stringify(data));
                // Set expiry for 24 hours just in case
                await redisClient.expire(`active_exam:${assignmentId}:progress`, 86400);
            } catch (err) {
                console.error('Failed to store live progress in Redis:', err.message);
            }
        });

        // Legacy: Section Monitor (can be kept for general section chat/etc)
        socket.on('join_section_monitor', (sectionId) => {
            socket.join(`room_${sectionId}`);
            console.log(`Legacy room join for section: ${sectionId}`);
        });

        socket.on('student_cheat_alert', (data) => {
            // Forward to both section room and specific assignment monitor room if available
            console.log(`Cheat alert received from ${data.studentName} in room_${data.sectionId}`);
            io.to(`room_${data.sectionId}`).emit('receive_cheat_alert', data);
            
            // Also notify any assignment-specific monitor
            if (data.assignmentId) {
                io.to(`monitor_${data.assignmentId}`).emit('student_status_update', {
                    studentId: data.studentId,
                    status: 'FLAGGED',
                    eventType: data.eventType,
                    timestamp: new Date().toLocaleTimeString()
                });
            }
        });

        socket.on('student_status_update', (data) => {
            if (data.assignmentId) {
                io.to(`monitor_${data.assignmentId}`).emit('student_status_update', data);
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
            if (socket.activeAssignmentId && socket.activeStudentId) {
                io.to(`monitor_${socket.activeAssignmentId}`).emit('student_status_update', {
                    studentId: socket.activeStudentId,
                    status: 'IDLE',
                    timestamp: new Date().toLocaleTimeString()
                });
            }
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
