import { Reflector } from '@nestjs/core';

export const Roles = Reflector.createDecorator<string[]>();
//this is the new way from nest v10+
