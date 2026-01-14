# Node version compatible with Prisma & modern libs
FROM node:20-alpine

WORKDIR /app

# System deps needed for bcrypt / Prisma
RUN apk add --no-cache openssl libc6-compat

# Copy package files first for caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all backend code including .env
COPY . .

# Generate Prisma client (after env is in container)
RUN npx prisma generate

# Expose backend port
EXPOSE 5000

# Start backend in dev mode
CMD ["npm", "run", "dev"]
