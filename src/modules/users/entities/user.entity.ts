import { Table, Column, Model, DataType, BeforeCreate, BeforeUpdate, HasMany } from 'sequelize-typescript';
import * as bcrypt from 'bcrypt';

export enum UserRole {
  ADMIN = 'admin',
  INSTRUCTOR = 'instructor',
  STUDENT = 'student',
}

export enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
}

@Table({
  tableName: 'users',
  timestamps: true,
})
export class User extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @Column
  firstName: string;

  @Column
  lastName: string;

  @Column({
    unique: true,
  })
  email: string;

  @Column({
    allowNull: true,
  })
  password: string;

  @Column({
    type: DataType.ENUM(...Object.values(UserRole)),
    defaultValue: UserRole.STUDENT,
  })
  role: UserRole;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  avatar?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  bio?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  avatarPublicId?: string;

  @Column({
    defaultValue: false,
  })
  isVerified: boolean;

  @Column({
    type: DataType.ENUM(...Object.values(AuthProvider)),
    defaultValue: AuthProvider.LOCAL,
  })
  provider: AuthProvider;

  @Column({
    allowNull: true,
  })
  providerId?: string;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  providerData?: any;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  verificationToken?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  resetPasswordToken?: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  resetPasswordExpires?: Date;

  @BeforeCreate
  @BeforeUpdate
  static async hashPassword(instance: User) {
    if (instance.changed('password') && instance.password) {
      const salt = await bcrypt.genSalt();
      instance.password = await bcrypt.hash(instance.password, salt);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}
