FROM node:22-alpine

WORKDIR /usr/src/app

COPY package*.json ./
# Install all deps (including devDeps) so tsc is available
RUN npm install

COPY . .

# Compile TypeScript → dist/
RUN npm run build

# Remove devDependencies to keep the image lean
RUN npm prune --omit=dev

EXPOSE 3000

CMD ["node", "dist/server.js"]
