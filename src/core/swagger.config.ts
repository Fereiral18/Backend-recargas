import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Gaming Recharges API')
  .setDescription('API for gaming recharges platform')
  .setVersion('1.0')
  .addBearerAuth()
  .build();
