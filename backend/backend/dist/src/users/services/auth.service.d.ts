import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
export declare class AuthService {
    private readonly userRepository;
    private readonly jwtService;
    constructor(userRepository: Repository<User>, jwtService: JwtService);
    register(registerDto: RegisterDto): Promise<{
        access_token: string;
        user: {
            uuid: string;
            email: string;
            phone: string;
            first_name: string;
            last_name: string;
            role: string;
            status: string;
            balance: number;
            last_login: Date;
            email_verified: boolean;
            created_at: Date;
            updated_at: Date;
            transactions: import("typeorm").Transaction[];
            recharges: Recharge[];
            tickets: import("../../support/entities/support-ticket.entity").SupportTicket[];
            assigned_tickets: import("../../support/entities/support-ticket.entity").SupportTicket[];
            messages: SupportMessage[];
        };
    }>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            uuid: string;
            email: string;
            phone: string;
            first_name: string;
            last_name: string;
            role: string;
            status: string;
            balance: number;
            last_login: Date;
            email_verified: boolean;
            created_at: Date;
            updated_at: Date;
            transactions: import("typeorm").Transaction[];
            recharges: Recharge[];
            tickets: import("../../support/entities/support-ticket.entity").SupportTicket[];
            assigned_tickets: import("../../support/entities/support-ticket.entity").SupportTicket[];
            messages: SupportMessage[];
        };
    }>;
    validateUser(uuid: string): Promise<User>;
}
