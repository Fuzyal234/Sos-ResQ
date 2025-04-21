import sequelize from '../../config/sequelize';
import {
  CreateSosUserSubscriptionDTO,
  CreateSubscriptionDTO,
  SubscriptionResponseDTO,
  SubscriptionTier,
  UpdateSubscriptionDTO,
  UserSubscriptionResponseDTO,
} from '../../types/subscription.dto';
import { Transaction } from 'sequelize';
import { SosUserSubscription } from '../../models';
import { ProtectedEntities } from '../../models/portected_entities.model';
import { Subscription, SubscriptionPrices } from '../../models/index';
import { any, number } from 'joi';

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
      console.log('error :>> ', error);
      throw error;
    }
  }

  /**
   * Update an existing subscription
   * @param data Subscription update details
   * @param id Subscription ID
   */
  public async updateSubscription(data: UpdateSubscriptionDTO, id: string): Promise<Subscription> {
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
  public async getSubscriptionById(id: string): Promise<SubscriptionResponseDTO | null> {
    const subscription = await Subscription.findByPk(id, {
      include: [{ model: SubscriptionPrices, as: 'subscription_prices' }],
    });
    console.log('subscription from db :>> ', subscription);
    const formattedSubscription = {
      id: subscription?.dataValues.id || '',
      name: subscription?.dataValues.name || '',
      members_count: subscription?.dataValues.members_count || 0,
      includes_car: subscription?.dataValues.includes_car || false,
      includes_house: subscription?.dataValues.includes_house || false,
      description: subscription?.dataValues.description || '',
      stripe_product_id: subscription?.dataValues.stripe_product_id || '',
      monthly_price: 0,
      stripe_monthly_price_id: '',
      stripe_yearly_price_id: '',
      yearly_price_id: '',
      yearly_price: 0,
    };
    if (subscription?.dataValues.subscription_prices && subscription.dataValues.subscription_prices.length > 0) {
      for (const price of subscription?.dataValues.subscription_prices) {
        if (price.dataValues.period === 'month') {
          formattedSubscription.monthly_price = price.dataValues.price;
          formattedSubscription.stripe_monthly_price_id = price.dataValues.stripe_price_id;
        } else if (price.dataValues.period === 'year') {
          formattedSubscription.yearly_price = price.dataValues.price;
          formattedSubscription.yearly_price_id = price.dataValues.stripe_price_id;
        }
      }
    }

    return formattedSubscription;
  }

  /**
   * Get all subscriptions
   */
  public async getAllSubscriptions(): Promise<Subscription[]> {
    return await Subscription.findAll({
      attributes: ['id', 'name', 'members_count', 'includes_car', 'includes_house', 'description'],
      include: [{ model: SubscriptionPrices, as: 'subscription_prices' }],
    });
  }

  /**
   * Get all subscriptions for a user
   */
  public async getAllSubscriptionsForUser(): Promise<UserSubscriptionResponseDTO[]> {
    const subscriptions = await Subscription.findAll({
      attributes: ['id', 'name', 'members_count', 'includes_car', 'includes_house', 'description'],
      include: [{ model: SubscriptionPrices, as: 'subscription_prices' }],
    });
    const formattedSubscriptions = subscriptions.map((subscription: any) => {
      let monthlyPrice = null;
      let yearlyPrice = null;

      if (subscription.subscription_prices && subscription.subscription_prices.length > 0) {
        for (const price of subscription.subscription_prices) {
          if (price.period === 'month') {
            monthlyPrice = price.price;
          } else if (price.period === 'year') {
            yearlyPrice = price.price;
          }
        }
      }

      return {
        id: subscription.id,
        name: subscription.name,
        members_count: subscription.members_count,
        includes_car: subscription.includes_car,
        includes_house: subscription.includes_house,
        description: subscription.description,
        monthly_price: monthlyPrice,
        yearly_price: yearlyPrice,
      };
    });

    return formattedSubscriptions;
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

  public async createSubscriptionPrice(
    subscription_id: string,
    price: number,
    stripe_price_id: string,
    period: string,
  ): Promise<SubscriptionPrices> {
    return await SubscriptionPrices.create({
      subscription_id,
      price,
      stripe_price_id,
      period,
    });
  }

  public async updateSubscriptionPrice(
    subscription_id: string,
    price: number,
    stripe_price_id: string,
    period: string,
  ) {
    console.log('stripe_price_id :>> ', stripe_price_id);
    console.log('subscription_id :>> ', subscription_id);
    console.log(
      'subscription_id, price, stripe_price_id, period :>> ',
      subscription_id,
      price,
      stripe_price_id,
      period,
    );
    return await SubscriptionPrices.update(
      {
        price,
        stripe_price_id,
      },
      {
        where: {
          subscription_id,
          period,
        },
      },
    );
  }
}

export default new SubscriptionService();
