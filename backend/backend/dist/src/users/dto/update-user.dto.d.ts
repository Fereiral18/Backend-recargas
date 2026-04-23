import { UserRole, UserStatus } from '../../common/enums';
export declare class UpdateUserDto {
    email?: string;
    phone?: string;
    first_name?: string;
    last_name?: string;
    role?: UserRole;
    status?: UserStatus;
    balance?: number;
}
