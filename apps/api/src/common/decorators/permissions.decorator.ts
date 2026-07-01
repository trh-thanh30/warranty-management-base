import { Reflector } from '@nestjs/core';
import { permission_key } from '@prisma/client';

export const Permissions = Reflector.createDecorator<permission_key[]>();
