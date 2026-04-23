import type { Response } from 'express';
import { RechargesService } from '../services/recharges.service';
import { CreateRechargeDto } from '../dto/create-recharge.dto';
import { UpdateRechargeDto } from '../dto/update-recharge.dto';
import { UserRole } from '../../common/enums';
export declare class RechargesController {
    private readonly rechargesService;
    constructor(rechargesService: RechargesService);
    create(createRechargeDto: CreateRechargeDto, file?: Express.Multer.File): Promise<import("../entities/recharge.entity").Recharge>;
    findAll(user_id?: string, operator?: string, status?: string, search?: string, page?: number, limit?: number): Promise<{
        data: import("../entities/recharge.entity").Recharge[];
        total: number;
        page: any;
        limit: any;
    }>;
    getStats(user_id?: string): Promise<{
        total: number;
        pending: number;
        completed: number;
        failed: number;
        todayTotal: number;
        todayPending: number;
        todayAmount: number;
    }>;
    findOne(uuid: string): Promise<import("../entities/recharge.entity").Recharge>;
    getProofImage(uuid: string, user: {
        uuid: string;
        role: UserRole;
    }, res: Response): Promise<void>;
    cancelByUser(uuid: string, user: {
        uuid: string;
        role: UserRole;
    }): Promise<import("../entities/recharge.entity").Recharge>;
    update(uuid: string, updateRechargeDto: UpdateRechargeDto): Promise<import("../entities/recharge.entity").Recharge>;
}
