# Keycloak Authentication Flow

This document provides a visual representation of the authentication flow when using Keycloak (Onesso) as an authentication provider in the Postiz application.

## Authentication Flow Diagram

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Keycloak
    
    User->>Frontend: Click "Sign in with Onesso"
    Frontend->>Backend: Request auth URL
    Backend->>Frontend: Return auth URL
    Frontend->>Keycloak: Redirect to auth URL
    Keycloak->>User: Display login form
    User->>Keycloak: Enter credentials
    Keycloak->>Frontend: Redirect with auth code
    Frontend->>Backend: Exchange code for token
    Backend->>Keycloak: Request token
    Keycloak->>Backend: Return access token
    Backend->>Keycloak: Request user info
    Keycloak->>Backend: Return user info
    Backend->>Backend: Create/update user
    Backend->>Frontend: Return JWT token
    Frontend->>User: Display authenticated UI
```

## Detailed Flow Explanation

1. **User Initiates Login**:
   - User clicks "Sign in with Onesso" on the login page
   - Frontend requests an authentication URL from the backend

2. **Redirect to Keycloak**:
   - Backend generates an authentication URL using the Keycloak configuration
   - Frontend redirects the user to the Keycloak login page

3. **User Authentication**:
   - User enters their credentials on the Keycloak login page
   - Keycloak validates the credentials
   - If valid, Keycloak generates an authorization code

4. **Callback Processing**:
   - Keycloak redirects back to the application's callback URL with the authorization code
   - Frontend sends the code to the backend

5. **Token Exchange**:
   - Backend exchanges the authorization code for an access token
   - Backend uses the access token to fetch user information from Keycloak

6. **User Creation/Update**:
   - Backend creates a new user or updates an existing user based on the information from Keycloak
   - Backend generates a JWT token for the user

7. **Authentication Complete**:
   - Backend returns the JWT token to the frontend
   - Frontend stores the token and displays the authenticated UI

## Mock Provider Flow

When using the mock provider (`USE_MOCK_KEYCLOAK=true`), the flow is simplified:

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant MockProvider
    
    User->>Frontend: Click "Sign in with Onesso"
    Frontend->>Backend: Request auth URL
    Backend->>MockProvider: Generate auth URL
    MockProvider->>Backend: Return mock callback URL
    Backend->>Frontend: Return mock callback URL
    Frontend->>Backend: Redirect to callback URL
    Backend->>MockProvider: Exchange mock code for token
    MockProvider->>Backend: Return mock token
    Backend->>MockProvider: Get user info
    MockProvider->>Backend: Return mock user info
    Backend->>Backend: Create/update user
    Backend->>Frontend: Return JWT token
    Frontend->>User: Display authenticated UI
```

In this flow, the mock provider bypasses the actual Keycloak server and returns predefined values, allowing for development and testing without a running Keycloak server.
