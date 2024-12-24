#!/bin/sh
set -e

# Run database migrations
bun run db:migrate

# Execute the CMD passed to the container
exec "$@"
