import { User } from 'src/users/entities/user.entity';

export type TokenPayload = Omit<User, '_id'> & { _id: string };
