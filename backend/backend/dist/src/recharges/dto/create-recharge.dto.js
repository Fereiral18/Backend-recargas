"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateRechargeDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const enums_1 = require("../../common/enums");
const class_transformer_1 = require("class-transformer");
class CreateRechargeDto {
    user_id;
    type;
    phone_number;
    operator;
    amount;
    fee;
    package;
    currency;
    payment_method;
    transaction_id;
    proof_image;
    proof_image_path;
}
exports.CreateRechargeDto = CreateRechargeDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '010679af-f33c-4c22-8228-c38b46eb9e08',
        description: 'User UUID',
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateRechargeDto.prototype, "user_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'DIAMONDS',
        description: 'Type of recharge',
        enum: enums_1.RechargeType,
    }),
    (0, class_validator_1.IsEnum)(enums_1.RechargeType),
    __metadata("design:type", String)
], CreateRechargeDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '1234567890',
        description: 'Player ID in the game',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRechargeDto.prototype, "phone_number", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'FREE_FIRE',
        description: 'Game operator',
        enum: enums_1.GameOperator,
    }),
    (0, class_validator_1.IsEnum)(enums_1.GameOperator),
    __metadata("design:type", String)
], CreateRechargeDto.prototype, "operator", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 50,
        description: 'Recharge amount',
    }),
    (0, class_transformer_1.Transform)(({ value }) => parseFloat(value)),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateRechargeDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 2.5,
        description: 'Service fee (optional, calculated automatically if not provided)',
        required: false,
    }),
    (0, class_transformer_1.Transform)(({ value }) => value ? parseFloat(value) : undefined),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateRechargeDto.prototype, "fee", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'SMALL',
        description: 'Diamond package ID (optional, only for Free Fire diamonds)',
        required: false,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateRechargeDto.prototype, "package", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'USDT',
        description: 'Payment currency',
        required: false,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateRechargeDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Binance',
        description: 'Payment method',
        required: false,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateRechargeDto.prototype, "payment_method", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '0x123abc456def',
        description: 'External transaction ID',
        required: false,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateRechargeDto.prototype, "transaction_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Proof image file',
        type: 'string',
        format: 'binary',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateRechargeDto.prototype, "proof_image", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '/uploads/proofs/abc123.jpg',
        description: 'Path to proof image (set by server)',
        required: false,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateRechargeDto.prototype, "proof_image_path", void 0);
//# sourceMappingURL=create-recharge.dto.js.map