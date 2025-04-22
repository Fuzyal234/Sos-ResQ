import { OAuth2Namespace } from '@fastify/oauth2';
import { UUID } from 'crypto';
import { OAuth2 } from 'nodemailer/lib/smtp-connection';

interface CreateUserDTO {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  date_of_birth: Date;
  phone_number: string;
}
enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say',
}

enum Relation {
  PARENT = 'parent',
  SPOUSE = 'spouse',
  CHILD = 'child',
  SIBLING = 'sibling',
  FRIEND = 'friend',
  OTHER = 'other',
}
interface CreateUserAccountDTO {
  email: string;
  password: string;
  phone_number: string | null;
}
interface CreateSosUserDTO {
  full_name: string;
  gender: Gender;
  date_of_birth: Date;
  address: string;
  avatar_url: Buffer;
}
interface CreateContactDTO {
  sos_user_id: string;
  name: string;
  phone: string;
  relation: Relation;
}
interface UpdateContactDTO {
  sos_user_id: string;
  id: string;
  name: string;
  phone_number: string;
  relation: Relation;
}

interface SosUserDTO {
  id: UUID;
  user_id: UUID;
  email: string;
  first_name: string | null;
  last_name: string | null;
  date_of_birth: Date | null;
  gender: Gender | null;
  phone_number: string | null;
  address?: string;
  avatar_url?: string;
  is_profile_completed?: boolean;
  contact_added?: boolean;
}

interface UserAccountReturnDTO {
  email: string;
  phone_number: string;
}

interface FastifyInstance {
  googleOauth2: OAuth2Namespace;
}

interface UserWithSosUser {
  id: UUID;
  email: string;
  'sos_user.id': UUID;
  'sos_user.user_id': UUID;
  'sos_user.address': string | null;
  'sos_user.avatar_url': string | null;
  'sos_user.is_profile_completed': boolean;
  'sos_user.contact_added': boolean;
}
interface SosUserWithUser {
  id: UUID;
  user_id: UUID;
  address: string | null;
  avatar_url: string | null;
  is_profile_completed: boolean;
  contact_added: boolean;
  user: {
    email: string;
    first_name: string;
    last_name: string;
    date_of_birth: Date | null;
    gender: string | null;
    phone_number: string;
  };
}
export {
  CreateUserDTO,
  CreateSosUserDTO,
  SosUserDTO,
  CreateContactDTO,
  UpdateContactDTO,
  CreateUserAccountDTO,
  UserAccountReturnDTO,
  FastifyInstance,
  UserWithSosUser,
  Gender,
  SosUserWithUser,
};
