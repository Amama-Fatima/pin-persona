# Use official Node.js base image
FROM node:18-slim

# Install dependencies for Chromium
RUN apt-get update && apt-get install -y \
    chromium \
    ca-certificates \
    fonts-liberation \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libatspi2.0-0 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libxkbcommon0 \
    libx11-xcb1 \
    wget \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package.json and lockfile first (for better caching)
COPY package*.json ./

# Install Node.js dependencies
RUN npm install --omit=dev

# Copy rest of the app
COPY . .

# Expose port (Koyeb expects PORT env var)
EXPOSE 8080

# Start command
CMD ["npm", "start"]
