import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { User as UserEntity } from "src/modules/users/models/user.model";

export const UserParam = createParamDecorator<keyof UserEntity | undefined>(
    (data: keyof UserEntity | undefined, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return data ? request.user?.[data] : request.user;
    }
)
