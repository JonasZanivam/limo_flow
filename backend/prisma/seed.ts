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

  const driver = await prisma.user.findUnique({
    where: { email: driverEmail },
    select: { id: true },
  });

  const sprinter = await prisma.vehicle.findUnique({
    where: { plate: 'ABC1D23' },
    select: { id: true },
  });

  const demoClient = await prisma.client.upsert({
    where: { id: '00000000-0000-4000-8000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-4000-8000-000000000001',
      brideName: 'Ana',
      groomName: 'Pedro',
      phones: ['11999990000'],
      email: 'ana.pedro@example.com',
      weddingDate: new Date('2026-12-15T00:00:00.000Z'),
      church: 'Igreja São José',
      venue: 'Espaço Jardim',
    },
  });

  if (driver && sprinter) {
    await prisma.event.upsert({
      where: { id: '00000000-0000-4000-8000-000000000101' },
      update: {},
      create: {
        id: '00000000-0000-4000-8000-000000000101',
        startAt: new Date('2026-12-15T14:00:00.000Z'),
        endAt: new Date('2026-12-15T18:00:00.000Z'),
        status: 'CONFIRMED',
        church: 'Igreja São José',
        venue: 'Espaço Jardim',
        clientId: demoClient.id,
        vehicleId: sprinter.id,
        driverId: driver.id,
      },
    });
  }

  console.log(
    'Seed concluído: usuários admin/motorista, veículos, cliente e evento demo.',
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
