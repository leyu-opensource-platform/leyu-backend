// src/db/seeds/user.seeder.ts
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Role } from '../../auth/entities/Role.entity';
export default class UserSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const repository = dataSource.getRepository(Role);
    await repository.insert([
      {
        name: 'SuperAdmin',
        description: 'Super Admin',
      },
      {
        name: 'Admin',
        description: 'Admin',
      },
      {
        name: 'Contributor',
        description: 'Contributor',
      },
      {
        name: 'Facilitator',
        description: 'Facilitator',
      },
      {
        name: 'Reviewer',
        description: 'Reviewer',
      },
    ]);
  }
}
