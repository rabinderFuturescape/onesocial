#!/bin/bash

# Comprehensive smoke test script

echo "Starting comprehensive smoke test..."
echo "===================================="
echo ""

# Step 1: Ensure existing JWT logins still work
echo "Step 1: Testing JWT login functionality"
echo "--------------------------------------"
./scripts/test-jwt-login.sh
echo ""

# Step 2: Test Keycloak login and user provisioning
echo "Step 2: Testing Keycloak login and user provisioning"
echo "---------------------------------------------------"
./scripts/test-keycloak-login.sh
echo ""

# Step 3: Run health checks
echo "Step 3: Running health checks"
echo "----------------------------"
./scripts/run-health-checks.sh
echo ""

echo "Smoke test completed!"
echo "===================="
