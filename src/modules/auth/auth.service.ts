import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import { User, AuthProvider } from '../users/models/user.model';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { EmailService } from './services/email.service';
import { Op } from 'sequelize';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userModel.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Create verification token
    const verificationToken = this.jwtService.sign(
      { email: registerDto.email },
      { expiresIn: '24h' },
    );

    const user = await this.userModel.create({
      ...registerDto,
      provider: AuthProvider.LOCAL,
      isVerified: false,
      verificationToken,
    });

    // Send verification email
    await this.emailService.sendVerificationEmail(user, verificationToken);

    return {
      user,
      message: 'Registration successful. Please check your email to verify your account.',
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userModel.findOne({
      where: { email: loginDto.email },
    });

    if (!user || user.provider !== AuthProvider.LOCAL) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isVerified) {
      throw new UnauthorizedException('Please verify your email before logging in');
    }

    const isPasswordValid = await user.validatePassword(loginDto.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateToken(user);

    return {
      user,
      token,
    };
  }

  async verifyEmail(token: string) {
    try {
      const decoded = this.jwtService.verify(token);
      const user = await this.userModel.findOne({
        where: { 
          email: decoded.email,
          verificationToken: token,
          isVerified: false,
        },
      });

      if (!user) {
        throw new BadRequestException('Invalid verification token');
      }

      await user.update({
        isVerified: true,
        verificationToken: null,
      });

      return {
        message: 'Email verified successfully. You can now log in.',
      };
    } catch (error) {
      throw new BadRequestException('Invalid or expired verification token');
    }
  }

  async resendVerificationEmail(email: string) {
    const user = await this.userModel.findOne({
      where: { email, provider: AuthProvider.LOCAL, isVerified: false },
    });

    if (!user) {
      throw new BadRequestException('User not found or already verified');
    }

    // Create new verification token
    const verificationToken = this.jwtService.sign(
      { email: user.email },
      { expiresIn: '24h' },
    );

    await user.update({ verificationToken });

    // Send verification email
    await this.emailService.sendVerificationEmail(user, verificationToken);

    return {
      message: 'Verification email has been resent. Please check your inbox.',
    };
  }

  async forgotPassword(email: string) {
    const user = await this.userModel.findOne({
      where: { email, provider: AuthProvider.LOCAL },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Create reset password token
    const resetPasswordToken = this.jwtService.sign(
      { email: user.email, type: 'reset' },
      { expiresIn: '1h' },
    );

    const resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour

    await user.update({
      resetPasswordToken,
      resetPasswordExpires,
    });

    // Send reset password email
    await this.emailService.sendPasswordResetEmail(user, resetPasswordToken);

    return {
      message: 'Password reset email has been sent. Please check your inbox.',
    };
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const decoded = this.jwtService.verify(token);
      const user = await this.userModel.findOne({
        where: {
          email: decoded.email,
          resetPasswordToken: token,
          resetPasswordExpires: {
            [Op.gt]: new Date(),
          },
        },
      });

      if (!user) {
        throw new BadRequestException('Invalid or expired reset token');
      }

      user.password = newPassword;
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();

      return {
        message: 'Password has been reset successfully. You can now log in with your new password.',
      };
    } catch (error) {
      throw new BadRequestException('Invalid or expired reset token');
    }
  }

  async socialLogin(socialUser: any, provider: 'google' | 'facebook') {
    let user = await this.userModel.findOne({
      where: { email: socialUser.email },
    });

    if (!user) {
      user = await this.userModel.create({
        email: socialUser.email,
        firstName: socialUser.firstName,
        lastName: socialUser.lastName,
        avatar: socialUser.avatar,
        provider: provider === 'google' ? AuthProvider.GOOGLE : AuthProvider.FACEBOOK,
        providerId: socialUser.id,
        providerData: {
          accessToken: socialUser.accessToken,
        },
        isVerified: true,
      });
    } else if (user.provider === AuthProvider.LOCAL && !user.isVerified) {
      await user.update({ isVerified: true });
    }

    const token = this.generateToken(user);

    return {
      user,
      token,
    };
  }

  private generateToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
    };

    return this.jwtService.sign(payload);
  }
}
