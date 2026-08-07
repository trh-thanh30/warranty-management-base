import { PrismaClient, user_role, user_status } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { requireSeedPassword } from './seed-env';

export type ProductionSeedUserClient = Pick<PrismaClient, 'user'>;

type HashPassword = (password: string) => Promise<string>;

type ProductionSeedUserInput = {
  email: string;
  password: string;
  role: user_role;
  username: string;
};

export async function seedProductionUsers(
  client: ProductionSeedUserClient,
  env: NodeJS.ProcessEnv = process.env,
  hashPassword: HashPassword = (password) => bcrypt.hash(password, 12),
) {
  const adminInput = getProductionAdminInput(env);
  const moderatorInput = getProductionModeratorInput(env);

  assertDistinctProductionUsers(adminInput, moderatorInput);

  const admin = await upsertProductionUser(client, adminInput, hashPassword);
  const moderator = await upsertProductionUser(
    client,
    moderatorInput,
    hashPassword,
  );

  return { admin, moderator };
}

export async function seedProductionModerator(
  client: ProductionSeedUserClient,
  env: NodeJS.ProcessEnv = process.env,
  hashPassword: HashPassword = (password) => bcrypt.hash(password, 12),
) {
  return upsertProductionUser(
    client,
    getProductionModeratorInput(env),
    hashPassword,
  );
}

function getProductionAdminInput(
  env: NodeJS.ProcessEnv,
): ProductionSeedUserInput {
  return {
    email: env.SEED_ADMIN_EMAIL?.trim() || 'admin@example.com',
    password: requireSeedPassword('SEED_ADMIN_PASSWORD', env),
    role: user_role.ADMIN,
    username: env.SEED_ADMIN_USERNAME?.trim() || 'admin',
  };
}

function getProductionModeratorInput(
  env: NodeJS.ProcessEnv,
): ProductionSeedUserInput {
  return {
    email: env.SEED_MODERATOR_EMAIL?.trim() || 'moderator@example.com',
    password: requireSeedPassword('SEED_MODERATOR_PASSWORD', env),
    role: user_role.MODERATOR,
    username: env.SEED_MODERATOR_USERNAME?.trim() || 'moderator',
  };
}

async function upsertProductionUser(
  client: ProductionSeedUserClient,
  input: ProductionSeedUserInput,
  hashPassword: HashPassword,
) {
  const [userByEmail, userByUsername] = await Promise.all([
    client.user.findUnique({ where: { email: input.email } }),
    client.user.findUnique({ where: { username: input.username } }),
  ]);

  if (userByEmail && userByUsername && userByEmail.id !== userByUsername.id) {
    throw new Error(
      `Cannot seed production ${input.role.toLowerCase()} ${input.email}/${input.username}: email and username belong to different users.`,
    );
  }

  const accountData = {
    email: input.email,
    is_verified: true,
    role: input.role,
    status: user_status.ACTIVE,
    username: input.username,
  };
  const existingUser = userByEmail ?? userByUsername;

  if (existingUser) {
    return client.user.update({
      where: { id: existingUser.id },
      data: accountData,
    });
  }

  return client.user.create({
    data: {
      ...accountData,
      password: await hashPassword(input.password),
    },
  });
}

function assertDistinctProductionUsers(
  admin: ProductionSeedUserInput,
  moderator: ProductionSeedUserInput,
) {
  const sameEmail = admin.email.toLowerCase() === moderator.email.toLowerCase();
  const sameUsername =
    admin.username.toLowerCase() === moderator.username.toLowerCase();

  if (sameEmail || sameUsername) {
    throw new Error(
      'Production admin and moderator must use different email addresses and usernames.',
    );
  }
}
