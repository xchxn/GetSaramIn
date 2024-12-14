import { Entity, Column, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class JobsEntity {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  companyName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  companyUrl: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  education: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  badge: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  stacks: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  employmentType: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  salary: string;

  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  deadline: string;
}
