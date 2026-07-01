import { PrismaService } from '@/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class CustomersRepository {
  constructor(private readonly prismaService: PrismaService) {}

  create(data: Prisma.CustomerCreateInput) {
    return this.prismaService.customer.create({ data });
  }

  findById(id: string) {
    return this.prismaService.customer.findUnique({ where: { id } });
  }

  findByUserId(userId: string) {
    return this.prismaService.customer.findUnique({
      where: { user_id: userId },
    });
  }

  findByCustomerCode(customerCode: string) {
    return this.prismaService.customer.findUnique({
      where: { customer_code: customerCode },
    });
  }

  list(search?: string) {
    const trimmedSearch = search?.trim();

    return this.prismaService.customer.findMany({
      where: trimmedSearch
        ? {
            OR: [
              {
                customer_code: { contains: trimmedSearch, mode: 'insensitive' },
              },
              { full_name: { contains: trimmedSearch, mode: 'insensitive' } },
              { phone: { contains: trimmedSearch, mode: 'insensitive' } },
              { email: { contains: trimmedSearch, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: { created_at: 'desc' },
    });
  }

  update(id: string, data: Prisma.CustomerUpdateInput) {
    return this.prismaService.customer.update({
      where: { id },
      data,
    });
  }
}
