import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './User';
import { Movie } from './Movie';

@Entity()
export class Rating {
  @PrimaryGeneratedColumn()
    id: number;
  
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    created_at: string;

  @Column()
    updated_at: string;

  @ManyToOne(() => User, user => user.ratings)
    user: User;

  @ManyToOne(() => Movie, movie => movie.ratings)
    movie: Movie;

  @Column()
    score: number;
  
  @Column()
    review: string;
}