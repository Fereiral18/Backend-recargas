import { Repository, DataSource } from 'typeorm';
import { Recharge } from '../entities/recharge.entity';
import { CreateRechargeDto } from '../dto/create-recharge.dto';
import { UpdateRechargeDto } from '../dto/update-recharge.dto';
import { User } from '../../users/entities/user.entity';
export declare class RechargesService {
    private readonly rechargeRepository;
    private readonly userRepository;
    private readonly dataSource;
    constructor(rechargeRepository: Repository<Recharge>, userRepository: Repository<User>, dataSource: DataSource);
    create(createRechargeDto: CreateRechargeDto): Promise<Recharge>;
    findAll(filters: any): Promise<{
        data: Recharge[];
        total: number;
        page: any;
        limit: any;
    }>;
    findOne(uuid: string): Promise<Recharge>;
    update(uuid: string, updateRechargeDto: UpdateRechargeDto): Promise<Recharge>;
    getStats(user_id?: string): Promise<{
        total: number;
        pending: number;
        completed: number;
        failed: number;
        todayTotal: number;
        todayPending: number;
        todayAmount: number;
    }>;
    cancelByUser(uuid: string, userId: string): Promise<Recharge>;
}
