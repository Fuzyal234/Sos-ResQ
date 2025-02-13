import Subscription from "../../models/subscription.model";
import sequelize from "../../config/sequelize";
import { CreateSubscriptionDTO } from "../../types/subscription.dto";
import { Transaction } from "sequelize";


class SubscriptionService {
    /**
     * Create a new subscription
     * @param data Subscription details
     */
    public async createSubscription(data: CreateSubscriptionDTO): Promise<Subscription> {
        const transaction: Transaction = await sequelize.transaction();
        try {
            const subscription = await Subscription.create({ ...data }, { transaction });

            await transaction.commit();
            return subscription;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Update an existing subscription
     * @param data Subscription update details
     * @param id Subscription ID
     */
    public async updateSubscription(data: CreateSubscriptionDTO, id: string): Promise<Subscription> {
        const transaction: Transaction = await sequelize.transaction();
        try {
            const subscription = await Subscription.findOne({ where: { id } });

            if (!subscription) {
                throw new Error("Subscription not found");
            }

            await subscription.update(data, { transaction });
            await transaction.commit();

            return subscription;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Get a subscription by ID
     * @param id Subscription ID
     */
    public async getSubscriptionById(id: string): Promise<Subscription | null> {
        return await Subscription.findOne({ where: { id } }) || null;
    }

    /**
     * Get all subscriptions
     */
    public async getAllSubscriptions(): Promise<Subscription[]> {
        return await Subscription.findAll();
    }
}

export default new SubscriptionService();