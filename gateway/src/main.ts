import { NestFactory } from '@nestjs/core';
import { AppModule } from './gateway.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { RpcExceptionFilter } from './filters/rpcExceptionFilter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalFilters(new RpcExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('Kanban')
    .setDescription('Kanban description')
    .setVersion('1.0')
    .addTag('kanban')
    .addBearerAuth()
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT;

  await app.listen(port, () => {
    console.log(`Gateway is running on port ${port}`);
  });
}
bootstrap();
