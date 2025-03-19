import { Sequelize } from "sequelize";
import { SosUser, User } from "../../models";
import { Transaction } from "sequelize";
import sequelize from "../../config/sequelize";
import { CreateSosUserDTO, SosUserDTO, Gender, SosUserWithUser } from "../../types/user";



class SosUserService {
    public async getSosUserByUserId(userId: string): Promise<SosUserDTO | null> {
        const sosUser = await SosUser.findOne({
            where: { id: userId },
            include: [{ model: User, as: "user" }]
        });

        if (!sosUser) {
            return null;
        }

        const plainSosUser = sosUser.get({ plain: true }) as SosUserWithUser;
        const sosUserDTO: SosUserDTO = {
            id: plainSosUser.id,
            user_id: plainSosUser.user_id,
            email: plainSosUser.user.email,
            first_name: plainSosUser.user.first_name,
            last_name: plainSosUser.user.last_name,
            date_of_birth: plainSosUser.user.date_of_birth || new Date(),
            gender: (plainSosUser.user.gender as Gender) || Gender.PREFER_NOT_TO_SAY,
            phone_number: plainSosUser.user.phone_number,
            address: plainSosUser.address || undefined,
            avatar_url: plainSosUser.avatar_url || undefined,
            is_profile_completed: plainSosUser.is_profile_completed,
            contact_added: plainSosUser.contact_added
        };

        return sosUserDTO;
    }

    public async updateSosUser(id: string, sosUser: SosUserDTO): Promise<SosUserDTO> {
        const transaction: Transaction = await sequelize.transaction();
        try {
            const sosUserModel = await SosUser.findByPk(id, { transaction });
            if (!sosUserModel) {
                throw new Error("SosUser not found");
            }
            const user = await User.findByPk(sosUserModel.dataValues.user_id, { transaction });
            
            if (user) {
                await user.update(
                    {
                        first_name: sosUser.first_name,
                        last_name: sosUser.last_name,
                        date_of_birth: sosUser.date_of_birth,
                        gender: sosUser.gender,
                    },
                    { transaction }
                );
            }

            const updatedSosUser = await sosUserModel.update(sosUser, { transaction });
            
            await transaction.commit();
            const sosUserM = await SosUser.findOne({
                where: { id: id },
                include: [{ model: User, as: "user" }]
            });
            
            if (!sosUserM) {
                throw new Error("SosUser not found after update");
            }
            
            const plainSosUser = sosUserM.get({ plain: true }) as SosUserWithUser;
            const sosUserDTO: SosUserDTO = {
                id: plainSosUser.id,
                user_id: plainSosUser.user_id,
                email: plainSosUser.user.email,
                first_name: plainSosUser.user.first_name,
                last_name: plainSosUser.user.last_name,
                date_of_birth: plainSosUser.user.date_of_birth || new Date(),
                gender: (plainSosUser.user.gender as Gender) || Gender.PREFER_NOT_TO_SAY,
                phone_number: plainSosUser.user.phone_number,
                address: plainSosUser.address || undefined,
                avatar_url: plainSosUser.avatar_url || undefined,
                is_profile_completed: plainSosUser.is_profile_completed,
                contact_added: plainSosUser.contact_added
            };
            return sosUserDTO;
        } catch (error: unknown) {
            await transaction.rollback();
            throw new Error(`Failed to update SosUser: ${error as Error}.message}`);
        }
    }
}

export default new SosUserService();
