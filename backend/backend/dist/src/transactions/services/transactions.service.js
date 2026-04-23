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
exports.TransactionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const transaction_entity_1 = require("../entities/transaction.entity");
const enums_1 = require("../../common/enums");
let TransactionsService = class TransactionsService {
    transactionRepository;
    constructor(transactionRepository) {
        this.transactionRepository = transactionRepository;
    }
    async create(createTransactionDto) {
        const fee = createTransactionDto.fee || 0;
        const net_amount = createTransactionDto.amount - fee;
        const transaction = this.transactionRepository.create({
            ...createTransactionDto,
            fee,
            net_amount,
            reference: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            currency: createTransactionDto.currency || 'USD',
            status: enums_1.TransactionStatus.PENDING,
        });
        return this.transactionRepository.save(transaction);
    }
    async findAll(filters) {
        const query = this.transactionRepository.createQueryBuilder('transaction');
        if (filters.user_id) {
            query.andWhere('transaction.user_id = :user_id', {
                user_id: filters.user_id,
            });
        }
        if (filters.type) {
            query.andWhere('transaction.type = :type', { type: filters.type });
        }
        if (filters.status) {
            query.andWhere('transaction.status = :status', {
                status: filters.status,
            });
        }
        const page = filters.page || 1;
        const limit = filters.limit || 20;
        query.skip((page - 1) * limit).take(limit);
        query.orderBy('transaction.created_at', 'DESC');
        const [transactions, total] = await query.getManyAndCount();
        return {
            data: transactions,
            total,
            page,
            limit,
        };
    }
    async findOne(uuid) {
        const transaction = await this.transactionRepository.findOne({
            where: { uuid },
        });
        if (!transaction) {
            throw new common_1.NotFoundException('Transaction not found');
        }
        return transaction;
    }
    async update(uuid, updateTransactionDto) {
        const transaction = await this.findOne(uuid);
        Object.assign(transaction, updateTransactionDto);
        if (updateTransactionDto.status === enums_1.TransactionStatus.COMPLETED) {
            transaction.completed_at = new Date();
        }
        return this.transactionRepository.save(transaction);
    }
    async getUserBalance(user_id) {
        const transactions = await this.transactionRepository.find({
            where: { user_id, status: enums_1.TransactionStatus.COMPLETED },
        });
        const balance = transactions.reduce((sum, t) => {
            if (t.type === 'DEPOSIT')
                return sum + Number(t.net_amount);
            return sum - Number(t.net_amount);
        }, 0);
        return {
            user_id,
            balance,
            total_transactions: transactions.length,
        };
    }
    async getStats(user_id) {
        const query = this.transactionRepository.createQueryBuilder('transaction');
        if (user_id) {
            query.where('transaction.user_id = :user_id', { user_id });
        }
        const total = await query.getCount();
        const pending = await query
            .clone()
            .andWhere('transaction.status = :status', { status: enums_1.TransactionStatus.PENDING })
            .getCount();
        return {
            total,
            pending,
            completed: total - pending,
        };
    }
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TransactionsService);
//# sourceMappingURL=transactions.service.js.map