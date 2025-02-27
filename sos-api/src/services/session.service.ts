import { UUID } from "crypto";
import session from "../models/session";
import { SosUser } from "../models";


class SessionService {
    async createOrUpdateSession(user_id: UUID, token: string): Promise<void> {
      console.log("inside createOrUpdateSession");
      console.log('user_id :>> ', user_id);
        const existingSession = await session.findOne({ where: { user_id: user_id } });
        if (existingSession) {
          await session.update(
            { token },
            { where: { user_id: user_id } }
          );
        } else {
          const user = await SosUser.findByPk(user_id);
          const newSession = await session.create({ user_id: user_id, token });
        }
    }
}

export default new SessionService();