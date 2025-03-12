import jwt from 'jsonwebtoken'

class AuthUtils {
    static generateAccessToken(payload){
        const token = jwt.sign(
          payload,
          process.env.JWT_SECRET || "devflovvdevflovvdevflovv",
          { expiresIn: "24h" }
        );
        return token
      }
      
      static generateRefreshToken(payload){
        const refresh_token = jwt.sign(
          payload,
          process.env.JWT_SECRET || "devflovvdevflovvdevflovv",
          { expiresIn: "7d" }
        );
        return refresh_token
      }
      
      static verifyRefreshToken(refresh_token: string){
        try {
          const payload = jwt.verify(refresh_token, process.env.JWT_SECRET || "devflovvdevflovvdevflovv");
          console.log('payload :>> ', payload);
          return payload;
        } catch (error) {
          return null;
        }
      }
      
}

export default AuthUtils