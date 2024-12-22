import { Table, Column, Model, DataType, BelongsTo, ForeignKey, HasMany } from 'sequelize-typescript';
import { User } from '../../users/entities/user.entity';
import { CourseModule } from './course-module.entity';

export enum CourseLevel {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced',
}

@Table({
  tableName: 'courses',
  timestamps: true,
})
export class Course extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column
  title: string;

  @Column(DataType.TEXT)
  description: string;

  @Column({
    type: DataType.ENUM(...Object.values(CourseLevel)),
    defaultValue: CourseLevel.BEGINNER,
  })
  level: CourseLevel;

  @Column
  duration: string;

  @Column(DataType.DECIMAL(10, 2))
  price: number;

  @Column({
    allowNull: true,
  })
  image: string;

  @Column({
    defaultValue: true,
  })
  isPublished: boolean;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  instructorId: string;

  @BelongsTo(() => User)
  instructor: User;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    defaultValue: [],
  })
  prerequisites: string[];

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    defaultValue: [],
  })
  objectives: string[];

  @Column({
    defaultValue: 0,
  })
  enrollmentCount: number;

  @Column({
    type: DataType.FLOAT,
    defaultValue: 0,
  })
  rating: number;

  @Column({
    defaultValue: 0,
  })
  reviewCount: number;

  @HasMany(() => CourseModule)
  modules: CourseModule[];
}
