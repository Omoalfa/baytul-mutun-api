import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateInstructorBioDto, UpdateInstructorBioDto } from './dto/instructor.dto';
import { InstructorBio } from './entities/InstructorBio.entity';

@Injectable()
export class InstructorService {
  constructor(
    @InjectModel(InstructorBio)
    private readonly instructorBioModel: typeof InstructorBio,
  ) {}

  async createInstructorBio(userId: number,instructorBio: CreateInstructorBioDto) {
    return this.instructorBioModel.create({ ...instructorBio, userId });
  }

  async updateInstructorBio(id: number, instructorBio: UpdateInstructorBioDto) {
    return this.instructorBioModel.update(instructorBio, {
      where: { id },
    });
  }

  async findById(id: number, type: 'user' | 'bio') {
    return this.instructorBioModel.findOne({ where: (type === 'user' ? { userId: id } : { id }) });
  }
}
