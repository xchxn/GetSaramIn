import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class JobsEntity {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  experience: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  salary: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  education: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  workday: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  workType: string;
}
