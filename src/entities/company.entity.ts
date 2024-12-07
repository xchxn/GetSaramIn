import { Entity, Column, PrimaryColumn, OneToOne, JoinColumn } from 'typeorm';
import { JobsEntity } from './jobs.entity';

@Entity('company')
export class CompanyEntity {
    @PrimaryColumn('varchar')
    id: string;

    @OneToOne(() => JobsEntity)
    @JoinColumn({ name: 'id' })
    job: JobsEntity;

    @Column({ type: 'varchar', length: 255, nullable: true })
    companyName: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    campany_type: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    campany_scale: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    campany_history: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    campany_homepage: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    campany_address: string;
    
    @Column({ type: 'varchar', length: 255, nullable: true })
    campany_ceo: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    campany_content: string;

    @Column({ type: 'varchar', length: 1023, nullable: true })
    campany_introduce: string;
}
