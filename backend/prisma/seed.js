import { PrismaClient, Role, AppointmentState } from '@prisma/client'
import bcrypt from 'bcrypt'
import { addMinutes } from 'date-fns'

const prisma = new PrismaClient()

function createFixedTime(dateString, hour) {
  const date = new Date(dateString)
  date.setHours(hour, 0, 0, 0)
  return date
}

async function main() {
  console.log('🌱 Iniciando script de seed...')

  const hashedAdminPassword = await bcrypt.hash('admin123', 10)
  const hashedCustomerPassword = await bcrypt.hash('customer123', 10)


  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.es',
      name: 'Admin User',
      phone_number: '123456789',
      password: hashedAdminPassword,
      role: Role.ADMIN,
    },
  })

  const customerUserData = []
  for (let i = 0; i <= 25; i++) {
    const user = await prisma.user.upsert({
      where: { email: `customer${i}@example.com` },
      update: {},
      create: {
        email: `customer${i}@example.es`,
        name: `Customer ${i}`,
        phone_number: `000000${i}`,
        password: hashedCustomerPassword,
        role: Role.CUSTOMER,
      },
    })
    customerUserData.push(user)
  }

  console.log('✅ Usuarios (Admin + 26 Clientes) creados')

  const servicios = [
    {
      name: 'Masaje y Osteopatía',
      description:
        'El cuerpo es un sistema en constante ajuste. A través de técnicas de masaje y osteopatía, trabajamos para liberar restricciones y restaurar la armonía del cuerpo.',
    },
    {
      name: 'Par Biomagnético',
      description:
        'Terapia que utiliza imanes para equilibrar el cuerpo y mejorar el bienestar general.',
    },
    {
      name: 'Técnicas Emocionales',
      description:
        'Ayuda a liberar emociones atrapadas y equilibrar el cuerpo y la mente.',
    },
    {
      name: 'Asesoramiento Nutricional y Estilo de Vida',
      description:
        'Mejora tus hábitos y alimentación con un enfoque basado en la naturopatía.',
    },
    {
      name: 'VARS (Valoración, Análisis y Reequilibrio del Sistema)',
      description:
        'Valoración completa para analizar y reequilibrar el sistema corporal y energético.',
    },
    {
      name: 'Reiki',
      description:
        'Técnica energética para equilibrar la energía, reducir el estrés y favorecer la autocuración.',
    },
  ]

  for (const s of servicios) {
    await prisma.service.upsert({
      where: { name: s.name },
      update: s,
      create: s,
    })
  }

  console.log('✅ Servicios creados')

  // Obtener algunos servicios por nombre
  const [masaje, reiki, vars] = await prisma.service.findMany({
    where: {
      name: {
        in: ['Masaje y Osteopatía', 'Reiki', 'VARS (Valoración, Análisis y Reequilibrio del Sistema)'],
      },
    },
    select: { id: true, name: true },
  })

  // 🔹 Citas de ejemplo
  const citas = [
    {
      date: '2025-11-20',
      hour: 12,
      clientIndex: 1,
      serviceId: masaje.id,
      state: AppointmentState.CONFIRMED,
    },
    {
      date: '2025-11-20',
      hour: 18,
      clientIndex: 2,
      serviceId: vars.id,
      state: AppointmentState.PENDING,
    },
    {
      date: '2025-11-26',
      hour: 20,
      clientIndex: 3,
      serviceId: reiki.id,
      state: AppointmentState.COMPLETED,
    },
  ]

  for (const cita of citas) {
    const start = createFixedTime(cita.date, cita.hour)
    const end = addMinutes(start, 59)
    const appointment_date = new Date(cita.date)
    appointment_date.setHours(0, 0, 0, 0)

    await prisma.appointment.upsert({
      where: {
        appointment_date_start_time_clientId: {
          appointment_date,
          start_time: start,
          clientId: customerUserData[cita.clientIndex].id,
        },
      },
      update: { state: cita.state },
      create: {
        appointment_date,
        start_time: start,
        end_time: end,
        clientId: customerUserData[cita.clientIndex].id,
        serviceId: cita.serviceId,
        state: cita.state,
      },
    })
  }

  console.log('✅ Citas de ejemplo creadas')

  // 🔹 Bloqueos de ejemplo (sin upsert)
  const bloqueos = [
    {
      date: new Date('2025-11-27'),
      full_day: true,
      reason: 'Festivo local',
    },
    {
      date: new Date('2025-11-28'),
      full_day: false,
      start_time: createFixedTime('2025-11-28', 10),
      end_time: createFixedTime('2025-11-28', 12),
      reason: 'Mantenimiento',
    },
  ]

  for (const b of bloqueos) {
    const exists = await prisma.blockedSlot.findFirst({
      where: {
        date: b.date,
        full_day: b.full_day,
        start_time: b.start_time ?? null,
        end_time: b.end_time ?? null,
      },
    })

    if (exists) {
      await prisma.blockedSlot.update({
        where: { id: exists.id },
        data: b,
      })
    } else {
      await prisma.blockedSlot.create({ data: b })
    }
  }

  console.log('✅ Bloqueos de ejemplo creados')
  console.log('🎉 Seed completado correctamente')
}

const products = [
  "Crema de Ojos Nutritiva de HL",
  "Gel Limpiador Renovador de HL",
  "Herbalife Gels CoQ10Vita",
  "Herbalife Gels ViewVita",
  "Rebuild Strength de Herbalife24",
  "Loción Nutritiva para Manos y Cuerpo de HL/Skin",
  "Serúm con 10% de Niacinamida de HL/Skin",
  "Herbalife24 Prologn Gel Energético",
  "Herbalife Gels MindVita Kids",
  "Herbalife Gels NutrientVita Kids",
  "Herbalife24 Creatine+",
  "Bebida con Proteínas en Polvo",
  "Collagen Skin Booster",
  "Phyto Complete",
  "Formula 1 Alimento Equilibrado sabor Chocolate Cremoso",
  "Formula 1 Alimento Equilibrado sabor Galleta Crujiente",
  "Formula 1 Alimento Equilibrado sabor Crema de Vainilla",
  "Formula 1 Alimento Equilibrado sabor Delicia de Fresa",
  "Formula 1 Alimento Equilibrado sabor Frambuesa y Chocolate Blanco",
  "Formula 1 Alimento Equilibrado sabor Menta y Chocolate",
  "Formula 1 Alimento Equilibrado sabor Plátano",
  "Formula 1 Alimento Equilibrado sabor Café Latte",
  "Avena, Manzana y Fibra",
  "Bebida Instantánea de Extracto de Té con Plantas Aromáticas sabor Original",
  "Bebida Instantánea de Extracto de Té con Plantas Aromáticas sabor Durazno",
  "Bebida Instantánea de Extracto de Té con Plantas Aromáticas sabor Frambuesa",
  "Bebida Instantánea de Extracto de Té con Plantas Aromáticas sabor Limón",
  "Concentrado Herbal Aloe sabor Original",
  "Concentrado Herbal Aloe sabor Mango",
  "Formula 3 Polvo de Proteínas",
  "Herbalifeline Max",
  "Desayuno Saludable sabor Café Latte",
  "Desayuno Saludable sabor Galleta Crujiente",
  "Desayuno Saludable sabor Chocolate Cremoso",
  "Desayuno Saludable sabor Menta y Chocolate",
  "Desayuno Saludable sabor Frambuesa y Chocolate Blanco",
  "Desayuno Saludable sabor Delicia de Fresa",
  "Desayuno Saludable sabor Crema de Vainilla",
  "Desayuno Saludable sabor Plátano",
  "Gel de Baño para Manos y Cuerpo de Herbal Aloe",
  "Protein Chips sabor Barbacoa",
  "Protein Chips sabor Sour Cream and Onion",
  "AloeMax",
  "Paquete de prueba",
  "Champú Fortalecedor de Herbal Aloe",
  "Barritas con Proteínas sabor Limón",
  "Barritas con Proteínas sabor Vainilla y Almendra",
  "Niteworks",
  "Bebida Vegana con Proteínas en Polvo",
  "Immune Booster",
  "Hydrate de Herbalife24",
  "Restore de Herbalife24",
  "Formula 2 Complejo de vitaminas y minerales para mujer",
  "Barrita de Proteínas Achieve de Herbalife24 sabor Chocolate Negro",
  "Barrita de Proteínas Achieve de Herbalife24 sabor Galleta con Trocitos de Chocolate",
  "Barritas Formula 1 Express sabor Chocolate Negro",
  "Barritas Formula 1 Express sabor Arándanos y Chocolate Blanco",
  "LiftOff",
  "Crema Hidratante con FPS30",
  "Loción de Manos y Cuerpo de Herbal Aloe",
  "Crema Revitalizante de Noche de Herbalife SKIN",
  "Mascarilla Purificante de Arcilla con Menta de Herbalife SKIN",
  "Xtra-Cal",
  "Night Mode",
  "Formula 2 Complejo de vitaminas y minerales para hombre",
  "Tri Blend Select sabor Plátano",
  "Tri Blend Select sabor Caramelo de Café",
  "Active Mind Complex",
  "Acondicionador Fortalecedor de Herbal Aloe",
  "CR7 Drive de Herbalife24",
  "High Protein Iced Coffe",
  "Crema Tensora Ultimate"
];

 for (const name of products) {
    await prisma.product.upsert({
      where: { name },
      update: {}, // si ya existe, no hace nada
      create: { name }
    });
    console.log(`Seeded ${name} product.`);
  }

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
