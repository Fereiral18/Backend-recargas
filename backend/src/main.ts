import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { swaggerConfig } from './core/swagger.config';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // NO servir uploads públicamente - se accede via endpoint protegido
  // GET /recharges/:uuid/proof
   const port = process.env.PORT ?? 4000;
  
  // Enable CORS for frontend integration
  app.enableCors({
    origin:  [process.env.FRONTEND_URL || 'http://localhost:5173', "https://backend-recargas.vercel.app/"],
    credentials: true,
  });
  
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }));
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);
  await app.listen(port,'0.0.0.0')
  console.log(`✅ Application is running on: http://localhost:${port}`);
    console.log(`📚 Swagger UI: http://localhost:${port}/api`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
}
void bootstrap();
