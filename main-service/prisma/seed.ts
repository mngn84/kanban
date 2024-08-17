import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const roundsOfHashing = 10;

async function main() {

  const user1 = await prisma.user.upsert({
    where: { email: 'sabin@adams.com' },
    update: {
      email: 'sabin@adams.com',
      name: 'Sabin Adams',
        },
    create: {
      email: 'sabin@adams.com',
      name: 'Sabin Adams',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'alex@ruheni.com' },
    update: {
      email: 'alex@ruheni.com',
      name: 'Alex Ruheni',
    },
    create: {
      email: 'alex@ruheni.com',
      name: 'Alex Ruheni',
    },
  });
  const admin = await prisma.user.upsert({
    where: { email: 'admin@admin.com' },
    update: {
      email: 'admin@admin.com',
      name: 'admin',
    },
    create: {
      email: 'admin@admin.com',
      name: 'admin',
    },
  });
}

main();
