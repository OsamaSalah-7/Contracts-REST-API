import { FastifyRequest, FastifyReply } from 'fastify';
import { AppDataSource } from '../config/db';
import { Profile } from '../models/profile.model';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { LoginUserData, SignupUserData } from '../auth';

const profileRepository = AppDataSource.getRepository(Profile);

export async function signup(request: FastifyRequest, reply: FastifyReply) {
  const userData = request.body as SignupUserData;

  if (!userData.firstName || !userData.lastName || !userData.username || !userData.password || !userData.type) {
    return reply.status(400).send({ message: 'Missing required fields' });
  }

  const existingUser = await profileRepository.findOne({ where: { username: userData.username } });
  if (existingUser) {
    return reply.status(409).send({ message: 'Username already exists' });
  }

  const hashedPassword = await bcrypt.hash(userData.password, 10);
  const profile = profileRepository.create({
    firstName: userData.firstName,
    lastName: userData.lastName,
    profession: userData.profession,
    balance: userData.balance,
    type: userData.type,
    username: userData.username,
    password: hashedPassword,
  });

  await profileRepository.save(profile);

  return reply.status(201).send({ message: 'User created successfully' });
}


export async function login(request: FastifyRequest, reply: FastifyReply) {
  const userData = request.body as LoginUserData;

  const user = await profileRepository.findOne({ where: { username: userData.username } });
  if (!user) {
    return reply.status(401).send({ message: 'Invalid credentials' });
  }

  const validPassword = await bcrypt.compare(userData.password, user.password);
  if (!validPassword) {
    return reply.status(401).send({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, type: user.type }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '1h',
  });

  return reply.send({ token });
}


export async function getProfile(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return reply.code(401).send({ message: "Authorization header missing" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: string };
    
    const profile = await profileRepository.findOne({ where: { id: parseInt(decoded.id) } });
    if (!profile) {
      return reply.code(401).send({ message: "Invalid token" });
    }

    return reply.code(200).send(profile);
  } catch (err: any) {
    console.error("Error in getProfile controller:", err);
    return reply.code(401).send({ message: err.message });
  }
}
