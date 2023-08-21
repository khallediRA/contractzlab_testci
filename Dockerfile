# Build Stage
FROM node:16.3.0-slim AS build

# Set working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./


RUN npm ci

# Copy necessary files for build
COPY . .
RUN mkdir logs && npm run build

# Final Stage
FROM node:16.3.0-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    poppler-utils \
    libreoffice \
    libpoppler-cpp-dev \
    pkg-config \
    python3-pip \
    && pip3 install pdftotext \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* 

# Create a non-root user
RUN useradd -m appuser
USER appuser

# Set working directory
WORKDIR /usr/src/app

# Copy necessary files from build stage
COPY --from=build /usr/src/app /usr/src/app

# Expose necessary ports (5432 might not be necessary inside the container unless it's hosting a DB)
EXPOSE 4000

# Start the application
CMD [ "npm", "start" ]
