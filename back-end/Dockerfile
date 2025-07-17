FROM node:22

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Install ts-node-dev globally
RUN npm install -g ts-node-dev

# Copy the rest of the app
COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]