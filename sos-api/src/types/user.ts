interface CreateUserDTO {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  phone_number: string;
}

interface CreateSosUserDTO extends CreateUserDTO {
  address: string;
}

interface SosUserResponseDTO {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  phone_number: string;
  address: string;
}

export { CreateUserDTO, CreateSosUserDTO, SosUserResponseDTO };
