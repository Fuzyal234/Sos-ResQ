import User from "./user";
import SosUser from "./sos_user.model";
import { Subscription } from "./subscription.model";
import SosUserSubscription from "./sos_user_subscription.model";
import { Payment } from "./payment.model";
import Agent from "./agent.model";
import session from "./session";





User.hasOne(SosUser, { foreignKey: "user_id" });
Agent.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasOne(Agent, { foreignKey: "user_id" });
SosUserSubscription.belongsTo(SosUser, { as: "sos_user", foreignKey: "sos_user_id" });
SosUserSubscription.hasMany(Payment, { as: "payments", foreignKey: "sos_user_subscription_id" });
Payment.belongsTo(SosUserSubscription, {
    foreignKey: "sos_user_subscription_id",
    as: "sos_user_subscription",
});

Payment.belongsTo(SosUser, {
    foreignKey: "sos_user_id",
    as: "sos_user",
});
session.belongsTo(User, { foreignKey: 'id', as: 'user' });
User.hasMany(session, { foreignKey: 'user_id', as: 'sessions' });
SosUser.belongsTo(User, {
    foreignKey: "user_id",
    as: "user",
})
SosUser.hasMany(SosUserSubscription, {
    foreignKey: "sos_user_id",
    as: "subscriptions",
})
SosUser.hasMany(Payment, {
    foreignKey: "sos_user_id",
    as: "payments",
})
SosUser.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.id;
    return values;
};

export { Agent, User, SosUser, Subscription, SosUserSubscription, Payment };