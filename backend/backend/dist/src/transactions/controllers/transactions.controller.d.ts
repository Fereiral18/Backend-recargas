import { TransactionsService } from '../services/transactions.service';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { UpdateTransactionDto } from '../dto/update-transaction.dto';
export declare class TransactionsController {
    private readonly transactionsService;
    constructor(transactionsService: TransactionsService);
    create(createTransactionDto: CreateTransactionDto): Promise<import("../entities/transaction.entity").Transaction>;
    findAll(user_id?: string, type?: string, status?: string, page?: number, limit?: number): Promise<{
        data: import("../entities/transaction.entity").Transaction[];
        total: number;
        page: any;
        limit: any;
    }>;
    getStats(user_id?: string): Promise<{
        total: number;
        pending: number;
        completed: number;
    }>;
    getUserBalance(user_id: string): Promise<{
        user_id: string;
        balance: number;
        total_transactions: number;
    }>;
    findOne(uuid: string): Promise<import("../entities/transaction.entity").Transaction>;
    update(uuid: string, updateTransactionDto: UpdateTransactionDto): Promise<import("../entities/transaction.entity").Transaction>;
}
