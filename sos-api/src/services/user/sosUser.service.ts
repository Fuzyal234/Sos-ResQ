import { Sequelize } from "sequelize";
import { SosUser, User } from "../../models";
import { Transaction } from "sequelize";
import sequelize from "../../config/sequelize";


import { CreateSosUserDTO, SosUserDTO } from "../../types/user";

class SosUserService {
    public async getSosUserByUserId(userId: string): Promise<SosUserDTO | null> {
        const sosUser = await SosUser.findOne({
            where: { id: userId },
            include: [{ model: User, as: "user" }]
        });

        if (!sosUser) {
            return null;
        }

        const plainSosUser = sosUser.get({ plain: true });
        console.log('plainSosUser :>> ', plainSosUser);
        const sosUserDTO: SosUserDTO = {
            id: plainSosUser.id,
            user_id: plainSosUser.user_id,
            email: plainSosUser.user.email,
            first_name: plainSosUser.user.first_name,
            last_name: plainSosUser.user.last_name,
            date_of_birth: plainSosUser.user.date_of_birth,
            gender: plainSosUser.user.gender,
            phone_number: plainSosUser.user.phone_number,
            address: plainSosUser.address,
            avatar_url: plainSosUser.avatar_url,
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
            const plainSosUser = sosUserM.get({ plain: true });
            console.log('plainSosUser :>> ', plainSosUser);
            const sosUserDTO: SosUserDTO = {
                id: plainSosUser.id,
                user_id: plainSosUser.user_id,
                email: plainSosUser.user.email,
                first_name: plainSosUser.user.first_name,
                last_name: plainSosUser.user.last_name,
                date_of_birth: plainSosUser.user.date_of_birth,
                gender: plainSosUser.user.gender,
                phone_number: plainSosUser.user.phone_number,
                address: plainSosUser.address,
                avatar_url: plainSosUser.avatar_url,
                is_profile_completed: plainSosUser.is_profile_completed,
                contact_added: plainSosUser.contact_added
            };
            return  sosUserDTO;
        } catch (error: unknown) {
            await transaction.rollback();
            throw new Error(`Failed to update SosUser: ${error as Error}.message}`);
        }
    }
}

export default new SosUserService();
