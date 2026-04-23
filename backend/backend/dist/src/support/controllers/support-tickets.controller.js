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
exports.SupportTicketsController = void 0;
const common_1 = require("@nestjs/common");
const support_tickets_service_1 = require("../services/support-tickets.service");
const create_ticket_dto_1 = require("../dto/create-ticket.dto");
const update_ticket_dto_1 = require("../dto/update-ticket.dto");
const jwt_auth_guard_1 = require("../../users/guards/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
let SupportTicketsController = class SupportTicketsController {
    ticketsService;
    constructor(ticketsService) {
        this.ticketsService = ticketsService;
    }
    create(req, createTicketDto) {
        return this.ticketsService.create(req.user.uuid, createTicketDto);
    }
    findAll(user_id, assigned_to, status, priority, search, page, limit) {
        return this.ticketsService.findAll({
            user_id,
            assigned_to,
            status,
            priority,
            search,
            page,
            limit,
        });
    }
    getStats(user_id) {
        return this.ticketsService.getStats(user_id);
    }
    findOne(uuid) {
        return this.ticketsService.findOne(uuid);
    }
    update(uuid, updateTicketDto) {
        return this.ticketsService.update(uuid, updateTicketDto);
    }
};
exports.SupportTicketsController = SupportTicketsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new support ticket' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_ticket_dto_1.CreateTicketDto]),
    __metadata("design:returntype", void 0)
], SupportTicketsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all tickets with filters' }),
    __param(0, (0, common_1.Query)('user_id')),
    __param(1, (0, common_1.Query)('assigned_to')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('priority')),
    __param(4, (0, common_1.Query)('search')),
    __param(5, (0, common_1.Query)('page')),
    __param(6, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, Number, Number]),
    __metadata("design:returntype", void 0)
], SupportTicketsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get ticket statistics' }),
    __param(0, (0, common_1.Query)('user_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SupportTicketsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':uuid'),
    (0, swagger_1.ApiOperation)({ summary: 'Get ticket by UUID' }),
    __param(0, (0, common_1.Param)('uuid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SupportTicketsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':uuid'),
    (0, swagger_1.ApiOperation)({ summary: 'Update ticket' }),
    __param(0, (0, common_1.Param)('uuid')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_ticket_dto_1.UpdateTicketDto]),
    __metadata("design:returntype", void 0)
], SupportTicketsController.prototype, "update", null);
exports.SupportTicketsController = SupportTicketsController = __decorate([
    (0, swagger_1.ApiTags)('support/tickets'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('support/tickets'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [support_tickets_service_1.SupportTicketsService])
], SupportTicketsController);
//# sourceMappingURL=support-tickets.controller.js.map