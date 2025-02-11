import { createUser } from "../auth.service";
import { CreateUserDTO } from "../../types/user";
import User from "../../models/user";
import Agent from "../../models/agent.model";
import sequelize from "../../config/sequelize";
import { hashPassword } from "../../utils/hash";

export const createAgent = async (data: CreateUserDTO): Promise<User> => {
    const transaction = await sequelize.transaction();
    const hashedPassword = await hashPassword(data.password);

    try {
        const newUser = await User.create(
            {
                ...data,
                role: "agent",
                password: hashedPassword,
            },
            { transaction }
        );
        delete newUser.dataValues.password;

        await Agent.create(
            {
                user_id: newUser.dataValues.id,
                status: "available",
            },
            { transaction }
        );

        await transaction.commit();

        return newUser;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};
