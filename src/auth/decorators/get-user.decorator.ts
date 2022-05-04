import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    if (data) {
      return ctx.switchToHttp().getRequest().user[data];
    }
    return ctx.switchToHttp().getRequest().user;
  },
);
