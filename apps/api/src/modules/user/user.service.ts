import { BcryptService } from '@/common/helpers/bcrypt.util';
import { normalizePagination, paginate } from '@/common/pagination/pagination';
import { BadRequestError, ConflictError } from '@/common/response';
import { PrismaService } from '@/database/prisma/prisma.service';
import { CreateUserDto } from '@/modules/user/dto/create-user.dto';
import { ListUsersDto } from '@/modules/user/dto/list-users.dto';
import { UpdateUserDto } from '@/modules/user/dto/update-user.dto';
import { generateTemporaryPassword } from '@/modules/user/temporary-password';
import { Injectable } from '@nestjs/common';
import { Prisma, User, user_role, user_status } from '@prisma/client';
import type { CreateModeratorResponse, UserAccountSummary } from '@repo/shared';

const userAccountSelect = {
  id: true,
  email: true,
  username: true,
  full_name: true,
  phone: true,
  avatar_url: true,
  role: true,
  status: true,
  is_verified: true,
  created_at: true,
  updated_at: true,
} satisfies Prisma.UserSelect;

type UserAccountRecord = Prisma.UserGetPayload<{
  select: typeof userAccountSelect;
}>;

function toUserAccountSummary(user: UserAccountRecord): UserAccountSummary {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    fullName: user.full_name,
    phone: user.phone,
    avatarUrl: user.avatar_url,
    role: user.role,
    status: user.status,
    isVerified: user.is_verified,
    createdAt: user.created_at.toISOString(),
    updatedAt: user.updated_at.toISOString(),
  };
}

function getUniqueUserFields(error: Prisma.PrismaClientKnownRequestError) {
  const target = error.meta?.target;
  const values = Array.isArray(target)
    ? target.map(String)
    : typeof target === 'string'
      ? [target]
      : [];
  const fields = ['email', 'username', 'phone'].filter((field) =>
    values.some((value) => value.toLowerCase().includes(field)),
  );

  return fields.length > 0 ? fields : ['account'];
}

function mapUniqueUserConflict(error: unknown): ConflictError | null {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  ) {
    return new ConflictError(
      'A user account with these details already exists',
      'USER_ACCOUNT_EXISTS',
      { fields: getUniqueUserFields(error) },
    );
  }

  return null;
}

/**
 * Service for handling user-related operations
 */
@Injectable()
export class UsersService {
  /**
   * Initialize service with PrismaService and BcryptService
   */
  constructor(
    private readonly prismaService: PrismaService,
    private readonly bcryptService: BcryptService,
  ) {}

  /**
   * Find user by email
   * @param email - User's email
   * @returns User or null if not found
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.prismaService.user.findUnique({
      where: { email },
    });
  }

  /**
   * Find user by username
   * @param username - User's username
   * @returns User or null if not found
   */
  async findByUsername(username: string): Promise<User | null> {
    return this.prismaService.user.findUnique({
      where: { username },
    });
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.prismaService.user.findUnique({
      where: { phone },
    });
  }

  /**
   * Find user by email or username
   * @param identifier - Email or username
   * @returns User or null if not found
   */
  async findByEmailOrUsername(identifier: string): Promise<User | null> {
    return this.prismaService.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }],
      },
    });
  }

  /**
   * Find user by ID
   * @param id - User's ID
   * @returns User or null if not found
   */
  async findById(id: string): Promise<User | null> {
    return this.prismaService.user.findUnique({
      where: { id },
    });
  }

  async findAccountById(id: string): Promise<UserAccountSummary | null> {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      select: userAccountSelect,
    });

    return user ? toUserAccountSummary(user) : null;
  }

  async findAuthProfileById(id: string) {
    return this.prismaService.user.findUnique({
      where: { id },
    });
  }

  /**
   * Create a new user
   * @param dto - User creation data
   * @returns Created user
   */
  async create(
    dto: CreateUserDto,
  ): Promise<UserAccountSummary | CreateModeratorResponse> {
    if (dto.role === user_role.MODERATOR && !dto.full_name?.trim()) {
      throw new BadRequestError(
        'Full name is required for moderator accounts',
        'MODERATOR_FULL_NAME_REQUIRED',
      );
    }

    const temporaryPassword =
      dto.role === user_role.MODERATOR
        ? generateTemporaryPassword()
        : dto.password;

    if (!temporaryPassword) {
      throw new BadRequestError(
        'Password is required for this account type',
        'PASSWORD_REQUIRED',
      );
    }

    const hashedPassword =
      await this.bcryptService.hashPassword(temporaryPassword);
    let user: UserAccountRecord;
    try {
      user = await this.prismaService.user.create({
        data: {
          ...dto,
          full_name: dto.full_name?.trim(),
          phone: dto.phone?.trim() || undefined,
          is_verified: dto.role === user_role.MODERATOR ? true : undefined,
          password: hashedPassword,
          status:
            dto.role === user_role.MODERATOR
              ? (dto.status ?? user_status.ACTIVE)
              : dto.status,
        },
        select: userAccountSelect,
      });
    } catch (error) {
      const conflict = mapUniqueUserConflict(error);
      if (conflict) throw conflict;

      throw error;
    }

    const userSummary = toUserAccountSummary(user);

    return dto.role === user_role.MODERATOR
      ? { temporaryPassword, user: userSummary }
      : userSummary;
  }

  /**
   * Update user information
   * @param id - User's ID
   * @param dto - Update data
   * @returns Updated user
   */
  async update(id: string, dto: UpdateUserDto): Promise<UserAccountSummary> {
    if (dto.password) {
      dto.password = await this.bcryptService.hashPassword(dto.password);
    }
    let user: UserAccountRecord;
    try {
      user = await this.prismaService.user.update({
        where: { id },
        data: dto,
        select: userAccountSelect,
      });
    } catch (error) {
      const conflict = mapUniqueUserConflict(error);
      if (conflict) throw conflict;

      throw error;
    }

    return toUserAccountSummary(user);
  }

  /**
   * Get all users
   * @returns List of users
   */
  async findAll(query: ListUsersDto) {
    const search = query.search?.trim();
    const roles = this.resolveRoles(query);
    const { page, limit, skip, take } = normalizePagination(query);
    const sortMap = {
      email: 'email',
      username: 'username',
      fullName: 'full_name',
      phone: 'phone',
      role: 'role',
      status: 'status',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    } satisfies Record<string, keyof Prisma.UserOrderByWithRelationInput>;
    const sortBy = query.sortBy ? sortMap[query.sortBy] : undefined;
    const where: Prisma.UserWhereInput = {
      role: roles.length > 0 ? { in: roles } : query.role,
      status: query.status,
      OR: search
        ? [
            { email: { contains: search, mode: 'insensitive' } },
            { username: { contains: search, mode: 'insensitive' } },
            { full_name: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
          ]
        : undefined,
    };
    const orderBy: Prisma.UserOrderByWithRelationInput[] = sortBy
      ? [{ [sortBy]: query.sortOrder ?? 'desc' }]
      : [{ created_at: 'desc' }];

    return this.prismaService.$transaction(async (tx) => {
      const [items, total] = await Promise.all([
        tx.user.findMany({
          where,
          orderBy,
          skip,
          take,
          select: userAccountSelect,
        }),
        tx.user.count({ where }),
      ]);

      return paginate(items.map(toUserAccountSummary), {
        page,
        limit,
        total,
      });
    });
  }

  private resolveRoles(query: ListUsersDto): user_role[] {
    if (!query.roles) {
      return [];
    }

    const roles = query.roles
      ?.split(',')
      .map((role) => role.trim().toUpperCase())
      .filter(Boolean);
    const invalidRoles = roles.filter(
      (role) => !Object.values(user_role).includes(role as user_role),
    );

    if (invalidRoles.length > 0) {
      throw new BadRequestError('Invalid user role filter', 'INVALID_ROLE', {
        roles: invalidRoles,
      });
    }

    return roles as user_role[];
  }

  /**
   * Delete user by ID
   * @param id - User's ID
   * @returns Deleted user
   */
  async delete(id: string): Promise<UserAccountSummary> {
    const user = await this.prismaService.user.delete({
      where: { id },
      select: userAccountSelect,
    });

    return toUserAccountSummary(user);
  }
}
