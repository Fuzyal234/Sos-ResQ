import { Subscription } from '../../models/subscription.model';
import sequelize from '../../config/sequelize';
import {
  CreateSosUserSubscriptionDTO,
  CreateSubscriptionDTO,
  SubscriptionTier,
  UserSubscriptionResponseDTO,
} from '../../types/subscription.dto';
import { Transaction } from 'sequelize';
import { SosUserSubscription } from '../../models';
import { ProtectedEntities } from '../../models/portected_entities.model';

class SubscriptionService {
  /**
   * Create a new subscription
   * @param data Subscription details
   */
  public async createSubscription(
    data: CreateSubscriptionDTO,
  ): Promise<Subscription> {
    const transaction: Transaction = await sequelize.transaction();
    try {
      const subscription = await Subscription.create(
        { ...data },
        { transaction },
      );

      await transaction.commit();
      return subscription;
    } catch (error) {
      await transaction.rollback();
      console.log('error :>> ', error);
      throw error;
    }
  }

  /**
   * Update an existing subscription
   * @param data Subscription update details
   * @param id Subscription ID
   */
  public async updateSubscription(
    data: CreateSubscriptionDTO,
    id: string,
  ): Promise<Subscription> {
    const transaction: Transaction = await sequelize.transaction();
    try {
      const subscription = await Subscription.findOne({ where: { id } });

      if (!subscription) {
        throw new Error('Subscription not found');
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
  public async getAllSubscriptionsForUser(): Promise<
    UserSubscriptionResponseDTO[]
  > {
    const subscriptions = await Subscription.findAll();
    return subscriptions.map(subscription => ({
      id: subscription.dataValues.id,
      name: subscription.dataValues.name,
      includes_house: subscription.dataValues.includes_house,
      includes_car: subscription.dataValues.includes_car,
      members_count: subscription.dataValues.members_count,
      price: subscription.dataValues.price,
    }));
  }

  public async createSosUserSubscription(
    createSosUserSubscription: CreateSosUserSubscriptionDTO,
  ): Promise<SosUserSubscription> {
    // const { sos_user_id: sosUserId, subscription_id: subscriptionId, auto_renewal: auto_renewal } = createSosUserSubscription;
    const sos_user_id = createSosUserSubscription.sos_user_id;
    const subscription_id = createSosUserSubscription.subscription_id;
    const subscription = await Subscription.findByPk(subscription_id);

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const auto_renewal = createSosUserSubscription.auto_renewal;
    const start_date = new Date();
    const end_date = new Date(start_date);
    end_date.setMonth(end_date.getMonth() + 1);
    const status = 'inactive'; //#TODO : update status based on payment status

    const sos_subscription = await SosUserSubscription.create({
      sos_user_id,
      subscription_id,
      start_date,
      end_date,
      status,
      auto_renewal,
    });

    return sos_subscription;
  }

  public async updateSosUserSubscriptionStatus(
    sos_user_subscription_id: string,
    status: string,
    stripe_sub_id: string,
  ): Promise<void> {
    const updateData: any = { status };
    if (stripe_sub_id) {
      updateData.stripe_sub_id = stripe_sub_id;
    }

    await SosUserSubscription.update(updateData, {
      where: {
        id: sos_user_subscription_id,
      },
    });
  }
}

export default new SubscriptionService();
