import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;
}