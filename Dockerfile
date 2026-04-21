FROM node:20-bookworm

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

# Used by `expo start --tunnel` so ngrok does not need a first-run install inside the container.
RUN npm install -g @expo/ngrok

# Metro uses 8081 inside the container; docker-compose maps host 8082 → 8081.
EXPOSE 19000 19001 19002 8081

CMD ["npx", "expo", "start", "--tunnel"]
