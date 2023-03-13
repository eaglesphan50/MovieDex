import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { User } from './User';
import { Badge } from './Badge';

@Entity()
export class Movie {
  @PrimaryGeneratedColumn()
    id: number;
  
  @Column({ default: () => 'NOW()'})
    created_at: string;

  @ManyToMany(() => User, user => user.movies)
    users: User[];

  @ManyToMany(() => Badge, badge => badge.movies)
    badges: Badge[];

}