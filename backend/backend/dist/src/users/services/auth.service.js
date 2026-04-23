"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcryptjs"));
const user_entity_1 = require("../entities/user.entity");
const enums_1 = require("../../common/enums");
let AuthService = class AuthService {
    userRepository;
    jwtService;
    constructor(userRepository, jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }
    async register(registerDto) {
        try {
            const existingUser = await this.userRepository.findOne({
                where: { email: registerDto.email },
            });
            if (existingUser) {
                throw new common_1.ConflictException('Email already exists');
            }
            const hashedPassword = await bcrypt.hash(registerDto.password, 10);
            const user = this.userRepository.create({
                email: registerDto.email,
                phone: registerDto.phone,
                first_name: registerDto.firstName,
                last_name: registerDto.lastName,
                password_hash: hashedPassword,
                role: enums_1.UserRole.USER,
                status: enums_1.UserStatus.ACTIVE,
            });
            const savedUser = await this.userRepository.save(user);
            const freshUser = await this.userRepository.findOne({
                where: { uuid: savedUser.uuid },
            });
            if (!freshUser) {
                throw new Error('Failed to retrieve created user');
            }
            const payload = { email: freshUser.email, sub: freshUser.uuid, role: freshUser.role };
            const access_token = this.jwtService.sign(payload);
            const { password_hash, ...userWithoutPassword } = freshUser;
            return {
                access_token,
                user: userWithoutPassword,
            };
        }
        catch (error) {
            if (error.code === '23505') {
                if (error.detail?.includes('phone')) {
                    throw new common_1.ConflictException('Phone number already exists');
                }
                if (error.detail?.includes('email')) {
                    throw new common_1.ConflictException('Email already exists');
                }
                throw new common_1.ConflictException('A user with this information already exists');
            }
            if (error.status === 409) {
                throw error;
            }
            console.error('Registration error:', error);
            throw error;
        }
    }
    async login(loginDto) {
        const user = await this.userRepository.findOne({
            where: { email: loginDto.email },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (user.status !== enums_1.UserStatus.ACTIVE) {
            throw new common_1.UnauthorizedException('Account is not active');
        }
        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password_hash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        user.last_login = new Date();
        await this.userRepository.save(user);
        const payload = { email: user.email, sub: user.uuid, role: user.role };
        const access_token = this.jwtService.sign(payload);
        const { password_hash, ...userWithoutPassword } = user;
        return {
            access_token,
            user: userWithoutPassword,
        };
    }
    async validateUser(uuid) {
        const user = await this.userRepository.findOne({ where: { uuid } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user.status !== enums_1.UserStatus.ACTIVE) {
            throw new common_1.UnauthorizedException('Account is not active');
        }
        return user;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map