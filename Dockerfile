# ---- frontend build ----
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend .
RUN npm run build

# ---- backend ----
FROM node:20-alpine
WORKDIR /app
COPY backend/package*.json ./backend/
RUN cd backend && npm install
COPY backend ./backend
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

EXPOSE 8080
CMD ["node", "backend/dist/index.js"]