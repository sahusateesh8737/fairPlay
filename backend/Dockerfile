# Build Stage
FROM node:20-slim AS builder

WORKDIR /app

# Install OpenSSL (required for Prisma)
RUN apt-get update && apt-get install -y openssl

# Copy package files and install dependencies
COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

# Generate Prisma Client
RUN npx prisma generate

# Final Stage
FROM node:20-slim AS runner

WORKDIR /app

# Install OpenSSL (required for Prisma)
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy generated Prisma client and production dependencies from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /root/.prisma /root/.prisma

# Copy application source code
COPY . .

# Set production environment
ENV NODE_ENV=production

# Expose the port (Render handles mapping, but we specify our internal default)
EXPOSE 5001

# Start the application
CMD ["npm", "start"]
