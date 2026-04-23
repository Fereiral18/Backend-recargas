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
exports.SupportMessage = void 0;
const typeorm_1 = require("typeorm");
const enums_1 = require("../../common/enums");
const user_entity_1 = require("../../users/entities/user.entity");
const support_ticket_entity_1 = require("./support-ticket.entity");
let SupportMessage = class SupportMessage {
    uuid;
    ticket_id;
    user_id;
    message;
    type;
    is_read;
    created_at;
    ticket;
    user;
};
exports.SupportMessage = SupportMessage;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SupportMessage.prototype, "uuid", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], SupportMessage.prototype, "ticket_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], SupportMessage.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], SupportMessage.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: enums_1.MessageType,
        default: enums_1.MessageType.USER_MESSAGE,
    }),
    __metadata("design:type", String)
], SupportMessage.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], SupportMessage.prototype, "is_read", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], SupportMessage.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => support_ticket_entity_1.SupportTicket, (ticket) => ticket.messages),
    (0, typeorm_1.JoinColumn)({ name: 'ticket_id' }),
    __metadata("design:type", support_ticket_entity_1.SupportTicket)
], SupportMessage.prototype, "ticket", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.messages),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], SupportMessage.prototype, "user", void 0);
exports.SupportMessage = SupportMessage = __decorate([
    (0, typeorm_1.Entity)('support_messages')
], SupportMessage);
//# sourceMappingURL=support-message.entity.js.map