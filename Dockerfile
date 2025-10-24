FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Generate Prisma client
RUN npx prisma generate

# Run database migrations
RUN npx prisma migrate deploy

# Expose port (if needed)
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
