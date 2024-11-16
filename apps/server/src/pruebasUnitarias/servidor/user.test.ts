import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import { Router } from 'express';
import { userRepository, sessionRepository } from '../../database';
import { appLog, expressPromise } from '../../lib';
import {
  userRegisterRequestSchema,
  userUpdateRequestSchema
} from '@qa-assessment/shared';

const app = express();
app.use(express.json());

const router = Router();

router.post(
  '/',
  expressPromise(async (req, res) => {
    appLog('Register attempt');
    const body = userRegisterRequestSchema.safeParse(req.body);

    if (!body.success) {
      appLog('Invalid register request', body.error.errors);
      return res.status(422).json({ errors: body.error.errors });
    }

    await userRepository
      .register(body.data)
      .then((user) => sessionRepository.create(user))
      .then((session) => res.json(session))
      .then(() => appLog('User registered', body.data))
      .then(() => appLog('User logged in', body.data));
  }),
);

app.use('/users', router);

vi.mock('../database', () => ({
  userRepository: {
    find: vi.fn(),
    register: vi.fn(),
    update: vi.fn(),
    clear: vi.fn(),
  },
  sessionRepository: {
    create: vi.fn(),
    clear: vi.fn(),
  },
}));

vi.mock('../lib', () => ({
  appLog: vi.fn(),
  expressPromise: vi.fn((fn) => (req: any, res: any, next: any) => fn(req, res).catch(next)),
}));

describe('Users Router - POST /', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should register a new user successfully', async () => {
    const newUser = { username: 'tatiana', password: 'Valeria22@.' };
    const createdUser = { ...newUser, id: '2' };
    const createdSession = { sessionId: '123' };

    (userRepository.register as jest.Mock).mockResolvedValue(createdUser);
    (sessionRepository.create as jest.Mock).mockResolvedValue(createdSession);

    const response = await request(app)
      .post('/users')
      .send(newUser);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(createdSession);
    expect(appLog).toHaveBeenCalledWith('Register attempt');
    expect(appLog).toHaveBeenCalledWith('User registered', newUser);
    expect(appLog).toHaveBeenCalledWith('User logged in', newUser);
  });

  it('should return 422 for invalid register request', async () => {
    const invalidUser = { username: '', password: 'password123' };

    const response = await request(app)
      .post('/users')
      .send(invalidUser);

    expect(response.status).toBe(422);
    expect(response.body).toHaveProperty('errors');
    expect(appLog).toHaveBeenCalledWith('Register attempt');
    expect(appLog).toHaveBeenCalledWith('Invalid register request', expect.any(Array));
  });
});