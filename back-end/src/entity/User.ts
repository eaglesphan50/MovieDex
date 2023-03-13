import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { Badge } from './Badge';
import { Movie } from './Movie';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
    id: number;

  @Column()
    email: string;

  @Column()
    username: string;

  @Column()
    password: string;

  @Column()
    updated_at: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    created_at: string;

  @ManyToMany(() => Badge, badge => badge.users)
  @JoinTable()
    badges: Badge[];

  @ManyToMany(() => Movie, movie => movie.users)
  @JoinTable()
    movies: Movie[];
}
