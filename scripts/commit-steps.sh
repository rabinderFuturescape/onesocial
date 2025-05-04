#!/bin/bash

# Script to commit each step of the Onesso SSO provider implementation

# Step 1: Commit the Onesso provider implementation
git add apps/backend/src/services/auth/providers/onesso.provider.ts
git add apps/backend/src/services/auth/providers/providers.factory.ts
git add libraries/nestjs-libraries/src/database/prisma/schema.prisma
git add libraries/nestjs-libraries/src/database/prisma/migrations/*_add_onesso_provider
git commit -m "Step 1: Implement Onesso SSO provider backend"

# Step 2: Commit the frontend components
git add apps/frontend/src/components/auth/providers/onesso.provider.tsx
git add apps/frontend/src/components/auth/login.tsx
git add apps/frontend/src/components/auth/register.tsx
git add apps/frontend/src/app/auth/onesso/callback/page.tsx
git commit -m "Step 2: Implement Onesso SSO provider frontend components"

# Step 3: Commit the Docker configuration
git add Dockerfile.patch
git add Dockerfile.local
git add docker-compose.override.yml
git add docker-compose.production.yml
git add docker-compose.onesso.yml
git commit -m "Step 3: Add Docker configuration for Onesso SSO provider"

# Step 4: Commit the scripts and documentation
git add scripts/init-keycloak.sh
git add scripts/build-local-onesso-image.sh
git add scripts/rolling-update.sh
git add scripts/test-jwt-login.sh
git add scripts/test-keycloak-login.sh
git add scripts/run-health-checks.sh
git add scripts/smoke-test.sh
git add scripts/commit-steps.sh
git add docs/onesso-sso-setup.md
git add docs/auth-flow-diagram.md
git add docs/authentication-providers.md
git commit -m "Step 4: Add scripts and documentation for Onesso SSO provider"

echo "All steps committed successfully!"
