# Stage 1: Build
FROM node:24-alpine AS builder

# Install pnpm
RUN npm install -g pnpm@10.2.0

WORKDIR /app

# Copy workspace configuration and lockfile
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

# Copy all package.json files to satisfy workspace dependencies
COPY apps/api/package.json ./apps/api/
COPY packages/db/package.json ./packages/db/
COPY packages/logger/package.json ./packages/logger/

# Install dependencies (including devDependencies for build)
RUN pnpm install --ignore-scripts

# Copy the rest of the source code
COPY . .

# Build the api app and its dependencies using Nx
RUN npx nx build api --prod

# Stage 2: Runtime
FROM node:24-alpine AS runner

# Install pnpm for production install
RUN npm install -g pnpm@10.2.0

WORKDIR /app

# Copy workspace files for production install
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/db/package.json ./packages/db/
COPY packages/logger/package.json ./packages/logger/

# Copy built artifacts from builder stage
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages/db/dist ./packages/db/dist
COPY --from=builder /app/packages/logger/dist ./packages/logger/dist

# Install ONLY production dependencies
# This recreates the workspace symlinks correctly
RUN pnpm install --prod --ignore-scripts

EXPOSE 8080

# Run the app from the api directory
WORKDIR /app/apps/api
CMD ["node", "dist/main.js"]
