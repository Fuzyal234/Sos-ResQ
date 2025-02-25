
// import User from '../models/user';
import { SosUser, User } from '../../models/index';
import { hashPassword } from '../../utils/hash';
import sequelize from '../../config/sequelize';
import { CreateUserDTO, CreateSosUserDTO, SosUserDTO, CreateUserAccountDTO } from '../../types/user';


const createUser = async (data: CreateUserDTO): Promise<User> => {

  let email = data.email;

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new Error("Email already exists!");
    }

    const hashedPassword = await hashPassword(data.password);

    const newUser = await User.create({
      ...data,
      password: hashedPassword,
    });
    delete newUser.dataValues.password;

    return newUser;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};

const createUserAccountService = async (data: CreateUserAccountDTO): Promise<SosUserDTO> => {
  const transaction = await sequelize.transaction();
  const hashedPassword = await hashPassword(data.password);
  try {
    const newUser = await User.create(
      {
        ...data,
        role: "sos_user",
        password: hashedPassword,
      },
      { transaction }
    );
    delete newUser.dataValues.password;
    const newSosUser = await SosUser.create({
      user_id: newUser.dataValues.id,
    }, { transaction });
    await transaction.commit();

    const sosUser: SosUserDTO = {
      id: newSosUser.dataValues.id,
      user_id : newUser.dataValues.id,
      email: newUser.dataValues.email,
      address: newSosUser.dataValues.address,
      avatar_url: newSosUser.dataValues.avatar_url,
      date_of_birth: newSosUser.dataValues.date_of_birth,
      first_name: newUser.dataValues.first_name,
      gender: newSosUser.dataValues.gender,
      last_name: newUser.dataValues.last_name,
      phone_number: newUser.dataValues.phone_number,
    }
    return sosUser;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export { createUser, createUserAccountService };