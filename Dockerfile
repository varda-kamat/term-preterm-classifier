# 1. Use official Node.js image
FROM node:18

# 2. Create app directory inside container
WORKDIR /app

# 3. Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# 4. Copy the rest of the code
COPY . .

# 5. Expose app port
EXPOSE 3000

# 6. Start the app
CMD ["npm", "run", "dev"]
