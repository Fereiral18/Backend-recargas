import { RechargeType, RechargeStatus, GameOperator } from '../../common/enums';
import { User } from '../../users/entities/user.entity';
export declare class Recharge {
    uuid: string;
    user_id: string;
    type: RechargeType;
    status: RechargeStatus;
    phone_number: string;
    operator: GameOperator;
    amount: number;
    fee: number;
    total: number;
    reference: string;
    package: string;
    currency: string;
    payment_method: string;
    transaction_id: string;
    proof_image_path: string;
    provider_reference: string;
    provider_response: any;
    created_at: Date;
    completed_at: Date;
    user: User;
}
