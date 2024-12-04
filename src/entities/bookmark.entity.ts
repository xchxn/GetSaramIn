import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class BookmarksEntity {
    @PrimaryColumn({ type: 'varchar', length: 255 })
    id: string;

    @Column({ type: 'varchar', length: 255 })
    userId: string;
}