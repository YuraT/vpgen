# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1-alpine AS base
WORKDIR /app
COPY package.json bun.lockb /app/

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lockb /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lockb /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS builder
COPY --from=install /temp/dev/node_modules /app/node_modules
COPY . /app
RUN bun run build

FROM base
# Metadata
LABEL org.opencontainers.image.title="VPGen"
LABEL org.opencontainers.image.description="A VPN config generator built with SvelteKit."
LABEL org.opencontainers.image.url="https://gitea.cazzzer.com/CaZzzer/vpgen"
LABEL org.opencontainers.image.source="https://gitea.cazzzer.com/CaZzzer/vpgen"
LABEL org.opencontainers.image.version="0.1"

COPY ./entrypoint.sh /entrypoint.sh
COPY --from=install /temp/prod/node_modules /app/node_modules
COPY --from=builder /app/build /app/build
COPY --from=builder /app/drizzle /app/drizzle
COPY --from=builder /app/drizzle.config.ts /app/

EXPOSE 3000

# entrypoint for drizzle migrations
ENTRYPOINT ["sh", "/entrypoint.sh"]

CMD ["bun", "./build"]
