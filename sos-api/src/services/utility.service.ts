import { UUID } from 'crypto';
import jwt from 'jsonwebtoken';
const { OAuth2Client } = require('google-auth-library');
const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );


class UtilityService {
    async generateToken(user_id: UUID, role: string): Promise<string> {
        const token = jwt.sign(
            { user_id: user_id, role: "sos_user" },
            process.env.JWT_SECRET || "devflovvdevflovvdevflovv",
            { expiresIn: "24h" }
        );
        return token;
    }

    async verifyGoogleToken(idToken: string) {
        try {
          const ticket = await oauth2Client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
          });
      
          return ticket.getPayload();
        } catch (err) {
          console.error("Google token verification failed:", err);
          return null;
        }
      }
}

export default new UtilityService();