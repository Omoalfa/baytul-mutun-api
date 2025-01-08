import { Table, Column, Model, DataType, BeforeCreate, BeforeUpdate, AfterCreate } from 'sequelize-typescript';
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
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  firstName: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  lastName: string;

  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false,
  })
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  password: string;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    defaultValue: [UserRole.STUDENT],
    allowNull: false,
  })
  roles: UserRole[];

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  avatar?: string;

  @Column({
    type: DataType.TEXT,
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
    type: DataType.STRING,
    defaultValue: AuthProvider.LOCAL,
  })
  provider: AuthProvider;

  @Column({
    allowNull: true,
  })
  providerId?: string;

  @Column({
    type: DataType.JSONB,
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

  @Column({
    type: DataType.STRING,
    allowNull: true,
    unique: true
  })
  studentId?: string;

  
  @AfterCreate
  @BeforeUpdate
  static async generateStudentId(instance: User) {
    if (instance.roles.includes(UserRole.STUDENT)) {
      const now = new Date();
      const year = now.getFullYear().toString();
      const month = now.getMonth() + 1;
      const monthStr = month < 10 ? `0${month}` : month.toString();
      const instanceIdStr = instance.id.toString();
      const studentId = instanceIdStr.slice(-3).padStart(3, '0');

      instance.studentId = `ST${year}${monthStr}${studentId}`;
    }
  }

  @BeforeCreate
  @BeforeUpdate
  static async hashPassword(instance: User) {
    if (instance.changed('password') && instance.password) {
      const salt = await bcrypt.genSalt(10);
      instance.password = await bcrypt.hash(instance.password, salt);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

}
