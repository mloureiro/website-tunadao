import type { Payload } from 'payload';

export const seedAdminUser = async (payload: Payload) => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || 'Admin';

  if (!email || !password) {
    console.log('  Skipped: ADMIN_EMAIL or ADMIN_PASSWORD not set');
    return;
  }

  // Check if user already exists
  const existing = await payload.find({
    collection: 'users',
    where: { email: { equals: email } },
    limit: 1,
  });

  if (existing.docs.length > 0) {
    console.log(`  Skipped: Admin user "${email}" already exists`);
    return;
  }

  await payload.create({
    collection: 'users',
    data: {
      email,
      password,
      name,
      role: 'admin',
    },
  });
  console.log(`  Created admin user: ${email}`);
};
