import { CreateUserDTO } from '../../types/user';
import { User, Agent } from '../../models/index';
import sequelize from '../../config/sequelize';
import { hashPassword } from '../../utils/hash';
import { CreateAgentDTO } from '../../types/agent.dto';
import { Model } from 'sequelize';
import exp from 'constants';

class AgentService {
  public async getAllAgents(): Promise<Agent[]> {
    return await Agent.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name', 'email', 'phone_number'],
        },
      ],
    });
  }

  public async getAgentById(id: string): Promise<Agent | null> {
    return await Agent.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name', 'email', 'phone_number'],
        },
      ],
    });
  }

  public async createAgent(data: CreateUserDTO): Promise<Agent> {
    const transaction = await sequelize.transaction();
    const hashedPassword = await hashPassword(data.password);

    try {
      const newUser = await User.create(
        {
          ...data,
          role: 'agent',
          password: hashedPassword,
        },
        { transaction },
      );
      delete newUser.dataValues.password;

      const newAgent = await Agent.create(
        {
          user_id: newUser.dataValues.id,
          status: 'available',
        },
        { transaction },
      );

      await transaction.commit();

      return newAgent;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  public async updateAgent(data: CreateAgentDTO, id: string): Promise<Model> {
    const transaction = await sequelize.transaction();
    try {
      const agent = await Agent.findOne({
        where: { id: id },
        include: [{ model: User, as: 'user' }],
      });
      const user = agent?.get('user') as User;
      if (!agent || !user) {
        throw new Error('Agent or associated User not found');
      }

      await user.update(data, { transaction });
      await transaction.commit();

      return user;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

export default new AgentService();
