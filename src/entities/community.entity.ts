import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class CommunityEntity {
  @PrimaryColumn({ type: 'int' })
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title: string;

  @Column({ type: 'varchar', length: 1023, nullable: true })
  contents: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  username: string;
}
