import { TransactionType, TransactionStatus } from '../../common/enums';
import { User } from '../../users/entities/user.entity';
export declare class Transaction {
    uuid: string;
    user_id: string;
    type: TransactionType;
    status: TransactionStatus;
    amount: number;
    fee: number;
    net_amount: number;
    reference: string;
    currency: string;
    metadata: any;
    created_at: Date;
    completed_at: Date;
    user: User;
}
