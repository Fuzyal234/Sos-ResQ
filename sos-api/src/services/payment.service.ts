import { EnumDataType } from "sequelize";
import { Payment } from "../models";
import { UUID } from "crypto";

class PaymentService {
    async createPayment(sos_user_id: UUID, sos_user_subscription_id: UUID, amount: number, session_id:string) {
        Payment.create(
            {
                sos_user_id,
                sos_user_subscription_id,
                amount,
                status: "pending",
                session_id: session_id
            },
            {
                fields: ["sos_user_id", "sos_user_subscription_id", "amount", "status", "session_id"],
            }
        );
    }

    async updatePayment(session_id:string, status: string) {
        Payment.update(
            {
                status,
            },
            {
                where: {
                    session_id,
                },
            }
        );
    }
}

export default new PaymentService();