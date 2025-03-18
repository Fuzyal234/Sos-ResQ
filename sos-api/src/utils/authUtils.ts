import jwt from 'jsonwebtoken'
interface Payload {
  user_id: string,
  role: string
}
class AuthUtils {
    static generateAccessToken(payload : Payload){
        const token = jwt.sign(
          payload,
          process.env.JWT_SECRET || "devflovvdevflovvdevflovv",
          { expiresIn: "24h" }
        );
        return token
      }
      
      static generateRefreshToken(payload : Payload){
        const refresh_token = jwt.sign(
          payload,
          process.env.JWT_SECRET || "devflovvdevflovvdevflovv",
          { expiresIn: "7d" }
        );
        return refresh_token
      }
      
      static verifyRefreshToken(refresh_token: string): Payload | null {
        try {
          const payload = jwt.verify(refresh_token, process.env.JWT_SECRET || "devflovvdevflovvdevflovv");
          console.log('payload :>> ', payload);
          if (typeof payload === 'object' && 'user_id' in payload && 'role' in payload) {
            return payload as Payload;
          } else {
            return null;
          }
        } catch (error) {
          return null;
        }
      }
      
}

export default AuthUtils