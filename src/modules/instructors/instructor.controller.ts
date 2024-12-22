import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import Roles from "src/common/decorators/role.decorator";
import { UserRole } from "../users/entities/user.entity";
import { InstructorService } from "./instructor.service";
import { CreateInstructorBioDto, InstructorBioParamDto, InstructorUserParamDto, UpdateInstructorBioDto } from "./dto/instructor.dto";
import { UserParam } from "../auth/decorators/user.decorator";

@Controller('instructors')
@Roles(UserRole.INSTRUCTOR)
export class InstructorController {
    constructor(
        private readonly instructorService: InstructorService,
    ) {}

    @Post("/bio")
    async createInstructorBio(
        @Body() instructorBio: CreateInstructorBioDto,
        @UserParam("id") userId: number
    ) {
        return await this.instructorService.createInstructorBio(userId, instructorBio);
    }

    @Patch("/bio/:id")
    async updateInstructorBio(
        @Body() instructorBio: UpdateInstructorBioDto,
        @Param() param: InstructorBioParamDto
    ) {
        return await this.instructorService.updateInstructorBio(param.id, instructorBio);
    }

    @Get("/bio/:id")
    async fetchInstructorBio(@Param() param: InstructorUserParamDto) {
        return await this.instructorService.findById(param.id, 'user');
    }
}