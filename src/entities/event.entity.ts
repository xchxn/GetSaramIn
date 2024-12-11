import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class EventsEntity {
    @PrimaryColumn({ type: 'int' })
    id: number;

    @Column({ type: 'varchar', length: 255, nullable: true })
    title: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    date: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    target: string;
}