"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerConfig = void 0;
const swagger_1 = require("@nestjs/swagger");
exports.swaggerConfig = new swagger_1.DocumentBuilder()
    .setTitle('Gaming Recharges API')
    .setDescription('API for gaming recharges platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
//# sourceMappingURL=swagger.config.js.map