
// import User from '../models/user';
import { SosUser, User } from '../../models/index';
import { hashPassword } from '../../utils/hash';
import sequelize from '../../config/sequelize';
import { CreateUserDTO, CreateSosUserDTO, SosUserDTO, CreateUserAccountDTO } from '../../types/user';
import { FastifyReply } from 'fastify';
import utilityService from '../utility.service';
import { UUID } from 'crypto';
import sessionService from '../session.service';
import { successResponse } from '../../helper/responses';
import s3Service from '../s3.service';


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
      ...data,
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
      is_profile_completed: newSosUser.dataValues.is_profile_completed,
      contact_added: newSosUser.dataValues.contact_added
    }
    return sosUser;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

class UserAuthService {
  async  handleUserLogin(user: any, reply: FastifyReply) {
    const token = await utilityService.generateToken(user.id as UUID, "sos_user");
    const sosUser = await SosUser.findOne({ where: { user_id: user.id } });
    sessionService.createOrUpdateSession(user.user_id as UUID, token as string);
  
    const userProfile = {
      user_id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      date_of_birth: user.date_of_birth,
      phone_number: user.phone_number,
      avatar_url: user.avatar_url,
      is_profile_completed: user.is_profile_completed,
      contact_added: user.contact_added
    };
    
    return reply
      .status(201)
      .send(successResponse("Your account has been created successfully!", { token, user: userProfile }, 201));
  }

  async  createUserFromGoogle(payload: object, googleUserId: string) {
    let filename = googleUserId + ".jpg";
    console.log('payload :>> ', payload);
    const { email } = payload as { email: string };
    const { name} = payload as { name: string };
    const {picture} = payload as { picture: string };
    const imageBlob = await fetch(picture);
    const buffer = await imageBlob.arrayBuffer();
    const pictureBuffer = Buffer.from(buffer);
   
    const avatar_url = await s3Service.uploadFile(pictureBuffer,filename);
    console.log('avatar_url :>> ', avatar_url);
    const userData = {
      first_name: name.split(' ')[0],
      last_name: name.split(' ')[1],
      avatar_url: avatar_url,
      email,
      password: googleUserId + process.env.GOOGLE_CLIENT_ID,
    };
    const sosUserDTO = await createUserAccountService(userData);
    console.log('sosUserDTO :>> ', sosUserDTO);
    return sosUserDTO;
  }
  
  async getSosUserDTO(user: any) {
    const sosUser = await SosUser.findOne({ where: { user_id: user.dataValues.id } });
    console.log('sosUser :>> ', sosUser);
    const sosUserDTO : SosUserDTO = {
      id: sosUser.dataValues.id,
      user_id : user.dataValues.id,
      email: user.dataValues.email,
      address: sosUser.dataValues.address,
      avatar_url: sosUser.dataValues.avatar_url,
      date_of_birth: sosUser.dataValues.date_of_birth,
      first_name: user.dataValues.first_name,
      gender: sosUser.dataValues.gender,
      last_name: user.dataValues.last_name,
      phone_number: user.dataValues.phone_number,
      is_profile_completed: sosUser.dataValues.is_profile_completed,
      contact_added: sosUser.dataValues.contact_added
    }
    return sosUserDTO;
  }
}

export { createUser, createUserAccountService };
export default new UserAuthService();