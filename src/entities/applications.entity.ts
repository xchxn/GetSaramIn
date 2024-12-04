import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class ApplicationsEntity {
    @PrimaryColumn({ type: 'varchar', length: 255 })
    id: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    name: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    email: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    phone: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    resume: string;

    @Column({ type: 'date', nullable: true })
    appliedDate: Date;

    @Column({ type: 'varchar', length: 255, nullable: true })
    status: string;

    @Column({ type: 'boolean', default: true, nullable: true })
    allowCancel: boolean;
}
