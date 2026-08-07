FROM node:20-alpine AS portfolio-build
WORKDIR /app/portfolio
COPY portfolio/package.json portfolio/package-lock.json ./
RUN npm ci
COPY portfolio/ ./
RUN npm run build

FROM node:20-alpine AS limoflow-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
ENV VITE_BASE_PATH=/limoflow/
RUN npm run build

FROM nginx:1.27-alpine AS runner
COPY web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=portfolio-build /app/portfolio/dist /usr/share/nginx/html/portfolio
COPY --from=limoflow-build /app/frontend/dist /usr/share/nginx/html/limoflow
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
