import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  // Swagger Config
  const config = new DocumentBuilder()
    .setTitle('WSD Crawler APIs')
    .setDescription('WSD Crawler API description')
    .setVersion('1.0')
    .addTag('WSD Crawler')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
