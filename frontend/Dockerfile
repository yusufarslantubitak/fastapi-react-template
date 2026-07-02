# Build command (run this from the project root):
# docker build -t frontend-prod:latest -f frontend/Dockerfile .

# Stage 0: build-stage
FROM frontend-builder:latest AS build-stage

COPY ./frontend ./

RUN npm run build


# Stage 1: production — serves compiled static files via nginx
FROM nginx:1

COPY --from=build-stage /app/frontend/dist/ /usr/share/nginx/html

COPY ./frontend/nginx.conf /etc/nginx/conf.d/default.conf

