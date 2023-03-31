import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, OneToMany } from 'typeorm';

import { Badge } from './Badge';
import { Rating } from './Rating';

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

  @OneToMany(() => Rating, rating => rating.user)
  @JoinTable()
    ratings: Rating[];
}
