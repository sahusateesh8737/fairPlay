const rateLimit = require('express-rate-limit');

// 1. Global Limiter - Applies universally to /api
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20000, // Increased for high-scale testing (was 100)
    message: {
        error: {
            message: 'Too many requests from this IP, please try again after 15 minutes',
            status: 429
        }
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// 2. Auth Limiter - Strict limits for login/signup to prevent brute forcing
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per windowMs
    message: {
        error: {
            message: 'Too many authentication attempts, please try again after 15 minutes',
            status: 429
        }
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// 3. Submission Limiter - Stop spamming code submissions
const submissionLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 15, // Limit each IP to 15 submissions per windowMs
    message: {
        error: {
            message: 'Too many submissions sent rapidly. Please wait a few minutes before trying again.',
            status: 429
        }
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    globalLimiter,
    authLimiter,
    submissionLimiter
};
