import { Table, Column, Model, DataType, BelongsTo, ForeignKey, HasMany, BeforeCreate } from 'sequelize-typescript';
import { CourseModule } from './course-module.model';
import { User } from 'src/modules/users/models/user.model';

export enum CourseLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

export enum ECourseStatus {
  DRAFT = 'draft',
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
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

  @Column(DataType.INTEGER)
  duration: number;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  enrolledStudents: number;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  moduleCount: number;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  price: number;

  @Column({
    allowNull: true,
  })
  image: string;

  @Column({
    allowNull: true,
  })
  imagePublicId: string;

  @Column({
    defaultValue: false,
  })
  isPublished: boolean;

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  instructorId: number;

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
    type: DataType.FLOAT,
    defaultValue: 0,
  })
  rating: number;

  @Column({
    defaultValue: 0,
  })
  reviewCount: number;

  @Column({
    type: DataType.ENUM(...Object.values(ECourseStatus)),
    defaultValue: ECourseStatus.DRAFT,
  })
  status: ECourseStatus;

  @HasMany(() => CourseModule)
  modules: CourseModule[];

  @BeforeCreate
  static  setDefaultPublishedStatus(instance: Course) {
    if (instance.isPublished) {
      instance.status = ECourseStatus.ONGOING;
    } else {
      instance.status = ECourseStatus.DRAFT;
    }
  }
}
