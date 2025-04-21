import { number } from 'joi';

enum SubscriptionTier {
  TIER_1 = '1',
  TIER_2 = '2',
  TIER_3 = '3',
  TIER_4 = '4',
  TIER_5 = '5',
}

interface CreateSubscriptionDTO {
  name: string;
  members_count: number;
  includes_house: boolean;
  includes_car: boolean;
  description: string;
  stripe_product_id: string;
}

interface UpdateSubscriptionDTO {
  name?: string;
  members_count?: number;
  includes_house?: boolean;
  includes_car?: boolean;
  monthly_price?: number;
  yearly_price?: number;
  description?: string;
}
interface SubscriptionDTO {
  name: string;
  members_count: number;
  includes_house: boolean;
  includes_car: boolean;
  monthly_price: number;
  yearly_price: number;
  description: string;
  stripe_product_id: string;
  stripe_price_id: string;
}
interface SubscriptionResponseDTO {
  id: string;
  name: string;
  members_count: number;
  includes_car: boolean;
  includes_house: boolean;
  description: string;
  stripe_product_id: string;
  stripe_monthly_price_id: string;
  stripe_yearly_price_id: string;
  monthly_price: number;
  yearly_price: number;
}

interface CreateSubscriptionPriceDTO {
  subscription_id: string;
  price: number;
  stripe_price_id: string;
  period: string;
}

interface UserSubscriptionResponseDTO {
  id: string;
  name: string;
  members_count: number;
  includes_house: boolean;
  includes_car: boolean;
  monthly_price: number;
  yearly_price: number;
}
interface SubscriptionPrice {
  id: string;
  price: number;
  stripe_price_id: string;
  period: string;
}

interface CreateSosUserSubscriptionDTO {
  sos_user_id: string;
  subscription_id: string;
  auto_renewal: boolean;
}

export {
  SubscriptionTier,
  CreateSubscriptionDTO,
  UserSubscriptionResponseDTO,
  CreateSosUserSubscriptionDTO,
  CreateSubscriptionPriceDTO,
  SubscriptionDTO,
  SubscriptionResponseDTO,
  SubscriptionPrice,
  UpdateSubscriptionDTO,
};
