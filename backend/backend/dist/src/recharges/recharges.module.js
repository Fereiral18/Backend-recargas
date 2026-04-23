"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RechargesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const recharges_controller_1 = require("./controllers/recharges.controller");
const recharges_service_1 = require("./services/recharges.service");
const recharge_entity_1 = require("./entities/recharge.entity");
const user_entity_1 = require("../users/entities/user.entity");
let RechargesModule = class RechargesModule {
};
exports.RechargesModule = RechargesModule;
exports.RechargesModule = RechargesModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([recharge_entity_1.Recharge, user_entity_1.User])],
        controllers: [recharges_controller_1.RechargesController],
        providers: [recharges_service_1.RechargesService],
        exports: [recharges_service_1.RechargesService],
    })
], RechargesModule);
//# sourceMappingURL=recharges.module.js.map