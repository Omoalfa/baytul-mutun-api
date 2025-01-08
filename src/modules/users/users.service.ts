import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './models/user.model';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UploadService } from '../../common/services/upload.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
    private uploadService: UploadService,
  ) {}

  async findById(id: number): Promise<User> {
    const user = await this.userModel.findByPk(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateProfile(
    userId: number,
    updateProfileDto: UpdateProfileDto,
    avatar?: Express.Multer.File,
  ): Promise<User> {
    const user = await this.findById(userId);

    // Handle email update
    if (updateProfileDto.email && updateProfileDto.email !== user.email) {
      const existingUser = await this.userModel.findOne({
        where: { email: updateProfileDto.email },
      });
      if (existingUser) {
        throw new BadRequestException('Email already in use');
      }
    }

    // Handle avatar upload
    if (avatar) {
      try {
        // Delete old avatar if exists
        if (user.avatarPublicId) {
          await this.uploadService.deleteFile(user.avatarPublicId);
        }

        // Upload new avatar
        const avatarUrl = await this.uploadService.uploadFile(avatar);
        user.avatar = avatarUrl;
        
        // Extract public ID from Cloudinary URL
        const publicId = avatarUrl.split('/').slice(-1)[0].split('.')[0];
        user.avatarPublicId = publicId;
      } catch (error) {
        throw new BadRequestException('Failed to upload avatar');
      }
    }

    // Update other fields
    Object.assign(user, updateProfileDto);

    // Save changes
    await user.save();

    return user;
  }
}
