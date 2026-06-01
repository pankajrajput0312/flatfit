# ==============================================================================
# STAGE 1: ASSET COMPILATION AND BUILD ENGINE (NODE.JS)
# ==============================================================================
FROM node:20-alpine AS builder

WORKDIR /build

# Copy configuration files and resolve underlying library structures
COPY package.json package-lock.json ./
RUN npm ci --clean-install --silent

# Copy front-end client directories and compile the static bundle
COPY . .
RUN npm run build


# ==============================================================================
# STAGE 2: PRODUCTION EDGE WEBSERVER DISTRIBUTION ENGINE (NGINX)
# ==============================================================================
FROM nginx:1.25-alpine AS runner

# Evacuate standard generic configuration overrides
RUN rm /etc/nginx/conf.d/default.conf

# Inject optimized production configuration blueprint
COPY nginx.conf /etc/nginx/conf.d/flatfit_frontend.conf

# Cleanly extract compiled client assets from the builder platform
COPY --from=builder /build/dist /usr/share/nginx/html

# Adjust file authorization limits to prevent runtime user escalations
RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid /var/cache/nginx /var/log/nginx /etc/nginx

# Demote process privileges down to the unprivileged webserver daemon user
USER nginx

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]