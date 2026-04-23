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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../entities/user.entity");
let UsersService = class UsersService {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async findAll(filters = {}) {
        const { role, status, search, page = 1, limit = 20 } = filters;
        const query = this.userRepository.createQueryBuilder('user');
        if (role) {
            query.andWhere('user.role = :role', { role });
        }
        if (status) {
            query.andWhere('user.status = :status', { status });
        }
        if (search) {
            query.andWhere('(user.email ILIKE :search OR user.first_name ILIKE :search OR user.last_name ILIKE :search OR user.phone ILIKE :search)', { search: `%${search}%` });
        }
        const [users, total] = await query
            .select([
            'user.uuid',
            'user.email',
            'user.phone',
            'user.first_name',
            'user.last_name',
            'user.role',
            'user.status',
            'user.balance',
            'user.last_login',
            'user.email_verified',
            'user.created_at',
        ])
            .orderBy('user.created_at', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
        return { users, total, page, limit };
    }
    async count() {
        return this.userRepository.count();
    }
    async findOne(uuid) {
        const user = await this.userRepository.findOne({ where: { uuid } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const { password_hash, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    async update(uuid, updateUserDto) {
        const user = await this.userRepository.findOne({ where: { uuid } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        Object.assign(user, updateUserDto);
        await this.userRepository.save(user);
        const { password_hash, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    async getDashboard(uuid) {
        const user = await this.findOne(uuid);
        return {
            balance: user.balance,
            total_recharges: 0,
            pending_recharges: 0,
            total_transactions: 0,
            open_tickets: 0,
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map