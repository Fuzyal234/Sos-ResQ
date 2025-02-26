import { OAuth2Namespace } from "@fastify/oauth2";
import { OAuth2 } from "nodemailer/lib/smtp-connection";

interface CreateUserDTO {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  phone_number: string;
}
enum Gender {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other",
}

enum Relation {
  PARENT = "parent",
  SPOUSE = "spouse",
  CHILD = "child",
  SIBLING = "sibling",
  FRIEND = "friend",
  OTHER = "other",
}
interface CreateUserAccountDTO {
  email: string
  password: string
}
interface CreateSosUserDTO {
  full_name: string;
  gender: Gender;
  date_of_birth: Date
  address: string;
  avatar_url: Buffer;
}
interface CreateContactDTO {
  name: string
  phone_number: string
  relation: Relation
}

interface SosUserDTO {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  date_of_birth: Date;
  gender: Gender;
  phone_number: string;
  address: string;
  avatar_url: string;
  is_profile_completed: boolean
}

interface UserAccountReturnDTO {
  email: string
  phone_number: string
}

interface FastifyInstance {
  googleOauth2: OAuth2Namespace
}
export {
  CreateUserDTO,
  CreateSosUserDTO,
  SosUserDTO,
  CreateContactDTO,
  CreateUserAccountDTO,
  UserAccountReturnDTO,
  FastifyInstance
};
