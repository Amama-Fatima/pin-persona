# Use official Node.js base image
FROM node:18-slim

# Install dependencies required for Chrome/Chromium
RUN apt-get update && apt-get install -y \
  wget gnupg unzip \
  ca-certificates fonts-liberation libasound2 \
  libatk1.0-0 libatk-bridge2.0-0 libcups2 libdbus-1-3 \
  libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 \
  libxrandr2 libgbm1 libgtk-3-0 libnspr4 libnss3 \
  libxss1 libxtst6 xdg-utils && \
  rm -rf /var/lib/apt/lists/*

# Install Chromium (stable)
RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb && \
    apt-get install -y ./google-chrome-stable_current_amd64.deb && \
    rm google-chrome-stable_current_amd64.deb

# Set working directory
WORKDIR /app

# Copy package files and install deps
COPY package*.json ./
RUN npm install --omit=dev

# Copy app code
COPY . .

# Expose port (Koyeb expects this from PORT env var)
EXPOSE 8000

# Start app
CMD ["npm", "start"]
