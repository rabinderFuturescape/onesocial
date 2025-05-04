#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Default values for environment variables
KEYCLOAK_URL=${KEYCLOAK_URL:-"http://localhost:8080"}
KEYCLOAK_ADMIN_USER=${KEYCLOAK_ADMIN_USER:-"admin"}
KEYCLOAK_ADMIN_PASSWORD=${KEYCLOAK_ADMIN_PASSWORD:-"admin"}
KEYCLOAK_REALM=${KEYCLOAK_REALM:-"postiz-realm"}
POSTGRES_HOST=${POSTGRES_HOST:-"localhost"}
POSTGRES_PORT=${POSTGRES_PORT:-"5432"}
POSTGRES_USER=${POSTGRES_USER:-"postiz-local"}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-"postiz-local-pwd"}
POSTGRES_DB=${POSTGRES_DB:-"postiz-db-local"}
DEMO_USER_EMAIL=${DEMO_USER_EMAIL:-"demo@exampler.com"}
DEMO_USER_PASSWORD=${DEMO_USER_PASSWORD:-"demo"}

# Function to log messages
log() {
  echo "$(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check if required commands exist
if ! command_exists curl; then
  log "Error: curl is not installed. Please install curl and try again."
  exit 1
fi

if ! command_exists jq; then
  log "Error: jq is not installed. Please install jq and try again."
  exit 1
fi

# Step 1: Wait for Keycloak to be healthy
log "Waiting for Keycloak to be healthy..."
until curl -s "${KEYCLOAK_URL}/realms/master" > /dev/null; do
  log "Keycloak is not ready yet. Waiting..."
  sleep 5
done
log "Keycloak is healthy!"

# Get admin token
log "Authenticating with Keycloak admin CLI..."
ADMIN_TOKEN=$(curl -s -X POST "${KEYCLOAK_URL}/realms/master/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=${KEYCLOAK_ADMIN_USER}" \
  -d "password=${KEYCLOAK_ADMIN_PASSWORD}" \
  -d "grant_type=password" \
  -d "client_id=admin-cli" | jq -r '.access_token')

if [ -z "$ADMIN_TOKEN" ] || [ "$ADMIN_TOKEN" == "null" ]; then
  log "Error: Failed to get admin token from Keycloak."
  exit 1
fi

log "Successfully authenticated with Keycloak admin CLI."

# Step 2: Export demo user data from Postgres
log "Exporting demo user data from Postgres..."

# Check if we're running in Docker or locally
if [ -z "$POSTGRES_HOST" ] || [ "$POSTGRES_HOST" == "localhost" ]; then
  # Check if we can connect directly to Postgres
  if command_exists psql; then
    export PGPASSWORD="$POSTGRES_PASSWORD"
    psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "
      COPY (
        SELECT id, email AS username, email, '${DEMO_USER_PASSWORD}' AS plainPassword
        FROM users
        WHERE email = '${DEMO_USER_EMAIL}'
      ) TO STDOUT WITH CSV HEADER;
    " > /tmp/demo-user.csv
  else
    # Try using Docker exec
    docker exec postiz-postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "
      COPY (
        SELECT id, email AS username, email, '${DEMO_USER_PASSWORD}' AS plainPassword
        FROM users
        WHERE email = '${DEMO_USER_EMAIL}'
      ) TO STDOUT WITH CSV HEADER;
    " > /tmp/demo-user.csv
  fi
else
  # Connect to remote Postgres
  export PGPASSWORD="$POSTGRES_PASSWORD"
  psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "
    COPY (
      SELECT id, email AS username, email, '${DEMO_USER_PASSWORD}' AS plainPassword
      FROM users
      WHERE email = '${DEMO_USER_EMAIL}'
    ) TO STDOUT WITH CSV HEADER;
  " > /tmp/demo-user.csv
fi

# Check if the user was found
if [ ! -s /tmp/demo-user.csv ] || [ $(wc -l < /tmp/demo-user.csv) -le 1 ]; then
  log "Error: Demo user with email ${DEMO_USER_EMAIL} not found in the database."
  exit 1
fi

log "Demo user data exported successfully."

# Parse the CSV file (skip header)
USER_ID=$(tail -n +2 /tmp/demo-user.csv | cut -d ',' -f 1)
USERNAME=$(tail -n +2 /tmp/demo-user.csv | cut -d ',' -f 2)
EMAIL=$(tail -n +2 /tmp/demo-user.csv | cut -d ',' -f 3)
PASSWORD=$(tail -n +2 /tmp/demo-user.csv | cut -d ',' -f 4)

log "User details - ID: $USER_ID, Username: $USERNAME, Email: $EMAIL"

# Step 3: Check if user already exists in Keycloak
log "Checking if user already exists in Keycloak..."
USER_EXISTS=$(curl -s -X GET "${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users?email=${EMAIL}" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" | jq -r 'length')

if [ "$USER_EXISTS" -gt 0 ]; then
  log "User with email ${EMAIL} already exists in Keycloak. Updating password..."
  
  # Get the Keycloak user ID
  KEYCLOAK_USER_ID=$(curl -s -X GET "${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users?email=${EMAIL}" \
    -H "Authorization: Bearer ${ADMIN_TOKEN}" \
    -H "Content-Type: application/json" | jq -r '.[0].id')
  
  # Update the user's password
  curl -s -X PUT "${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users/${KEYCLOAK_USER_ID}/reset-password" \
    -H "Authorization: Bearer ${ADMIN_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{
      \"type\": \"password\",
      \"value\": \"${DEMO_USER_PASSWORD}\",
      \"temporary\": false
    }"
  
  log "Password updated successfully."
else
  log "Creating user in Keycloak..."
  
  # Create the user in Keycloak
  curl -s -X POST "${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users" \
    -H "Authorization: Bearer ${ADMIN_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{
      \"username\": \"${USERNAME}\",
      \"email\": \"${EMAIL}\",
      \"enabled\": true,
      \"emailVerified\": true,
      \"credentials\": [
        {
          \"type\": \"password\",
          \"value\": \"${DEMO_USER_PASSWORD}\",
          \"temporary\": false
        }
      ]
    }"
  
  log "User created successfully in Keycloak."
fi

# Step 4: Verify login
log "Verifying login with Keycloak..."

# Get a token using the demo user credentials
TOKEN_RESPONSE=$(curl -s -X POST "${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=postiz-client" \
  -d "client_secret=changeme" \
  -d "grant_type=password" \
  -d "username=${EMAIL}" \
  -d "password=${DEMO_USER_PASSWORD}")

ACCESS_TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r '.access_token')

if [ -z "$ACCESS_TOKEN" ] || [ "$ACCESS_TOKEN" == "null" ]; then
  log "Error: Failed to verify login with Keycloak. Response: $TOKEN_RESPONSE"
  exit 1
fi

log "Login verification successful!"

# Clean up
log "Cleaning up temporary files..."
rm -f /tmp/demo-user.csv

log "Migration complete! The demo user has been successfully migrated to Keycloak."
log "IMPORTANT: Remember to deprecate or delete the old local demo user in Postiz once Keycloak login is confirmed in production."
