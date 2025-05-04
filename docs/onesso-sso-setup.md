# Onesso (Keycloak) SSO Provider Setup

This document provides instructions for setting up and using the Onesso (Keycloak) SSO provider in both development and production environments.

## Development Setup

### 1. Start the Development Environment

Use the provided `docker-compose.override.yml` file to start the development environment with Keycloak:

```bash
docker-compose -f docker-compose.dev.yaml -f docker-compose.override.yml up -d
```

This will start the following services:
- Postgres database
- Redis
- RedisInsight
- Keycloak server

### 2. Initialize Keycloak

Run the initialization script to create the realm, client, and test user:

```bash
./scripts/init-keycloak.sh
```

This script will:
- Create a `postiz-realm` realm
- Create a `postiz-client` client with the appropriate redirect URIs
- Create a test user with username `demo` and password `demo`

### 3. Test the SSO Login

1. Navigate to the login page at `http://localhost:3000/auth/login`
2. Click the "Sign in with Onesso" button
3. You will be redirected to the Keycloak login page
4. Log in with the test user credentials (username: `demo`, password: `demo`)
5. You will be redirected back to the application and logged in

## Production Setup

For production deployment, you have two options:

### Option 1: Use the Onesso Dockerfile

Build a custom Docker image that includes the Onesso provider:

```bash
docker build -f Dockerfile.onesso -t postiz-onesso .
```

Then deploy this image to your production environment.

### Option 2: Use Volume Mounts

Mount the Onesso provider files into your existing Docker container:

```yaml
services:
  postiz-production:
    volumes:
      - ./apps/backend/src/services/auth/providers/onesso.provider.ts:/app/apps/backend/src/services/auth/providers/onesso.provider.ts
      - ./apps/backend/src/services/auth/providers/providers.factory.ts:/app/apps/backend/src/services/auth/providers/providers.factory.ts
    environment:
      - ONESSO_BASE_URL=https://keycloak.your-domain.com
      - ONESSO_REALM=your-realm
      - ONESSO_CLIENT_ID=your-client-id
      - ONESSO_CLIENT_SECRET=your-client-secret
      - ONESSO_REDIRECT_URI=https://your-app.com/auth/onesso/callback
```

## Environment Variables

The Onesso provider requires the following environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `ONESSO_BASE_URL` | The base URL of your Keycloak server | `http://keycloak:8080` |
| `ONESSO_REALM` | The Keycloak realm to use | `postiz-realm` |
| `ONESSO_CLIENT_ID` | The client ID for your application | `postiz-client` |
| `ONESSO_CLIENT_SECRET` | The client secret for your application | `changeme` |
| `ONESSO_REDIRECT_URI` | The redirect URI after successful authentication | `${FRONTEND_URL}/auth/onesso/callback` |

## Keycloak Configuration

### Creating a New Realm

1. Log in to the Keycloak Admin Console
2. Click "Add realm" in the dropdown menu
3. Enter a name for your realm (e.g., `postiz-realm`)
4. Click "Create"

### Creating a New Client

1. Navigate to "Clients" in the left sidebar
2. Click "Create"
3. Enter a Client ID (e.g., `postiz-client`)
4. Set "Client Protocol" to "openid-connect"
5. Set "Access Type" to "confidential"
6. Set "Valid Redirect URIs" to your callback URL (e.g., `https://your-app.com/auth/onesso/callback`)
7. Click "Save"
8. Go to the "Credentials" tab to get your client secret

### Creating Test Users

1. Navigate to "Users" in the left sidebar
2. Click "Add user"
3. Fill in the user details
4. Click "Save"
5. Go to the "Credentials" tab
6. Set a password for the user
7. Disable "Temporary" if you want the password to be permanent
8. Click "Set Password"

## Authentication Flow

The Onesso authentication flow works as follows:

1. User clicks "Sign in with Onesso" on the login page
2. User is redirected to the Keycloak login page
3. User enters their credentials
4. Keycloak validates the credentials and redirects back to the application with an authorization code
5. The application exchanges the authorization code for an access token
6. The application uses the access token to get the user's information
7. If the user exists in the database, they are logged in
8. If the user doesn't exist, they are prompted to register

For a detailed sequence diagram of the authentication flow, see [auth-flow-diagram.md](auth-flow-diagram.md).

## Troubleshooting

### CORS Issues

If you encounter CORS issues, make sure your Keycloak server is configured to allow requests from your application's domain:

1. In the Keycloak Admin Console, go to your realm
2. Navigate to "Realm Settings" > "Security Defenses" > "CORS"
3. Add your application's domain to the "Web Origins" field

### Redirect URI Issues

If you get a "Invalid redirect URI" error, make sure the redirect URI in your application matches the one configured in Keycloak:

1. In the Keycloak Admin Console, go to your realm
2. Navigate to "Clients" > your client
3. Check the "Valid Redirect URIs" field
4. Make sure it matches the `ONESSO_REDIRECT_URI` environment variable in your application

### Token Issues

If you have issues with tokens, check the following:

1. Make sure your client secret is correct
2. Check that your client is set to "confidential" access type
3. Verify that the user has the necessary roles and permissions in Keycloak
