import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { User } from './User';
import { Movie } from './Movie';

@Entity()
export class Badge {
  @PrimaryGeneratedColumn()
    id: number;

  @Column()
    name: string;

  @Column()
    icon: string;

  @Column()
    rarity: number;

  @Column()
    description: string;

  @Column()
    updated_at: string;

  @Column({ default: () => 'NOW()'})
    created_at: string;

  @ManyToMany(() => User, user => user.badges)
    users: User[];

  @ManyToMany(() => Movie, movie => movie.badges)
  @JoinTable()
    movies: Movie[];
}
