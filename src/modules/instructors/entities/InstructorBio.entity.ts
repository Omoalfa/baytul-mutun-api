import { Table, Column, DataType, ForeignKey, BelongsTo, Model } from 'sequelize-typescript';
import { User } from 'src/modules/users/entities/user.entity';

export class InstructorExperience {
  organization: string;
  title: string;
  start_year: number;
  end_year: number;
  current: boolean;
}

export class InstructorEducation {
  institution: string;
  degree: string;
  field_of_study: string;
  start_year: number;
  end_year: number;
  current: boolean;
}

@Table({
  tableName: 'instructor_bio',
  timestamps: true,
})
export class InstructorBio extends Model<InstructorBio> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({
    type: DataType.TEXT,
  })
  summary: string;

  @Column({
    type: DataType.ARRAY(DataType.TEXT),
    defaultValue: [],
  })
  qualifications: string[];

  @Column({
    type: DataType.ARRAY(DataType.JSONB),
    defaultValue: [],
  })
  education: InstructorEducation[];

  @Column({
    type: DataType.JSONB,
    defaultValue: [],
  })
  experience: InstructorExperience[];

  @Column({
    type: DataType.ARRAY(DataType.TEXT),
    defaultValue: [],
  })
  specializations: string[];

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
  })
  userId: number;

  @BelongsTo(() => User)
  user: User;
}
