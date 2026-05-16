FROM node:20-alpine

# 1. Install FFmpeg for video processing
RUN apk add --no-cache ffmpeg

# 2. Install pnpm via npm (as requested)
RUN npm install -g pnpm

# 3. Set working directory
WORKDIR /app

# 4. Copy package files and install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# 5. Copy the rest of the application code
COPY . .

# 6. Build the Next.js application
ARG NEXT_PUBLIC_ADMIN_PHONES
ENV NEXT_PUBLIC_ADMIN_PHONES=$NEXT_PUBLIC_ADMIN_PHONES
RUN pnpm build

# 7. Expose the port Next.js runs on
EXPOSE 3000

# 8. Start the Next.js production server
CMD ["pnpm", "start"]
