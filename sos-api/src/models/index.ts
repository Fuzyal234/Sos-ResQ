import User from './user.model';
import SosUser from './sos_user.model';
import { Subscription } from './subscription.model';
import SosUserSubscription from './sos_user_subscription.model';
import { Payment } from './payment.model';
import Agent from './agent.model';
import session from './session';
import Car from './car.model';
import House from './house.model';
import { ProtectedEntities } from './portected_entities.model';
import FamilyMember from './family_member.model';

User.hasOne(SosUser, { foreignKey: 'user_id' });
SosUser.belongsTo(User, { foreignKey: 'user_id' });

Agent.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasOne(Agent, { foreignKey: 'user_id' });

SosUserSubscription.belongsTo(SosUser, {
  as: 'user_subscription_sos_user',
  foreignKey: 'sos_user_id',
});
SosUser.hasMany(SosUserSubscription, {
  foreignKey: 'sos_user_id',
  as: 'subscriptions',
});

SosUserSubscription.hasMany(Payment, {
  as: 'payments',
  foreignKey: 'sos_user_subscription_id',
});
Payment.belongsTo(SosUserSubscription, {
  foreignKey: 'sos_user_subscription_id',
  as: 'sos_user_subscription',
});

User.hasOne(SosUser, { foreignKey: 'user_id', as: 'user_sos_user' });
SosUser.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

SosUser.hasMany(Payment, {
  foreignKey: 'sos_user_id',
  as: 'sos_user_payments',
});
Payment.belongsTo(SosUser, {
  foreignKey: 'sos_user_id',
  as: 'payment_sos_user',
});

Subscription.belongsToMany(SosUser, { through: SosUserSubscription });
SosUser.belongsToMany(Subscription, { through: SosUserSubscription });

User.hasMany(session, { foreignKey: 'user_id', as: 'sessions' });
session.belongsTo(User, { foreignKey: 'id', as: 'user' });

// SosUser.prototype.toJSON = function () {const values = { ...this.get() };delete values.id;return values;};

Car.belongsTo(SosUser, { foreignKey: 'sos_user_id', as: 'car_sos_user' });
SosUser.hasMany(Car, { foreignKey: 'sos_user_id', as: 'cars' });

House.belongsTo(SosUser, { foreignKey: 'sos_user_id', as: 'house_sos_user' });
SosUser.hasMany(House, { foreignKey: 'sos_user_id', as: 'houses' });

SosUserSubscription.hasMany(FamilyMember, {
  foreignKey: 'user_subscription_id',
  as: 'family_members',
});
FamilyMember.belongsTo(SosUserSubscription, {
  foreignKey: 'user_subscription_id',
  as: 'user_subscription',
});

SosUserSubscription.belongsTo(Subscription, {
  foreignKey: 'subscription_id',
  as: 'subscription',
});
Subscription.hasMany(SosUserSubscription, {
  foreignKey: 'subscription_id',
  as: 'user_subscriptions',
});

export {
  Agent,
  User,
  SosUser,
  Subscription,
  SosUserSubscription,
  Payment,
  session,
  Car,
  House,
  FamilyMember,
};
