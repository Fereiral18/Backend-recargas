import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { swaggerConfig } from './core/swagger.config';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Headers de seguridad estándar (X-Content-Type-Options, HSTS, frame-ancestors, etc.).
  // crossOriginResourcePolicy en 'cross-origin' porque el frontend vive en otro
  // origen y tiene que poder mostrar los comprobantes que sirve esta API.
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

  // Detrás de un proxy/load balancer (Render, Railway, Nginx...) la IP real del
  // cliente llega en X-Forwarded-For. Sin esto el rate limit vería a todos los
  // usuarios como la misma IP (la del proxy). TRUST_PROXY = cantidad de saltos, ej. 1.
  if (process.env.TRUST_PROXY) {
    app.set('trust proxy', Number(process.env.TRUST_PROXY) || process.env.TRUST_PROXY);
  }

  // NO servir uploads públicamente - se accede via endpoint protegido
  // GET /recharges/:uuid/proof
   const port = process.env.PORT ?? 4000;
  
  // Enable CORS for frontend integration
  app.enableCors({
    origin:  [process.env.FRONTEND_URL || 'http://localhost:5173', "https://backend-recargas.vercel.app"],
    credentials: true,
  });
  
  app.useGlobalPipes(new ValidationPipe({
    // Descarta cualquier campo que no esté declarado en el DTO: sin esto,
    // los `...dto` / Object.assign de los services copiaban a la base campos
    // arbitrarios del body (proof_image_path, user_id, tier_id, etc.).
    whitelist: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }));
  // En producción Swagger queda apagado (expone el mapa completo de la API)
  // salvo que se pida explícitamente con SWAGGER_ENABLED=true.
  const swaggerEnabled =
    process.env.NODE_ENV !== 'production' || process.env.SWAGGER_ENABLED === 'true';

  if (swaggerEnabled) {
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api', app, document);
  }

  await app.listen(port,'0.0.0.0')
  console.log(`✅ Application is running on: http://localhost:${port}`);
  if (swaggerEnabled) {
    console.log(`📚 Swagger UI: http://localhost:${port}/api`);
  }
    console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
}
void bootstrap();
