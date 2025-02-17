
import User from '../../models/user.model';
import { hashPassword } from '../../utils/hash';
import { CreateUserDTO } from '../../types/user';


export const createUser = async (data : CreateUserDTO): Promise<User> => {
    
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