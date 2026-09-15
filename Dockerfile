FROM node:20

WORKDIR /app

COPY . .

# Install dependencies
ARG SETUP_COMMAND="npm install"
RUN ${SETUP_COMMAND}

# Build the app
ARG BUILD_COMMAND="npm run build"
RUN ${BUILD_COMMAND}

# Start the app
ARG START_COMMAND="npm run start"
RUN printf '#!/bin/sh\n%s\n' "${START_COMMAND}" > /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

ENV PORT=80

EXPOSE 80

ENTRYPOINT ["/app/entrypoint.sh"]
