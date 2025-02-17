import {Subscription} from "../../models/subscription.model";
import sequelize from "../../config/sequelize";
import { CreateSosUserSubscriptionDTO, CreateSubscriptionDTO, SubscriptionTier, UserSubscriptionResponseDTO } from "../../types/subscription.dto";
import { Transaction } from "sequelize";
import { SosUserSubscription } from "../../models";
import { ProtectedEntities } from "../../models/portected_entities.model";


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
        return await Subscription.findByPk(id);
    }

    /**
     * Get all subscriptions
     */
    public async getAllSubscriptions(): Promise<Subscription[]> {
        return await Subscription.findAll();
    }

    /**
     * Get all subscriptions for a user
     */
    public async getAllSubscriptionsForUser(): Promise<UserSubscriptionResponseDTO[]> {
        const subscriptions = await Subscription.findAll({ raw: true });
        console.log("subscriptionssssss", subscriptions);
        return subscriptions.map((subscription) => ({
            id: subscription.id,
            name: subscription.name,
            tier: subscription.tier as SubscriptionTier,
            includes_house: subscription.includes_house,
            includes_car: subscription.includes_car,
            price: subscription.price,
        }));
    }

    public async createSosUserSubscription(createSosUserSubscription: CreateSosUserSubscriptionDTO): Promise<void> {
        // const { sos_user_id: sosUserId, subscription_id: subscriptionId, auto_renewal: auto_renewal } = createSosUserSubscription;
        const sos_user_id = createSosUserSubscription.sos_user_id;
        const subscription_id = createSosUserSubscription.subscription_id;
        const subscription = await Subscription.findByPk(subscription_id);

        if (!subscription) {
            throw new Error("Subscription not found");
        }

        const auto_renewal = createSosUserSubscription.auto_renewal;
        const start_date = new Date();
        const end_date = new Date(start_date);
        end_date.setMonth(end_date.getMonth() + 1);
        const status = "active"; //#TODO : update status based on payment status


        await SosUserSubscription.create({
            sos_user_id,
            subscription_id,
            start_date,
            end_date,
            status,
            auto_renewal,
        });
        if(subscription.tier === "1") {
            ProtectedEntities.create({
                entity_id: sos_user_id,
                entity_type: "sos_user",
                sos_user_subscription_id: subscription.id,
            });
        }
    }
}

export default new SubscriptionService();