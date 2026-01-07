import {
  ExecutionContext,
  InternalServerErrorException,
  createParamDecorator,
} from '@nestjs/common';
import { IToken } from 'src/infrastructure/token/interface';

export const GetRequestUser = createParamDecorator(
  async (data: string, context: ExecutionContext): Promise<IToken> => {
    try {
      const request = context.switchToHttp().getRequest();
      const user: IToken = request[data];
      return user;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error on get request user: ${error}`,
      );
    }
  },
);
