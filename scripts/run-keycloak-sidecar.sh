#!/bin/bash

# Run Keycloak as a sidecar container
docker run -d \
  --name keycloak \
  --network postiz-network \
  -e KC_DB=postgres \
  -e KC_DB_URL_HOST=postiz-postgres \
  -e KEYCLOAK_USER=admin \
  -e KEYCLOAK_PASSWORD=changeme \
  -p 8080:8080 \
  quay.io/keycloak/keycloak:latest start-dev

# Start the main application
docker-compose up -d postiz-production
