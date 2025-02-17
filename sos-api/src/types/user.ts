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
  phone_number: string
  password: string
}
interface CreateSosUserDTO {
  full_name: string;
  gender: Gender;
  date_of_birth: Date
  address: string;
}
interface CreateContactDTO {
  name: string
  phone_number: string
  relation: Relation
}

interface SosUserResponseDTO {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  phone_number: string;
  address: string;
}

interface UserAccountReturnDTO {
  email: string
  phone_number: string
}

export {
  CreateUserDTO,
  CreateSosUserDTO,
  SosUserResponseDTO,
  CreateContactDTO,
  CreateUserAccountDTO,
  UserAccountReturnDTO
};
