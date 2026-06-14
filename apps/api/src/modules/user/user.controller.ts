import { Roles } from '@/common/decorators/roles.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { CreateUserDto } from '@/modules/user/dto/create-user.dto';
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
  UseGuards,
} from '@nestjs/common';

/**
 * Controller for user management endpoints
 */
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Create a new user (Admin only)
   * @param createUserDto - User creation data
   * @returns Created user
   */
  @Post()
  @Roles(['ADMIN'])
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  /**
   * Get all users (Admin only)
   * @returns List of all users
   */
  @Get()
  @Roles(['ADMIN'])
  async findAll() {
    // Implement pagination later
    return this.usersService.findAll();
  }

  /**
   * Get user by ID (Admin only)
   * @param id - User ID
   * @returns User data
   */
  @Get(':id')
  @Roles(['ADMIN'])
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  /**
   * Update user by ID (Admin only)
   * @param id - User ID
   * @param updateUserDto - Update data
   * @returns Updated user
   */
  @Put(':id')
  @Roles(['ADMIN'])
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
  async remove(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
}
