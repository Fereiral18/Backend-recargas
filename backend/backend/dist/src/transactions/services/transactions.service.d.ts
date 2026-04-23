import { Repository } from 'typeorm';
import { Transaction } from '../entities/transaction.entity';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { UpdateTransactionDto } from '../dto/update-transaction.dto';
export declare class TransactionsService {
    private readonly transactionRepository;
    constructor(transactionRepository: Repository<Transaction>);
    create(createTransactionDto: CreateTransactionDto): Promise<Transaction>;
    findAll(filters: any): Promise<{
        data: Transaction[];
        total: number;
        page: any;
        limit: any;
    }>;
    findOne(uuid: string): Promise<Transaction>;
    update(uuid: string, updateTransactionDto: UpdateTransactionDto): Promise<Transaction>;
    getUserBalance(user_id: string): Promise<{
        user_id: string;
        balance: number;
        total_transactions: number;
    }>;
    getStats(user_id?: string): Promise<{
        total: number;
        pending: number;
        completed: number;
    }>;
}
