enum SubscriptionTier {
  TIER_1 = "1",
  TIER_2 = "2",
  TIER_3 = "3",
  TIER_4 = "4",
  TIER_5 = "5",
}

interface CreateSubscriptionDTO {
  name: string;
  tier: string;
  includes_house: boolean;
  includes_car: boolean;
  price: number;
}

interface UserSubscriptionResponseDTO {
  id: string;
  name: string;
  tier: SubscriptionTier;
  includes_house: boolean;
  includes_car: boolean;
  price: number;
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
  CreateSosUserSubscriptionDTO 
};
