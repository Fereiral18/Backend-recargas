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
exports.RechargesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const recharge_entity_1 = require("../entities/recharge.entity");
const enums_1 = require("../../common/enums");
const user_entity_1 = require("../../users/entities/user.entity");
let RechargesService = class RechargesService {
    rechargeRepository;
    userRepository;
    dataSource;
    constructor(rechargeRepository, userRepository, dataSource) {
        this.rechargeRepository = rechargeRepository;
        this.userRepository = userRepository;
        this.dataSource = dataSource;
    }
    async create(createRechargeDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const fee = createRechargeDto.amount / 3;
            const total = createRechargeDto.amount;
            const recharge = this.rechargeRepository.create({
                ...createRechargeDto,
                fee: parseFloat(fee.toFixed(2)),
                total,
                reference: `RCH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                status: enums_1.RechargeStatus.PENDING,
            });
            await queryRunner.manager.save(recharge);
            await queryRunner.commitTransaction();
            return recharge;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async findAll(filters) {
        const query = this.rechargeRepository
            .createQueryBuilder('recharge')
            .leftJoinAndSelect('recharge.user', 'user');
        if (filters.user_id) {
            query.andWhere('recharge.user_id = :user_id', {
                user_id: filters.user_id,
            });
        }
        if (filters.operator) {
            query.andWhere('recharge.operator = :operator', {
                operator: filters.operator,
            });
        }
        if (filters.status) {
            query.andWhere('recharge.status = :status', { status: filters.status });
        }
        if (filters.search) {
            query.andWhere('(recharge.reference ILIKE :search OR recharge.phone_number ILIKE :search OR user.email ILIKE :search OR user.first_name ILIKE :search)', { search: `%${filters.search}%` });
        }
        const page = filters.page || 1;
        const limit = filters.limit || 20;
        query.skip((page - 1) * limit).take(limit);
        query.orderBy('recharge.created_at', 'DESC');
        const [recharges, total] = await query.getManyAndCount();
        return {
            data: recharges,
            total,
            page,
            limit,
        };
    }
    async findOne(uuid) {
        const recharge = await this.rechargeRepository.findOne({ where: { uuid } });
        if (!recharge) {
            throw new common_1.NotFoundException('Recharge not found');
        }
        return recharge;
    }
    async update(uuid, updateRechargeDto) {
        const recharge = await this.rechargeRepository.findOne({
            where: { uuid },
            relations: ['user'],
        });
        if (!recharge) {
            throw new common_1.NotFoundException('Recharge not found');
        }
        const previousStatus = recharge.status;
        Object.assign(recharge, updateRechargeDto);
        if (updateRechargeDto.status === enums_1.RechargeStatus.COMPLETED && previousStatus !== enums_1.RechargeStatus.COMPLETED) {
            recharge.completed_at = new Date();
            if (recharge.user) {
                const currentBalance = parseFloat(recharge.user.balance?.toString() || '0');
                recharge.user.balance = currentBalance + parseFloat(recharge.amount.toString());
                await this.userRepository.save(recharge.user);
            }
        }
        return this.rechargeRepository.save(recharge);
    }
    async getStats(user_id) {
        const baseQuery = this.rechargeRepository.createQueryBuilder('recharge');
        if (user_id) {
            baseQuery.where('recharge.user_id = :user_id', { user_id });
        }
        const total = await baseQuery.clone().getCount();
        const pending = await baseQuery
            .clone()
            .andWhere('recharge.status = :status', { status: enums_1.RechargeStatus.PENDING })
            .getCount();
        const completed = await baseQuery
            .clone()
            .andWhere('recharge.status = :status', { status: enums_1.RechargeStatus.COMPLETED })
            .getCount();
        const failed = await baseQuery
            .clone()
            .andWhere('recharge.status = :status', { status: enums_1.RechargeStatus.FAILED })
            .getCount();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayQuery = baseQuery.clone().andWhere('recharge.created_at >= :today', { today });
        const todayTotal = await todayQuery.clone().getCount();
        const todayPending = await todayQuery
            .clone()
            .andWhere('recharge.status = :status', { status: enums_1.RechargeStatus.PENDING })
            .getCount();
        const todayAmountResult = await this.rechargeRepository
            .createQueryBuilder('recharge')
            .select('COALESCE(SUM(recharge.amount), 0)', 'total')
            .where('recharge.created_at >= :today', { today })
            .andWhere('recharge.status = :status', { status: enums_1.RechargeStatus.COMPLETED })
            .getRawOne();
        return {
            total,
            pending,
            completed,
            failed,
            todayTotal,
            todayPending,
            todayAmount: parseFloat(todayAmountResult?.total || 0),
        };
    }
    async cancelByUser(uuid, userId) {
        const recharge = await this.rechargeRepository.findOne({
            where: { uuid },
        });
        if (!recharge) {
            throw new common_1.NotFoundException('Recarga no encontrada');
        }
        if (recharge.user_id !== userId) {
            throw new common_1.NotFoundException('Recarga no encontrada');
        }
        if (recharge.status !== enums_1.RechargeStatus.PENDING) {
            throw new common_1.BadRequestException('Solo puedes cancelar recargas pendientes');
        }
        const createdAt = new Date(recharge.created_at);
        const now = new Date();
        const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
        if (diffMinutes > 10) {
            throw new common_1.BadRequestException('Solo puedes cancelar recargas dentro de los primeros 10 minutos');
        }
        recharge.status = enums_1.RechargeStatus.CANCELLED;
        return this.rechargeRepository.save(recharge);
    }
};
exports.RechargesService = RechargesService;
exports.RechargesService = RechargesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(recharge_entity_1.Recharge)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], RechargesService);
//# sourceMappingURL=recharges.service.js.map