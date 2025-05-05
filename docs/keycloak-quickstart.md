# Keycloak Integration Quick Start Guide

This quick start guide will help you set up Keycloak (Onesso) authentication in the Postiz application.

## Prerequisites

- Docker and Docker Compose installed
- Git repository cloned

## Step 1: Create the Docker Network

```bash
docker network create postiz-network
```

## Step 2: Start the Development Environment

```bash
docker-compose -f docker-compose.dev.yaml -f docker-compose.override.yml up -d
```

## Step 3: Initialize Keycloak

```bash
./scripts/init-keycloak.sh
```

## Step 4: Test the Integration

1. Open your browser and navigate to http://localhost:3000
2. Click "Sign in with Onesso"
3. You should be redirected to the Keycloak login page
4. Log in with the demo user (username: demo, password: demo)
5. You should be redirected back to the application and signed in

## Using the Mock Provider (Optional)

For development without a running Keycloak server:

```bash
# Enable mock provider
./scripts/toggle-mock-keycloak.sh

# Test login
curl http://localhost:3000/auth/onesso
```

## Configuration

The Keycloak integration can be configured using the following environment variables:

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `ONESSO_BASE_URL` | Base URL of the Keycloak server | `http://keycloak:8080` |
| `ONESSO_REALM` | Keycloak realm name | `postiz-realm` |
| `ONESSO_CLIENT_ID` | Keycloak client ID | `postiz-client` |
| `ONESSO_CLIENT_SECRET` | Keycloak client secret | `changeme` |
| `ONESSO_REDIRECT_URI` | Redirect URI after authentication | `http://localhost:3000/auth/onesso/callback` |
| `USE_MOCK_KEYCLOAK` | Use mock provider instead of real Keycloak | `false` |

## Troubleshooting

If you encounter any issues, check:

1. Docker container logs:
```bash
docker logs keycloak
docker logs onesocial_original_v2-postiz-production-1
```

2. Database connection:
```bash
./scripts/fix-database-connection.sh
```

3. Keycloak admin console:
```
http://localhost:8080/admin
Username: admin
Password: admin
```

## Next Steps

For more detailed information, refer to the [Keycloak Integration Guide](keycloak-integration-guide.md).
