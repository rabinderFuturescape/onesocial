# Mock Onesso Provider

This document provides instructions for using the mock Onesso (Keycloak) SSO provider for development and testing.

## Overview

The mock Onesso provider allows you to develop and test the Onesso SSO integration without requiring a running Keycloak server. It provides a simplified authentication flow that bypasses the actual OAuth process and returns predefined values.

## How It Works

1. The mock provider is enabled by setting the `USE_MOCK_KEYCLOAK` environment variable to `true`.
2. When enabled, the `ProvidersFactory` will return the `MockOnessoProvider` instead of the real `OnessoProvider`.
3. The mock provider:
   - Returns a direct callback URL instead of redirecting to Keycloak
   - Always returns a fixed access token
   - Returns a predefined user record

## Usage

### Enabling the Mock Provider

To enable the mock provider, set the `USE_MOCK_KEYCLOAK` environment variable to `true` before starting the application:

```bash
# In your .env file
USE_MOCK_KEYCLOAK=true
```

Or when starting the application:

```bash
USE_MOCK_KEYCLOAK=true docker-compose up -d backend
```

### Testing the Mock Flow

1. Start the application with the mock provider enabled:
   ```bash
   USE_MOCK_KEYCLOAK=true docker-compose up -d
   ```

2. Navigate to the login page and click the "Sign in with Onesso" button.

3. You should be automatically redirected through the mock authentication flow and logged in as the mock user (`demo@example.com`).

4. Check the backend logs to confirm that `MockOnessoProvider.getUser()` was invoked:
   ```bash
   docker-compose logs backend | grep "MockOnessoProvider"
   ```

### Switching Back to the Real Provider

To switch back to the real Onesso provider, simply unset the environment variable and restart the application:

```bash
# Remove from .env file or
unset USE_MOCK_KEYCLOAK
docker-compose up -d backend
```

## Mock User

The mock provider returns the following user information:

```json
{
  "id": "mock-user-id",
  "email": "demo@example.com"
}
```

## Development Notes

- The mock provider implements the same interface as the real provider, ensuring compatibility.
- The stub Next.js API routes in `pages/api/auth/onesso.ts` and `pages/api/auth/onesso/callback.ts` provide a simplified frontend flow for development.
- Tests for the mock provider are available in `apps/backend/src/services/auth/providers/mock-onesso.provider.test.ts`.

## Best Practices

- Use the mock provider during development to avoid dependencies on external services.
- Write tests against both the mock and real providers to ensure compatibility.
- Use feature flags like `USE_MOCK_KEYCLOAK` for all external dependencies in development mode.
- Keep the mock provider updated when changes are made to the real provider interface.
