FROM node:20-bullseye

# Install Expo CLI globally
RUN npm install -g expo-cli

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies using exact versions from lock file
RUN npm ci

# Copy project files
COPY . .

# Expose ports for Expo
EXPOSE 19000 19001 19002 8081

# Start Expo development server
CMD ["npx", "expo", "start", "--host", "tunnel"]