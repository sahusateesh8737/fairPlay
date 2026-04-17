const client = require('prom-client');

// Create a Registry which can register metrics
const register = new client.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: 'fairplay-backend'
});

// Enable the collection of default metrics
client.collectDefaultMetrics({ register });

// Define custom metrics
const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10] // 0.1 to 10 seconds
});

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'code']
});

// Register custom metrics
register.registerMetric(httpRequestDurationMicroseconds);
register.registerMetric(httpRequestsTotal);

/**
 * Middleware to track HTTP request metrics
 */
const requestMetricsMiddleware = (req, res, next) => {
  const start = process.hrtime();
  
  res.on('finish', () => {
    const duration = process.hrtime(start);
    const durationInSeconds = duration[0] + duration[1] / 1e9;
    
    // Determine the route for labeling (handle dynamic params)
    const route = req.baseUrl + (req.route ? req.route.path : '');
    
    httpRequestDurationMicroseconds
      .labels(req.method, route || req.path, res.statusCode)
      .observe(durationInSeconds);
      
    httpRequestsTotal
      .labels(req.method, route || req.path, res.statusCode)
      .inc();
  });
  
  next();
};

module.exports = {
  register,
  requestMetricsMiddleware
};
