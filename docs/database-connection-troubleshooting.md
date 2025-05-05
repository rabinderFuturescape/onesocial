# Database Connection Troubleshooting

This document provides information about common database connection issues and their solutions.

## Issue: "Can't reach database server at `postiz-postgres:5432`"

### Symptoms

When attempting to sign in, you might encounter the following error:

```
Invalid `this._user.model.user.findFirst()` invocation in /app/dist/apps/backend/main.js:1404:38
1401 });
1402 }
1403 getUserByEmail(email) {
→ 1404 return this._user.model.user.findFirst(
Can't reach database server at `postiz-postgres:5432`
Please make sure your database server is running at `postiz-postgres:5432`.
```

### Cause

This issue can occur due to several reasons:

1. **Missing DATABASE_URL Environment Variable**: The application container doesn't have the DATABASE_URL environment variable set in the docker-compose.override.yml file.

2. **Prisma Schema Conflict**: When the application tries to run, Prisma attempts to push its schema to the database, but it encounters conflicts with the Keycloak tables that are already in the database.

3. **Network Connectivity Issues**: The application container can't reach the Postgres container on the network.

### Solution

#### Automated Fix

We've created a script that automates the process of fixing database connection issues. Run the following command:

```bash
./scripts/fix-database-connection.sh [container-name] [schema-path]
```

By default, the script uses:
- Container name: `onesocial_original_v2-postiz-production-1`
- Schema path: `/app/libraries/nestjs-libraries/src/database/prisma/schema.prisma`

You can provide your own values if needed:

```bash
./scripts/fix-database-connection.sh my-container-name /path/to/schema.prisma
```

#### Manual Fix

If you prefer to fix the issue manually, follow these steps:

##### 1. Ensure DATABASE_URL is set in docker-compose.override.yml

Make sure the docker-compose.override.yml file includes the DATABASE_URL environment variable:

```yaml
services:
  postiz-production:
    environment:
      - DATABASE_URL=postgresql://postiz-local:postiz-local-pwd@postiz-postgres:5432/postiz-db-local?schema=public
      - REDIS_URL=redis://postiz-redis:6379
      # Other environment variables...
```

##### 2. Force Prisma Migration if there are conflicts

If Prisma is encountering conflicts with existing tables (like Keycloak tables), you can force the migration with the `--accept-data-loss` flag:

```bash
docker exec <container-name> npx prisma db push --accept-data-loss --schema=/app/libraries/nestjs-libraries/src/database/prisma/schema.prisma
```

##### 3. Restart the Application

After making these changes, restart the application container:

```bash
docker restart <container-name>
```

### Long-term Solutions

For a more permanent solution, consider:

1. **Using a Separate Database for Keycloak**: This would prevent conflicts between the application's Prisma schema and Keycloak's tables.

2. **Modifying the Prisma Schema**: You could modify the Prisma schema to exclude the Keycloak tables, or to use a different schema within the same database.

3. **Using Database Migrations**: Instead of using `prisma db push`, you could use `prisma migrate` to have more control over the database schema changes.

## Related Documentation

- [Prisma Documentation](https://www.prisma.io/docs/)
- [Docker Networking](https://docs.docker.com/network/)
- [Keycloak Documentation](https://www.keycloak.org/documentation)
