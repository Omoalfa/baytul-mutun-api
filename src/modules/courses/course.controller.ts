import Roles from "src/common/decorators/role.decorator";
import { UserRole } from "../users/entities/user.entity";
import { Controller } from "@nestjs/common";

@Roles(UserRole.STUDENT, UserRole.INSTRUCTOR, UserRole.ADMIN)
@Controller('courses')
export class CourseController {
    
}
