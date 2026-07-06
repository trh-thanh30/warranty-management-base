import { Permissions } from '@/common/decorators/permissions.decorator';
import { PermissionService } from '@/common/permissions/permissions.service';
import { Roles } from '@/common/decorators/roles.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { NotFoundError } from '@/common/response';
import { CreateUserDto } from '@/modules/user/dto/create-user.dto';
import { ListUsersDto } from '@/modules/user/dto/list-users.dto';
import { UpdateUserPermissionsDto } from '@/modules/user/dto/update-user-permissions.dto';
import { UpdateUserDto } from '@/modules/user/dto/update-user.dto';
import { UsersService } from '@/modules/user/user.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { normalizeUserRole } from '@repo/shared/constants';
import { permission_key } from '@prisma/client';

/**
 * Controller for user management endpoints
 */
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly permissionService: PermissionService,
  ) {}

  /**
   * Create a new user (Admin only)
   * @param createUserDto - User creation data
   * @returns Created user
   */
  @Post()
  @Roles(['ADMIN'])
  @Permissions([permission_key.USER_CREATE])
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  /**
   * Get all users (Admin only)
   * @returns List of all users
   */
  @Get()
  @Roles(['ADMIN'])
  @Permissions([permission_key.USER_VIEW])
  async findAll(@Query() query: ListUsersDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id/permissions')
  @Roles(['ADMIN'])
  @Permissions([permission_key.USER_PERMISSION_MANAGE])
  async getPermissions(@Param('id') id: string) {
    const user = await this.findRequiredUser(id);
    const overrides =
      await this.permissionService.getUserPermissionOverrides(id);
    const effectivePermissions =
      await this.permissionService.getEffectivePermissions(id, user.role);

    return {
      userId: id,
      role: normalizeUserRole(user?.role),
      effectivePermissions,
      overrides,
    };
  }

  @Put(':id/permissions')
  @Roles(['ADMIN'])
  @Permissions([permission_key.USER_PERMISSION_MANAGE])
  async updatePermissions(
    @Param('id') id: string,
    @Body() dto: UpdateUserPermissionsDto,
  ) {
    const user = await this.findRequiredUser(id);
    const overrides = await this.permissionService.setUserPermissionOverrides(
      id,
      user.role,
      dto.overrides,
    );
    const effectivePermissions =
      await this.permissionService.getEffectivePermissions(id, user.role);

    return {
      userId: id,
      role: normalizeUserRole(user?.role),
      effectivePermissions,
      overrides,
    };
  }

  /**
   * Get user by ID (Admin only)
   * @param id - User ID
   * @returns User data
   */
  @Get(':id')
  @Roles(['ADMIN'])
  @Permissions([permission_key.USER_VIEW])
  async findOne(@Param('id') id: string) {
    return this.usersService.findAccountById(id);
  }

  /**
   * Update user by ID (Admin only)
   * @param id - User ID
   * @param updateUserDto - Update data
   * @returns Updated user
   */
  @Put(':id')
  @Roles(['ADMIN'])
  @Permissions([permission_key.USER_UPDATE])
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  /**
   * Delete user by ID (Admin only)
   * @param id - User ID
   * @returns Deleted user
   */
  @Delete(':id')
  @Roles(['ADMIN'])
  @Permissions([permission_key.USER_DELETE])
  async remove(@Param('id') id: string) {
    return this.usersService.delete(id);
  }

  private async findRequiredUser(id: string) {
    const user = await this.usersService.findAccountById(id);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }
}
