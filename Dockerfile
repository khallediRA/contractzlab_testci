FROM node:16 AS build

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Build the TypeScript code into JavaScript code
RUN npm run build

# Final stage
FROM node:16

# Install poppler-utils
RUN apt-get update && apt-get install -y poppler-utils

# Install LibreOffice
RUN apt-get update && apt-get install -y libreoffice

# Install pdftotext
RUN apt-get install -y libpoppler-cpp-dev pkg-config python3-pip
RUN pip3 install pdftotext

# Copy the Node.js application code from the build stage
COPY --from=build /usr/src/app /usr/src/app

# Set the working directory to the Node.js application code
WORKDIR /usr/src/app

# Expose port 4001
EXPOSE 4001 5432

# Start the application
CMD [ "npm", "start" ]