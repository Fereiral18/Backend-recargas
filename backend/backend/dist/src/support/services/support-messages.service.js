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
exports.SupportMessagesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const support_message_entity_1 = require("../entities/support-message.entity");
let SupportMessagesService = class SupportMessagesService {
    messageRepository;
    constructor(messageRepository) {
        this.messageRepository = messageRepository;
    }
    async create(ticket_id, user_id, createMessageDto) {
        const message = this.messageRepository.create({
            ticket_id,
            user_id,
            ...createMessageDto,
        });
        return this.messageRepository.save(message);
    }
    async findByTicket(ticket_id) {
        return this.messageRepository.find({
            where: { ticket_id },
            order: { created_at: 'ASC' },
        });
    }
    async markAsRead(uuid) {
        const message = await this.messageRepository.findOne({ where: { uuid } });
        if (!message) {
            throw new common_1.NotFoundException('Message not found');
        }
        message.is_read = true;
        return this.messageRepository.save(message);
    }
};
exports.SupportMessagesService = SupportMessagesService;
exports.SupportMessagesService = SupportMessagesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(support_message_entity_1.SupportMessage)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SupportMessagesService);
//# sourceMappingURL=support-messages.service.js.map