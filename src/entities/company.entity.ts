import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class CompanyEntity {
    @PrimaryColumn({ type: 'varchar', length: 255 })
    id: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    companyName: string;
}
