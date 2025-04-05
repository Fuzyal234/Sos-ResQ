import { Model } from 'sequelize';
import { BaseAuthService, UserProfile } from './base-auth.service';
import User from '../../models/user.model';

export class AdminAuthService extends BaseAuthService {
  private email: string;
  private user: Model | null = null;

  constructor(email: string) {
    super();
    this.email = email;
  }

  protected async getUserModel(): Promise<Model | null> {
    if (!this.user) {
      this.user = await User.findOne({
        where: { email: this.email, role: 'admin' },
      });
    }
    return this.user;
  }

  protected async getAssociatedModel(): Promise<Model | null> {
    return this.user;
  }

  protected getRole(): string {
    return 'admin';
  }

  protected mapUserProfile(user: Model): UserProfile {
    return {
      id: user.dataValues.id,
      email: user.dataValues.email,
      first_name: user.dataValues.first_name,
      last_name: user.dataValues.last_name,
      date_of_birth: user.dataValues.date_of_birth,
      phone_number: user.dataValues.phone_number,
    };
  }
}
