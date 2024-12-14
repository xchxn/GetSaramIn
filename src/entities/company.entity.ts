import { Entity, Column, PrimaryColumn, OneToOne, JoinColumn } from 'typeorm';
import { JobsEntity } from './jobs.entity';

@Entity('company')
export class CompanyEntity {
    @PrimaryColumn()
    id: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    companyName: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    company_type: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    company_scale: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    company_history: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    company_homepage: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    company_address: string;
    
    @Column({ type: 'varchar', length: 255, nullable: true })
    company_ceo: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    company_content: string;

    @Column({ type: 'varchar', length: 1023, nullable: true })
    company_introduce: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    company_headcount: string;
}
