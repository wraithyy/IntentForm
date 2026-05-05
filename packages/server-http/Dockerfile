FROM node:22-alpine AS build
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY dist ./dist

FROM gcr.io/distroless/nodejs22-debian12
WORKDIR /app
COPY --from=build /app /app
EXPOSE 3001
USER nonroot
CMD ["dist/cli.js"]
