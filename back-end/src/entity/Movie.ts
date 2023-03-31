import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { Badge } from './Badge';
import { Rating } from './Rating';

@Entity()
export class Movie {
  @PrimaryGeneratedColumn()
    id: number;
  
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    created_at: string;

  @OneToMany(() => Rating, rating => rating.movie)
  @JoinTable()
    ratings: Rating[];

  @ManyToMany(() => Badge, badge => badge.movies)
    badges: Badge[];
}