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

  let demoEventId: string | null = null;

  if (driver && sprinter) {
    const demoEvent = await prisma.event.upsert({
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

    demoEventId = demoEvent.id;

    await prisma.eventChecklist.upsert({
      where: { eventId: demoEvent.id },
      update: {},
      create: {
        eventId: demoEvent.id,
        carWashed: true,
        decorated: false,
        driverConfirmed: true,
        fuel: false,
        documentation: false,
      },
    });
  }

  await prisma.companySettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      legalName: 'LimoFlow Serviços de Limousine Ltda.',
      tradeName: 'LimoFlow',
      cnpj: '12345678000199',
      street: 'Rua das Flores',
      number: '100',
      complement: 'Sala 2',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01001000',
      phone: '1133334444',
      email: 'contato@limoflow.com',
    },
  });

  const demoProposal = await prisma.proposal.upsert({
    where: { id: '00000000-0000-4000-8000-000000000201' },
    update: {},
    create: {
      id: '00000000-0000-4000-8000-000000000201',
      value: 4500,
      hours: 4,
      mileage: 80,
      status: 'ACCEPTED',
      clientId: demoClient.id,
      vehicleId: sprinter?.id ?? null,
    },
  });

  await prisma.proposalTramite.deleteMany({
    where: { proposalId: demoProposal.id },
  });
  await prisma.proposalTramite.createMany({
    data: [
      {
        proposalId: demoProposal.id,
        type: 'GENERATED',
        description: 'Proposta criada no sistema.',
      },
      {
        proposalId: demoProposal.id,
        type: 'SENT',
        description: 'Proposta enviada ao casal por WhatsApp.',
      },
      {
        proposalId: demoProposal.id,
        type: 'ACCEPTED',
        description: 'Casal confirmou o orçamento.',
      },
      {
        proposalId: demoProposal.id,
        type: 'CONTRACT_CREATED',
        description: 'Contrato gerado a partir da proposta aceita.',
      },
    ],
  });

  await prisma.contract.upsert({
    where: { id: '00000000-0000-4000-8000-000000000301' },
    update: {},
    create: {
      id: '00000000-0000-4000-8000-000000000301',
      content:
        'Contrato demo para Ana & Pedro — serviço de limousine no casamento de 15/12/2026.',
      clientId: demoClient.id,
      proposalId: demoProposal.id,
    },
  });

  await prisma.proposal.upsert({
    where: { id: '00000000-0000-4000-8000-000000000202' },
    update: {},
    create: {
      id: '00000000-0000-4000-8000-000000000202',
      value: 3200,
      hours: 3,
      status: 'WAITING',
      clientId: demoClient.id,
      vehicleId: sprinter?.id ?? null,
    },
  });

  await prisma.proposalTramite.deleteMany({
    where: { proposalId: '00000000-0000-4000-8000-000000000202' },
  });
  await prisma.proposalTramite.createMany({
    data: [
      {
        proposalId: '00000000-0000-4000-8000-000000000202',
        type: 'GENERATED',
        description: 'Proposta criada no sistema.',
      },
      {
        proposalId: '00000000-0000-4000-8000-000000000202',
        type: 'SENT',
        description: 'Proposta enviada ao casal.',
      },
      {
        proposalId: '00000000-0000-4000-8000-000000000202',
        type: 'WAITING',
        description: 'Aguardando retorno do casal.',
      },
    ],
  });

  await prisma.payment.upsert({
    where: { id: '00000000-0000-4000-8000-000000000401' },
    update: {},
    create: {
      id: '00000000-0000-4000-8000-000000000401',
      amount: 1500,
      type: 'DEPOSIT',
      status: 'PAID',
      method: 'PIX',
      paidAt: new Date('2026-08-01T12:00:00.000Z'),
      clientId: demoClient.id,
      eventId: demoEventId,
    },
  });

  await prisma.payment.upsert({
    where: { id: '00000000-0000-4000-8000-000000000402' },
    update: {},
    create: {
      id: '00000000-0000-4000-8000-000000000402',
      amount: 3000,
      type: 'BALANCE',
      status: 'PENDING',
      dueDate: new Date('2026-12-01T00:00:00.000Z'),
      clientId: demoClient.id,
      eventId: demoEventId,
    },
  });

  console.log(
    'Seed concluído: usuários, veículos, parâmetros da empresa, cliente, evento, checklist, propostas, contrato e pagamentos demo.',
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
