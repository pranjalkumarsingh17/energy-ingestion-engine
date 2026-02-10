import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import config from './config';


async function startServer() {
  const app = await NestFactory.create(AppModule);
  const port = config.PORT;

  await app.listen(port);

  console.log(`🚀 Fleet Ingestion Service running on port ${port}`);
}
startServer();
