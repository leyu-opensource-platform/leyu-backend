import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import {
  seedCountries,
  seedRegions,
  seedRejectionTypes,
  seedLanguages,
  seedDialects,
} from './seed.helper';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const dataSource = app.get(DataSource);
  console.log('Loading seed ... ');
  await seedCountries(dataSource);
  console.log('Countries seeded ... ');
  await seedRegions(dataSource);
  console.log('Regions seeded ... ');
  await seedRejectionTypes(dataSource);
  console.log('Rejection types seeded ... ');
  await seedLanguages(dataSource);
  console.log('Languages seeded ... ');
  await seedDialects(dataSource);
  console.log('Dialects seeded ... ');

  console.log('Seeding done ');
  await app.close();
}
bootstrap();
