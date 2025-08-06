import { FastifyInstance } from 'fastify';
import { signup, login, getProfile } from '../controllers/auth.controller';

export async function authRoutes(app: FastifyInstance) {
  app.post('/signup', signup);
  app.post('/login', login);
  app.get('/profile', getProfile);
}
