import { TransactionType } from '../../common/enums';
export declare class CreateTransactionDto {
    user_id: string;
    type: TransactionType;
    amount: number;
    fee?: number;
    currency?: string;
    metadata?: any;
}
