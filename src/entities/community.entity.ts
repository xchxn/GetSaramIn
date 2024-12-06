import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class CommunityEntity {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  content: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  username: string;
}
