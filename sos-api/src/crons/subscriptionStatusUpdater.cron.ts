import { AsyncTask, CronJob } from 'toad-scheduler';
import { SosUserSubscription } from '../models';
import { Op } from 'sequelize';

const task = new AsyncTask(
  'simple task',
  async () => {
    const sosUserSubscriptions = await SosUserSubscription.findAll({
      where: {
        status: 'active',
        end_date: {
          [Op.lt]: new Date(),
        },
      },
    });

    for (const sosUserSubscription of sosUserSubscriptions) {
      sosUserSubscription.status = 'expired';
      await sosUserSubscription.save();
    }
  },
  err => {
    if (err) {
      console.error(err);
    }
  },
);

const job = new CronJob(
  {
    cronExpression: '0 0 * * *',
  },
  task,
);

export default job;
