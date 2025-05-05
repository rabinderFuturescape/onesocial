# Keycloak Integration Guide

This guide provides comprehensive instructions for configuring and using Keycloak (Onesso) as an authentication provider in the Postiz application.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Architecture](#architecture)
4. [Local Development Setup](#local-development-setup)
5. [Production Setup](#production-setup)
6. [Configuration Options](#configuration-options)
7. [User Migration](#user-migration)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)
10. [Advanced Configuration](#advanced-configuration)
11. [Security Considerations](#security-considerations)

## Overview

Keycloak is an open-source Identity and Access Management solution that provides features such as Single Sign-On (SSO), Identity Brokering, and Social Login. In this project, Keycloak is integrated as an authentication provider under the name "Onesso".

The integration allows users to:
- Sign in using Keycloak credentials
- Register new accounts through Keycloak
- Use existing accounts migrated from the application's database

## Prerequisites

Before setting up Keycloak integration, ensure you have:

- Docker and Docker Compose installed
- Node.js (v14 or later) and npm installed
- Basic understanding of OAuth 2.0 and OpenID Connect
- Access to the project repository

## Architecture

The Keycloak integration consists of the following components:

1. **Keycloak Server**: Runs as a Docker container alongside the application
2. **Backend Integration**: Implemented in `apps/backend/src/services/auth/providers/onesso.provider.ts`
3. **Frontend Integration**: Implemented in `apps/frontend/src/app/auth/onesso/callback/page.tsx`
4. **Mock Provider**: For development and testing without a running Keycloak server

The authentication flow works as follows:

1. User clicks "Sign in with Onesso" on the login page
2. User is redirected to Keycloak for authentication
3. After successful authentication, Keycloak redirects back to the application with an authorization code
4. The application exchanges the code for an access token
5. The application uses the token to fetch user information
6. The user is signed in to the application

## Local Development Setup

### Step 1: Create the Docker Network

```bash
docker network create postiz-network
```

### Step 2: Start the Development Environment

```bash
docker-compose -f docker-compose.dev.yaml -f docker-compose.override.yml up -d
```

This will start:
- Postgres database
- Redis
- Keycloak server
- The application

### Step 3: Initialize Keycloak

```bash
./scripts/init-keycloak.sh
```

This script:
- Waits for Keycloak to start
- Creates a realm named "postiz-realm"
- Creates a client named "postiz-client"
- Creates a test user (username: demo, password: demo)

### Step 4: Migrate Demo User (Optional)

If you want to migrate an existing user from the database to Keycloak:

```bash
./scripts/migrate-demo-user.sh
```

### Step 5: Enable Mock Provider for Development (Optional)

For development without a running Keycloak server, you can use the mock provider:

```bash
# Add to your .env file
USE_MOCK_KEYCLOAK=true

# Or use the toggle script
./scripts/toggle-mock-keycloak.sh
```

## Production Setup

For production deployment, you have two options:

### Option 1: Dev-Style Volume Mount

Use the `docker-compose.override.yml` file to mount the Onesso provider files into the container:

```yaml
services:
  postiz-production:
    volumes:
      - ./apps/backend/src/services/auth/providers/onesso.provider.ts:/app/apps/backend/src/services/auth/providers/onesso.provider.ts
      - ./apps/backend/src/services/auth/providers/providers.factory.ts:/app/apps/backend/src/services/auth/providers/providers.factory.ts
    environment:
      - ONESSO_BASE_URL=http://keycloak:8080
      - ONESSO_REALM=postiz-realm
      - ONESSO_CLIENT_ID=postiz-client
      - ONESSO_CLIENT_SECRET=changeme
      - ONESSO_REDIRECT_URI=http://example.com/auth/onesso/callback
```

### Option 2: Immutable Image + Rolling Replace

1. Build a patched Docker image:

```bash
docker build -f Dockerfile.patch -t ghcr.io/gitroomhq/postiz-app:onesso .
```

2. Push the image to the registry:

```bash
docker push ghcr.io/gitroomhq/postiz-app:onesso
```

3. Deploy using the production Docker Compose file:

```bash
docker-compose -f docker-compose.production.yml up -d
```

## Configuration Options

The Keycloak integration can be configured using the following environment variables:

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `ONESSO_BASE_URL` | Base URL of the Keycloak server | `http://keycloak:8080` |
| `ONESSO_REALM` | Keycloak realm name | `postiz-realm` |
| `ONESSO_CLIENT_ID` | Keycloak client ID | `postiz-client` |
| `ONESSO_CLIENT_SECRET` | Keycloak client secret | `changeme` |
| `ONESSO_REDIRECT_URI` | Redirect URI after authentication | `http://localhost:3000/auth/onesso/callback` |
| `USE_MOCK_KEYCLOAK` | Use mock provider instead of real Keycloak | `false` |

## User Migration

To migrate existing users from the application database to Keycloak, use the `migrate-demo-user.sh` script:

```bash
./scripts/migrate-demo-user.sh
```

This script:
1. Exports user data from the Postgres database
2. Creates or updates the user in Keycloak
3. Verifies that the login works

For custom migration scenarios, you can modify the script or create a new one based on your requirements.

## Testing

### Testing with Mock Provider

For testing without a running Keycloak server, use the mock provider:

```bash
# Enable mock provider
export USE_MOCK_KEYCLOAK=true
docker-compose restart backend

# Test login
curl http://localhost:3000/auth/onesso
```

### Testing with Real Keycloak

To test with a real Keycloak server:

```bash
# Disable mock provider
export USE_MOCK_KEYCLOAK=false
docker-compose restart backend

# Test login
curl http://localhost:3000/auth/onesso
```

## Troubleshooting

### Common Issues

#### 1. Can't reach database server

If you encounter a database connection error:

```
Can't reach database server at `postiz-postgres:5432`
```

Run the database connection fix script:

```bash
./scripts/fix-database-connection.sh
```

#### 2. Keycloak not starting

If Keycloak fails to start, check the logs:

```bash
docker logs keycloak
```

Common issues include:
- Database connection problems
- Port conflicts
- Insufficient memory

#### 3. Authentication fails

If authentication fails, check:
- Keycloak logs
- Application logs
- Network connectivity between containers
- Environment variables configuration

## Advanced Configuration

### Custom Themes

To use a custom theme for Keycloak:

1. Create a theme directory:

```bash
mkdir -p themes/custom
```

2. Add your theme files to the directory

3. Mount the theme directory in the Keycloak container:

```yaml
services:
  keycloak:
    volumes:
      - ./themes:/opt/keycloak/themes
```

### Identity Brokering

To enable identity brokering (allowing users to sign in with external providers like Google or GitHub):

1. Log in to the Keycloak admin console
2. Go to Identity Providers
3. Add a new provider
4. Configure the provider with the required credentials
5. Test the integration

### Multi-Realm Setup

For multi-tenant applications, you can create multiple realms in Keycloak:

1. Create a new realm in Keycloak
2. Create a client for each realm
3. Update the application to use the appropriate realm based on the tenant

## Security Considerations

### Production Deployment

For production deployment, ensure:

1. **HTTPS**: Always use HTTPS for production deployments
2. **Secure Passwords**: Use strong passwords for admin accounts
3. **Client Secrets**: Use unique client secrets for each environment
4. **Access Control**: Restrict access to the Keycloak admin console
5. **Regular Updates**: Keep Keycloak updated to the latest version

### Token Handling

When handling tokens:

1. **Never store tokens in localStorage**: Use HTTP-only cookies instead
2. **Validate tokens**: Always validate tokens on the server side
3. **Short-lived tokens**: Use short-lived access tokens and refresh tokens
4. **Secure token exchange**: Use secure channels for token exchange

## Conclusion

This guide provides a comprehensive overview of integrating Keycloak with the Postiz application. By following these instructions, you can set up a secure authentication system using Keycloak as an identity provider.

For more information, refer to:
- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [OpenID Connect Specification](https://openid.net/specs/openid-connect-core-1_0.html)
- [OAuth 2.0 Specification](https://oauth.net/2/)
