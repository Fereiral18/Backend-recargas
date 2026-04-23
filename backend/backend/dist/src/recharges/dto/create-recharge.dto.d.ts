import { RechargeType, GameOperator } from '../../common/enums';
export declare class CreateRechargeDto {
    user_id: string;
    type: RechargeType;
    phone_number: string;
    operator: GameOperator;
    amount: number;
    fee?: number;
    package?: string;
    currency?: string;
    payment_method?: string;
    transaction_id?: string;
    proof_image?: Express.Multer.File;
    proof_image_path?: string;
}
