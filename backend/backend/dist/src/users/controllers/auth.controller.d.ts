import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
        message: string;
        data: {
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
        };
    }>;
    login(loginDto: LoginDto): Promise<{
        message: string;
        data: {
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
        };
    }>;
}
