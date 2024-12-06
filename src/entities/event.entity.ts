import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class EventsEntity {
    @PrimaryColumn({ type: 'varchar', length: 255 })
    id: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    title: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    start: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    end: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    description: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    target: string;
}