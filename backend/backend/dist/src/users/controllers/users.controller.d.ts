import { UsersService } from '../services/users.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import type { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(req: AuthenticatedRequest, role?: string, status?: string, search?: string, page?: number, limit?: number): Promise<{
        message: string;
        data: import("../entities/user.entity").User[];
        meta: {
            total: number;
            page: number;
            limit: number;
        };
    }>;
    getStats(req: AuthenticatedRequest): Promise<{
        message: string;
        data: {
            total: number;
        };
    }>;
    getProfile(req: AuthenticatedRequest): Promise<{
        message: string;
        data: import("../entities/user.entity").User;
    }>;
    getDashboard(req: AuthenticatedRequest): Promise<{
        message: string;
        data: {
            balance: number;
            total_recharges: number;
            pending_recharges: number;
            total_transactions: number;
            open_tickets: number;
        };
    }>;
    updateProfile(req: AuthenticatedRequest, updateUserDto: UpdateUserDto): Promise<{
        message: string;
        data: import("../entities/user.entity").User;
    }>;
}
