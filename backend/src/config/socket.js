const { Server } = require('socket.io');

let io;

const initSocket = (server) => {
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
        socket.on('student_progress_update', ({ assignmentId, studentId, progress, currentQuestion, tabStatus }) => {
            io.to(`monitor_${assignmentId}`).emit('receive_progress_update', {
                studentId,
                progress,
                currentQuestion,
                tabStatus, // 'ACTIVE' or 'FLAGGED'
                timestamp: new Date().toLocaleTimeString()
            });
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
