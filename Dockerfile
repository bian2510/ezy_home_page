# syntax=docker/dockerfile:1.7
# EzyHome storefront — multi-stage build.
# Stage 1: build SPA bundle with Node + pnpm.
# Stage 2: serve the static dist/ with nginx as a non-root user.
# Acceptance ref: F001 / Task 015.

# ---------- Stage 1: build ----------
FROM node:20-alpine AS builder

# Enable pnpm via corepack (pinned version comes from package.json#packageManager).
RUN corepack enable

WORKDIR /app

# Copy dependency manifests first for better layer caching:
# package.json + lockfile change less often than source files.
COPY package.json pnpm-lock.yaml ./

# Frozen install — fail on lockfile drift. No optional/postinstall scripts surprises.
RUN pnpm install --frozen-lockfile

# Copy the rest of the source. .dockerignore keeps node_modules/.git/dist/.env out.
COPY . .

# Build-time injection of the public WhatsApp number into the Vite bundle.
# It is NOT a secret (ships in the client bundle by design — VITE_ prefix).
ARG VITE_WHATSAPP_NUMBER
ENV VITE_WHATSAPP_NUMBER=$VITE_WHATSAPP_NUMBER

# Produces /app/dist with hashed static assets ready to serve.
RUN pnpm build

# ---------- Stage 2: runtime ----------
FROM nginx:stable-alpine AS runtime

# Copy the built SPA bundle into nginx's web root.
COPY --from=builder /app/dist /usr/share/nginx/html

# Replace the default server block with the SPA-aware config
# (try_files fallback to /index.html + cache headers).
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Make sure the pre-existing unprivileged `nginx` user can write the runtime
# files it needs (cache dirs and the pid file). Listening on 80 is fine for an
# unprivileged user inside the container because port 80 is exposed only inside
# the container namespace; the host-side port (3000) is mapped by Docker.
RUN chown -R nginx:nginx /usr/share/nginx/html /var/cache/nginx /var/log/nginx \
    && touch /var/run/nginx.pid \
    && chown nginx:nginx /var/run/nginx.pid

EXPOSE 80

# Lightweight healthcheck — wget is included in nginx:stable-alpine via busybox.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://127.0.0.1/ >/dev/null 2>&1 || exit 1

# Run as the pre-existing unprivileged user shipped by the nginx image.
USER nginx

CMD ["nginx", "-g", "daemon off;"]
