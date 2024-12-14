import { Entity, Column, PrimaryColumn, JoinColumn, OneToOne, CreateDateColumn } from 'typeorm';
import { JobsEntity } from './jobs.entity';

@Entity()
export class BookmarksEntity {
    @PrimaryColumn()
    id: string;
    
    @OneToOne(() => JobsEntity)
    @JoinColumn({ name: 'id' })
    job: JobsEntity;

    @Column({ type: 'varchar', length: 255 })
    userId: string;

    @CreateDateColumn()
    createdAt: Date;
}