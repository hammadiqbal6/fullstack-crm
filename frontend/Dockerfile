# Multi-stage build for Next.js 16

# Stage 1: Dependencies
FROM node:20-slim AS deps

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Stage 2: Builder
FROM node:20-slim AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application files
COPY . .

# Set build-time environment variable
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN npm run build

# Stage 3: Development
FROM node:20-slim AS development

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies)
RUN npm install

# Copy application files
COPY . .

EXPOSE 3000

# Start the application in dev mode
CMD ["npm", "run", "dev"]

# Stage 4: Production
FROM node:20-slim AS production

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/tsconfig.json ./

# Create non-root user for security
RUN groupadd -r nextjs && useradd -r -g nextjs nextjs
RUN chown -R nextjs:nextjs /app

USER nextjs

EXPOSE 3000

# Start the application in production mode
CMD ["npm", "start"]
