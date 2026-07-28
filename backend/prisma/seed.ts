import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@limoflow.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'admin123';
  const driverEmail = process.env.SEED_DRIVER_EMAIL ?? 'motorista@limoflow.com';
  const driverPassword = process.env.SEED_DRIVER_PASSWORD ?? 'driver123';

  const adminHash = await bcrypt.hash(adminPassword, 10);
  const driverHash = await bcrypt.hash(driverPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: 'Administrador',
      email: adminEmail,
      password: adminHash,
      role: 'ADMIN',
    },
  });

  await prisma.user.upsert({
    where: { email: driverEmail },
    update: {},
    create: {
      name: 'Motorista Demo',
      email: driverEmail,
      password: driverHash,
      role: 'DRIVER',
    },
  });

  const vehicles = [
    { plate: 'ABC1D23', model: 'Mercedes-Benz Sprinter Luxo', capacity: 12 },
    { plate: 'DEF4G56', model: 'Cadillac Escalade', capacity: 6 },
  ];

  for (const vehicle of vehicles) {
    await prisma.vehicle.upsert({
      where: { plate: vehicle.plate },
      update: {},
      create: vehicle,
    });
  }

  console.log('Seed concluído: usuários admin/motorista e veículos demo.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
