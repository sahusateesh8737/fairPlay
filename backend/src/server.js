const http = require('http');
const app = require('./app');
const { initSocket } = require('./config/socket');
const { connectRedis } = require('./config/redis');

const server = http.createServer(app);

const startServer = async () => {
    try {
        // Connect to Redis first (used by Socket.io and Caching)
        await connectRedis();

        // Initialize Socket.io with Redis Adapter
        await initSocket(server);

        const PORT = process.env.PORT || 5001;
        server.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (err) {
        console.error('❌ Failed to start server:', err);
        process.exit(1);
    }
};

startServer();
