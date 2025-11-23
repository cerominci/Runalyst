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
# Install ngrok needed for Expo tunneling
RUN npm install -g @expo/ngrok
# Expose ports for Expo
EXPOSE 19000 19001 19002 8081

# Start Expo development server
#CMD ["npx", "expo", "start", "--host", "tunnel"]
CMD ["npx", "expo", "start", "--tunnel"] #added this to see the app on the expo go in mobile phone. -edd
