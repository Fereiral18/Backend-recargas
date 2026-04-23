"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupportModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const support_tickets_controller_1 = require("./controllers/support-tickets.controller");
const support_messages_controller_1 = require("./controllers/support-messages.controller");
const support_controller_1 = require("./controllers/support.controller");
const support_tickets_service_1 = require("./services/support-tickets.service");
const support_messages_service_1 = require("./services/support-messages.service");
const support_service_1 = require("./services/support.service");
const support_ticket_entity_1 = require("./entities/support-ticket.entity");
const support_message_entity_1 = require("./entities/support-message.entity");
let SupportModule = class SupportModule {
};
exports.SupportModule = SupportModule;
exports.SupportModule = SupportModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([support_ticket_entity_1.SupportTicket, support_message_entity_1.SupportMessage])],
        controllers: [
            support_controller_1.SupportController,
            support_tickets_controller_1.SupportTicketsController,
            support_messages_controller_1.SupportMessagesController,
        ],
        providers: [support_service_1.SupportService, support_tickets_service_1.SupportTicketsService, support_messages_service_1.SupportMessagesService],
        exports: [support_service_1.SupportService],
    })
], SupportModule);
//# sourceMappingURL=support.module.js.map