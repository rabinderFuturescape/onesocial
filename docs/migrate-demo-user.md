# Migrate Demo User to Keycloak

This document provides detailed information about the `scripts/migrate-demo-user.sh` script, which automates the process of migrating the existing demo user from the Postgres database into Keycloak.

## Overview

When transitioning from local authentication to Keycloak SSO, you need to ensure that existing users can still log in. This script specifically handles the migration of the demo user (`demo@exampler.com`) to Keycloak, ensuring a smooth transition.

## Prerequisites

- Running Keycloak instance (accessible at `http://localhost:8080` by default)
- Running Postgres database with the Postiz schema
- `curl` and `jq` installed on the system
- Either `psql` client or Docker with the Postgres container running

## Configuration

The script uses environment variables for configuration. All variables have default values, but you can override them as needed:

| Environment Variable | Default Value | Description |
|----------------------|---------------|-------------|
| `KEYCLOAK_URL` | `http://localhost:8080` | URL of the Keycloak server |
| `KEYCLOAK_ADMIN_USER` | `admin` | Keycloak admin username |
| `KEYCLOAK_ADMIN_PASSWORD` | `admin` | Keycloak admin password |
| `KEYCLOAK_REALM` | `postiz-realm` | Keycloak realm name |
| `POSTGRES_HOST` | `localhost` | Postgres host |
| `POSTGRES_PORT` | `5432` | Postgres port |
| `POSTGRES_USER` | `postiz-local` | Postgres username |
| `POSTGRES_PASSWORD` | `postiz-local-pwd` | Postgres password |
| `POSTGRES_DB` | `postiz-db-local` | Postgres database name |
| `DEMO_USER_EMAIL` | `demo@exampler.com` | Email of the demo user to migrate |
| `DEMO_USER_PASSWORD` | `demo` | Password to set for the demo user in Keycloak |

## Usage

### Basic Usage

Run the script with default settings:

```bash
./scripts/migrate-demo-user.sh
```

### Custom Settings

Override any of the environment variables as needed:

```bash
KEYCLOAK_URL="http://custom-keycloak:8080" \
POSTGRES_HOST="custom-postgres" \
DEMO_USER_EMAIL="custom@example.com" \
./scripts/migrate-demo-user.sh
```

## How It Works

The script performs the following steps:

1. **Preparation**:
   - Sets default values for environment variables
   - Checks if required commands (`curl`, `jq`) are installed

2. **Wait for Keycloak**:
   - Polls the Keycloak server until it's healthy
   - Authenticates with the admin CLI to get an access token

3. **Export User Data**:
   - Connects to the Postgres database
   - Exports the demo user data to a temporary CSV file
   - Parses the user details (ID, username, email)

4. **Import User to Keycloak**:
   - Checks if the user already exists in Keycloak
   - If the user exists, updates the password
   - If the user doesn't exist, creates a new user with the specified details

5. **Verify Login**:
   - Attempts to log in with the migrated user credentials
   - Verifies that the login is successful

6. **Clean Up**:
   - Removes temporary files
   - Displays a success message

## Error Handling

The script includes error handling for various scenarios:

- Exits immediately if any command fails (`set -e`)
- Checks if required commands are installed
- Verifies that Keycloak is accessible
- Ensures the admin authentication is successful
- Confirms that the demo user exists in the database
- Validates that the login verification is successful

## Notes

- The script is idempotent: if the user already exists in Keycloak, it will update the password instead of creating a new user.
- After successful migration, you should consider deprecating or deleting the old local demo user in Postiz once Keycloak login is confirmed in production.
- The script uses temporary files in the `/tmp` directory, which are cleaned up after execution.

## Troubleshooting

If you encounter issues:

1. **Keycloak Connection Issues**:
   - Ensure Keycloak is running and accessible at the specified URL
   - Check that the admin credentials are correct

2. **Postgres Connection Issues**:
   - Verify the Postgres connection details
   - Ensure the database contains a user with the specified email

3. **Permission Issues**:
   - Make sure the script is executable (`chmod +x scripts/migrate-demo-user.sh`)
   - Check that you have permission to connect to both Keycloak and Postgres

4. **Login Verification Fails**:
   - Ensure the Keycloak client is properly configured
   - Check that the client secret matches the one in the script
