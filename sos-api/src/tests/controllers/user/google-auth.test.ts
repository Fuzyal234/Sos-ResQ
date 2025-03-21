import supertest from 'supertest';
import fastify from '../../globalTestSetup';
import utilityService from '../../../services/utility.service';
import userAuthService from '../../../services/user/auth.service';
import {User, SosUser} from '../../../models';

// Mock the utility service and user auth service
jest.mock('../../../services/utility.service');
jest.mock('../../../services/user/auth.service');
jest.mock('../../../models', () => ({
  User: {
    findOne: jest.fn(),
  },
  SosUser: {
    findOne: jest.fn(),
  },
}));

describe('Google Auth Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('POST /google-auth - Should handle new user from Google', async () => {
    // Mock Google token verification
    const mockPayload = {
      email: 'test@example.com',
      name: 'Test User',
      picture: 'https://example.com/profile.jpg',
      sub: 'google_user_id_123',
    };

    // Mock User.findOne to return null (user doesn't exist)
    (User.findOne as jest.Mock).mockResolvedValue(null);

    // Mock verifyGoogleToken to return the mock payload
    (utilityService.verifyGoogleToken as jest.Mock).mockResolvedValue(
      mockPayload,
    );

    // Mock createUserFromGoogle to return a new user
    const mockNewUser = {
      id: 'user_id_123',
      user_id: 'user_id_123',
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
      avatar_url: 'https://example.com/image.jpg',
      is_profile_completed: false,
      contact_added: false,
    };
    (userAuthService.createUserFromGoogle as jest.Mock).mockResolvedValue(
      mockNewUser,
    );

    // Mock handleUserLogin to simulate a successful response
    (userAuthService.handleUserLogin as jest.Mock).mockImplementation(
      (user, reply) => {
        reply.status(200).send({
          status: 'success',
          message: 'Login successful',
          data: {
            token: 'mock_token',
            refresh_token: 'mock_refresh_token',
            user: mockNewUser,
          },
        });
      },
    );

    const response = await supertest(fastify.server).post('/google-auth').send({
      google_auth_token: 'mock_google_auth_token',
    });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data).toHaveProperty('token');
    expect(response.body.data).toHaveProperty('user');
    expect(utilityService.verifyGoogleToken).toHaveBeenCalledWith(
      'mock_google_auth_token',
    );
    expect(userAuthService.createUserFromGoogle).toHaveBeenCalledWith(
      mockPayload,
      'google_user_id_123',
    );
  });

  test('POST /google-auth - Should handle existing user from Google', async () => {
    // Mock Google token verification
    const mockPayload = {
      email: 'existing@example.com',
      name: 'Existing User',
      picture: 'https://example.com/profile.jpg',
      sub: 'google_user_id_456',
    };

    // Mock User.findOne to return an existing user
    const mockExistingUser = {
      dataValues: {
        id: 'existing_user_123',
        email: 'existing@example.com',
        first_name: 'Existing',
        last_name: 'User',
      },
    };
    (User.findOne as jest.Mock).mockResolvedValue(mockExistingUser);

    // Mock verifyGoogleToken to return the mock payload
    (utilityService.verifyGoogleToken as jest.Mock).mockResolvedValue(
      mockPayload,
    );

    // Mock getSosUserDTO to return user data
    const mockUserDto = {
      id: 'sos_user_123',
      user_id: 'existing_user_123',
      email: 'existing@example.com',
      first_name: 'Existing',
      last_name: 'User',
      avatar_url: 'https://example.com/image.jpg',
      is_profile_completed: true,
      contact_added: true,
    };
    (userAuthService.getSosUserDTO as jest.Mock).mockResolvedValue(mockUserDto);

    // Mock handleUserLogin to simulate a successful response
    (userAuthService.handleUserLogin as jest.Mock).mockImplementation(
      (user, reply) => {
        reply.status(200).send({
          status: 'success',
          message: 'Login successful',
          data: {
            token: 'mock_token',
            refresh_token: 'mock_refresh_token',
            user: mockUserDto,
          },
        });
      },
    );

    const response = await supertest(fastify.server).post('/google-auth').send({
      google_auth_token: 'mock_google_auth_token',
    });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data).toHaveProperty('token');
    expect(response.body.data).toHaveProperty('user');
    expect(utilityService.verifyGoogleToken).toHaveBeenCalledWith(
      'mock_google_auth_token',
    );
    expect(userAuthService.getSosUserDTO).toHaveBeenCalledWith(
      mockExistingUser,
    );
    expect(userAuthService.createUserFromGoogle).not.toHaveBeenCalled();
  });

  test('POST /google-auth - Should handle invalid token', async () => {
    // Mock verifyGoogleToken to return null (invalid token)
    (utilityService.verifyGoogleToken as jest.Mock).mockResolvedValue(null);

    const response = await supertest(fastify.server).post('/google-auth').send({
      google_auth_token: 'invalid_token',
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('status');
    expect(response.body.message).toBe('Invalid email');
  });

  test('POST /google-auth - Should handle missing token', async () => {
    const response = await supertest(fastify.server)
      .post('/google-auth')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('status');
    expect(response.body.message).toBe('Validation error');
  });
});
