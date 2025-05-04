#!/bin/bash

# Wait for Keycloak to start
echo "Waiting for Keycloak to start..."
until curl -s http://localhost:8080 > /dev/null; do
  sleep 5
done

# Get admin token
echo "Getting admin token..."
ADMIN_TOKEN=$(curl -s -X POST http://localhost:8080/realms/master/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin" \
  -d "password=admin" \
  -d "grant_type=password" \
  -d "client_id=admin-cli" | jq -r '.access_token')

# Create realm
echo "Creating postiz-realm..."
curl -s -X POST http://localhost:8080/admin/realms \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "realm": "postiz-realm",
    "enabled": true,
    "displayName": "Postiz Realm",
    "registrationAllowed": true,
    "resetPasswordAllowed": true,
    "loginWithEmailAllowed": true,
    "duplicateEmailsAllowed": false,
    "sslRequired": "external"
  }'

# Create client
echo "Creating postiz-client..."
curl -s -X POST http://localhost:8080/admin/realms/postiz-realm/clients \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "postiz-client",
    "name": "Postiz Client",
    "enabled": true,
    "protocol": "openid-connect",
    "publicClient": false,
    "redirectUris": ["http://localhost:3000/auth/onesso/callback"],
    "webOrigins": ["http://localhost:3000"],
    "standardFlowEnabled": true,
    "implicitFlowEnabled": false,
    "directAccessGrantsEnabled": true,
    "serviceAccountsEnabled": true,
    "authorizationServicesEnabled": true,
    "secret": "changeme"
  }'

# Create test user
echo "Creating test user..."
curl -s -X POST http://localhost:8080/admin/realms/postiz-realm/users \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "demo",
    "email": "demo@example.com",
    "firstName": "Demo",
    "lastName": "User",
    "enabled": true,
    "emailVerified": true,
    "credentials": [
      {
        "type": "password",
        "value": "demo",
        "temporary": false
      }
    ]
  }'

echo "Keycloak initialization complete!"
