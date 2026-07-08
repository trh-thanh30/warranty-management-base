import { BcryptService } from '@/common/helpers/bcrypt.util';
import { normalizePagination, paginate } from '@/common/pagination/pagination';
import { BadRequestError } from '@/common/response';
import { PrismaService } from '@/database/prisma/prisma.service';
import { CreateUserDto } from '@/modules/user/dto/create-user.dto';
import { ListUsersDto } from '@/modules/user/dto/list-users.dto';
import { UpdateUserDto } from '@/modules/user/dto/update-user.dto';
import { Injectable } from '@nestjs/common';
import { Prisma, User, user_role } from '@prisma/client';

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
  async create(dto: CreateUserDto): Promise<User> {
    const hashedPassword = await this.bcryptService.hashPassword(dto.password);
    return this.prismaService.user.create({
      data: {
        ...dto,
        password: hashedPassword,
      },
    });
  }

  /**
   * Update user information
   * @param id - User's ID
   * @param dto - Update data
   * @returns Updated user
   */
  async update(id: string, dto: UpdateUserDto): Promise<User> {
    if (dto.password) {
      dto.password = await this.bcryptService.hashPassword(dto.password);
    }
    return this.prismaService.user.update({
      where: { id },
      data: dto,
    });
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
        }),
        tx.user.count({ where }),
      ]);

      return paginate(items, { page, limit, total });
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
  async delete(id: string): Promise<User> {
    return this.prismaService.user.delete({
      where: { id },
    });
  }
}
