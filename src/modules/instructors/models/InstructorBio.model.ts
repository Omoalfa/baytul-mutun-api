import { Table, Column, DataType, ForeignKey, BelongsTo, Model } from 'sequelize-typescript';
import { User } from 'src/modules/users/models/user.model';

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
  tableName: 'instructor_bios',
  timestamps: true,
})
export class InstructorBio extends Model<InstructorBio> {
  @Column({
    type: DataType.TEXT,
  })
  summary: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false
  })
  isVerified: boolean;

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
    type: DataType.ARRAY(DataType.JSONB),
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
    primaryKey: true,
  })
  userId: number;

  @BelongsTo(() => User)
  user: User;
}
