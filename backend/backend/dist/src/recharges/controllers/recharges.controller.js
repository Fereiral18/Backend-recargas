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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RechargesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const recharges_service_1 = require("../services/recharges.service");
const create_recharge_dto_1 = require("../dto/create-recharge.dto");
const update_recharge_dto_1 = require("../dto/update-recharge.dto");
const jwt_auth_guard_1 = require("../../users/guards/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
const multer_config_1 = require("../../common/config/multer.config");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const enums_1 = require("../../common/enums");
const path_1 = require("path");
const fs_1 = require("fs");
let RechargesController = class RechargesController {
    rechargesService;
    constructor(rechargesService) {
        this.rechargesService = rechargesService;
    }
    create(createRechargeDto, file) {
        if (file) {
            createRechargeDto.proof_image_path = `/uploads/proofs/${file.filename}`;
        }
        return this.rechargesService.create(createRechargeDto);
    }
    findAll(user_id, operator, status, search, page, limit) {
        return this.rechargesService.findAll({
            user_id,
            operator,
            status,
            search,
            page,
            limit,
        });
    }
    getStats(user_id) {
        return this.rechargesService.getStats(user_id);
    }
    findOne(uuid) {
        return this.rechargesService.findOne(uuid);
    }
    async getProofImage(uuid, user, res) {
        const recharge = await this.rechargesService.findOne(uuid);
        if (!recharge) {
            throw new common_1.NotFoundException('Recarga no encontrada');
        }
        if (recharge.user_id !== user.uuid && user.role !== enums_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('No tienes permiso para ver este comprobante');
        }
        if (!recharge.proof_image_path) {
            throw new common_1.NotFoundException('Esta recarga no tiene comprobante');
        }
        const fileName = recharge.proof_image_path.replace('/uploads/proofs/', '');
        const filePath = (0, path_1.join)(process.cwd(), 'uploads', 'proofs', fileName);
        if (!(0, fs_1.existsSync)(filePath)) {
            throw new common_1.NotFoundException('Archivo de comprobante no encontrado');
        }
        return res.sendFile(filePath);
    }
    async cancelByUser(uuid, user) {
        return this.rechargesService.cancelByUser(uuid, user.uuid);
    }
    update(uuid, updateRechargeDto) {
        return this.rechargesService.update(uuid, updateRechargeDto);
    }
};
exports.RechargesController = RechargesController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new recharge' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('proof_image', multer_config_1.multerConfig)),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_recharge_dto_1.CreateRechargeDto, Object]),
    __metadata("design:returntype", void 0)
], RechargesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all recharges with filters' }),
    __param(0, (0, common_1.Query)('user_id')),
    __param(1, (0, common_1.Query)('operator')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Query)('page')),
    __param(5, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Number, Number]),
    __metadata("design:returntype", void 0)
], RechargesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get recharge statistics' }),
    __param(0, (0, common_1.Query)('user_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RechargesController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':uuid'),
    (0, swagger_1.ApiOperation)({ summary: 'Get recharge by UUID' }),
    __param(0, (0, common_1.Param)('uuid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RechargesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':uuid/proof'),
    (0, swagger_1.ApiOperation)({ summary: 'Get proof image for a recharge (protected)' }),
    __param(0, (0, common_1.Param)('uuid')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], RechargesController.prototype, "getProofImage", null);
__decorate([
    (0, common_1.Patch)(':uuid/cancel'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel own recharge (only if PENDING and < 10 min old)' }),
    __param(0, (0, common_1.Param)('uuid')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RechargesController.prototype, "cancelByUser", null);
__decorate([
    (0, common_1.Patch)(':uuid'),
    (0, swagger_1.ApiOperation)({ summary: 'Update recharge' }),
    __param(0, (0, common_1.Param)('uuid')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_recharge_dto_1.UpdateRechargeDto]),
    __metadata("design:returntype", void 0)
], RechargesController.prototype, "update", null);
exports.RechargesController = RechargesController = __decorate([
    (0, swagger_1.ApiTags)('recharges'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('recharges'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [recharges_service_1.RechargesService])
], RechargesController);
//# sourceMappingURL=recharges.controller.js.map