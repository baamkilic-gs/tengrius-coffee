import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const sellerOrg = await prisma.organization.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Örnek Kahve İhracat A.Ş.',
      type: 'SELLER',
      country: 'Etiyopya',
      membership_tier: 'PREMIUM',
      verified: true,
    },
  });

  const sellerUser = await prisma.user.upsert({
    where: { email: 'satici@tengrius-coffee.local' },
    update: {},
    create: {
      email: 'satici@tengrius-coffee.local',
      full_name: 'Örnek Satıcı',
      password_hash: await bcrypt.hash('satici123', 10),
    },
  });

  await prisma.organizationMember.upsert({
    where: { organization_id_user_id: { organization_id: sellerOrg.id, user_id: sellerUser.id } },
    update: {},
    create: { organization_id: sellerOrg.id, user_id: sellerUser.id, role_in_org: 'OWNER' },
  });

  const buyerOrg = await prisma.organization.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Örnek Kavurma Firması',
      type: 'BUYER',
      country: 'Türkiye',
      membership_tier: 'PREMIUM',
    },
  });

  const buyerUser = await prisma.user.upsert({
    where: { email: 'alici@tengrius-coffee.local' },
    update: {},
    create: {
      email: 'alici@tengrius-coffee.local',
      full_name: 'Örnek Alıcı',
      password_hash: await bcrypt.hash('alici123', 10),
    },
  });

  await prisma.organizationMember.upsert({
    where: { organization_id_user_id: { organization_id: buyerOrg.id, user_id: buyerUser.id } },
    update: {},
    create: { organization_id: buyerOrg.id, user_id: buyerUser.id, role_in_org: 'OWNER' },
  });

  const product = await prisma.product.create({
    data: {
      seller_org_id: sellerOrg.id,
      title: 'Yirgacheffe G1 Washed',
      country: 'Etiyopya',
      region: 'Yirgacheffe',
      bean_type: 'Arabica',
      harvest_year: 2025,
      processing_method: 'Washed',
      moisture_pct: 11.2,
      cupping_notes: 'Çiçeksi, narenciye, çay gibi gövde',
      pricing_unit: 'BAG',
      price_per_unit: 185.5,
      currency: 'USD',
      quantity_available: 500,
      is_featured: true,
      priceHistory: { create: { price: 185.5 } },
    },
  });

  // eslint-disable-next-line no-console
  console.log(
    `Seed tamamlandı — satıcı: ${sellerUser.email} / satici123, alıcı: ${buyerUser.email} / alici123, ürün: ${product.title}`,
  );
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
