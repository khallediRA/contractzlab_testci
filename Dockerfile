FROM node:16
# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Build the TypeScript code into JavaScript code
RUN npm run build

# Expose port 4001
EXPOSE 4001 5432

# Start the application
CMD [ "npm", "start" ]