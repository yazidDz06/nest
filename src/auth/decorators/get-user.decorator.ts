import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
   
    const request = ctx.switchToHttp().getRequest();

   //recuperer un champ specifique si besoin
    if (data) {
      return request.user?.[data];
    }

    // Sinon retourne tout l'objet user
    return request.user;
  },
);
