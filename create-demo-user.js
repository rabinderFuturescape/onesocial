const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

async function createDemoUser() {
  // Set the DATABASE_URL environment variable
  process.env.DATABASE_URL = "postgresql://postiz-local:postiz-local-pwd@localhost:5432/postiz-db-local";

  console.log('Connecting to database...');
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  try {
    // Check if demo user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        email: 'demo',
      },
    });

    if (existingUser) {
      console.log('Demo user already exists');
      return;
    }

    // Create organization and user
    const result = await prisma.organization.create({
      data: {
        name: 'Demo Organization',
        apiKey: bcrypt.hashSync('demo-api-key', 10),
        allowTrial: true,
        users: {
          create: {
            role: 'SUPERADMIN',
            user: {
              create: {
                activated: true,
                email: 'demo',
                password: bcrypt.hashSync('demo', 10),
                providerName: 'LOCAL',
                providerId: '',
                timezone: 0,
                ip: '127.0.0.1',
                agent: 'Demo User Agent',
              },
            },
          },
        },
      },
      select: {
        id: true,
        users: {
          select: {
            user: true,
          },
        },
      },
    });

    console.log('Demo user created successfully:', result);
  } catch (error) {
    console.error('Error creating demo user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDemoUser();
