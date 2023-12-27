import { BadgeController } from './controller/BadgeController';
import { MovieController } from './controller/MovieController';
import { UserController } from './controller/UserController';

export const Routes = [{
  method: 'get',
  route: '/users',
  controller: UserController,
  action: 'all'
}, {
  method: 'get',
  route: '/users/:id',
  controller: UserController,
  action: 'one'
}, {
  method: 'post',
  route: '/users',
  controller: UserController,
  action: 'save'
}, {
  method: 'delete',
  route: '/users/:id',
  controller: UserController,
  action: 'remove'
}, {
  method: 'post',
  route: '/users/:id/movies',
  controller: UserController,
  action: 'watchMovie'
}, {
  method: 'get',
  route: '/users/:id/movies',
  controller: UserController,
  action: 'seenMovies'
}, {
  method: 'get',
  route: '/users/:id/badges',
  controller: UserController,
  action: 'heldBadges'
}, {
  method: 'get',
  route: '/badges',
  controller: BadgeController,
  action: 'all'
}, {
  method: 'get',
  route: '/badges/:id',
  controller: BadgeController,
  action: 'one'
}, {
  method: 'post',
  route: '/badges',
  controller: BadgeController,
  action: 'save'
}, {
  method: 'delete',
  route: '/badges/:id',
  controller: BadgeController,
  action: 'remove'
}, {
  method: 'get',
  route: '/movies/:id',
  controller: MovieController,
  action: 'one'
}];