import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UpdateUserDto } from '../dto/update-user.dto';
export declare class UsersService {
    private readonly userRepository;
    constructor(userRepository: Repository<User>);
    findAll(filters?: {
        role?: string;
        status?: string;
        search?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        users: User[];
        total: number;
        page: number;
        limit: number;
    }>;
    count(): Promise<number>;
    findOne(uuid: string): Promise<User>;
    update(uuid: string, updateUserDto: UpdateUserDto): Promise<User>;
    getDashboard(uuid: string): Promise<{
        balance: number;
        total_recharges: number;
        pending_recharges: number;
        total_transactions: number;
        open_tickets: number;
    }>;
}
