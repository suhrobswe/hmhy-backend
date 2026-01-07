import { Repository } from 'typeorm';
import { Notification } from '../entity/notification.entity';

export type NotificationRepository = Repository<Notification>;
