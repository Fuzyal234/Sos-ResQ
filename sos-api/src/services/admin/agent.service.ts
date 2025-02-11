import { createUser } from "../auth.service";
import { CreateUserDTO } from "../../types/user";
import User from "../../models/user";
import Agent from "../../models/agent.model";
import sequelize from "../../config/sequelize";
import { hashPassword } from "../../utils/hash";
import { CreateAgentDTO } from "../../types/agent.dto";

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

export const updateAgent = async (data: CreateAgentDTO, id: string): Promise<User> => {
    const transaction = await sequelize.transaction();
    try {
        const agent = await Agent.findOne({ where: { id: id } });
        if (!agent) {
            throw new Error("Agent not found");
        }
        const user_id = agent.dataValues.user_id;
        const user = await User.findByPk(user_id);
        if (!user) {
            throw new Error("User not found");
        }

        await user.update(data, { transaction });
        await transaction.commit();

        return user;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

export const getAgentById = async (id: string) => {
    return await Agent.findOne({
        where: { id },
        include: [
            {
                model: User,
                as: "user",
                attributes: ["id", "first_name", "last_name", "email", "phone_number"],
            },
        ],
    });
};

export const getAllAgents = async () => {
    return await Agent.findAll({
        include: [
            {
                model: User,
                as: "user",
                attributes: ["id", "first_name", "last_name", "email", "phone_number"],
            },
        ],
    });
};