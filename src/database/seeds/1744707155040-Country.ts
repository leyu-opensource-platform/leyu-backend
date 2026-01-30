import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
export default class Country1744707155040 implements Seeder {
  track = false;

  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    await dataSource.query(`
            INSERT INTO country (id, name, code, continent)
            VALUES
              ('460e2d8b-bd31-42f6-9195-301bb7677156', 'Nigeria', 'NGR', 'Africa'),
              ('732b9995-9d90-49b7-86d0-411a4905fa91', 'Ghana', 'GHN', 'Africa'),
              ('2dc902b4-5aef-4ecd-b1e2-ad25bf0f8ada', 'Tanzania', 'TZN', 'Africa'),
              ('61bd7c1b-c389-4497-ac85-cd74ef753805', 'Kenya', 'KEY', 'Africa'),
              ('e42b4521-a2ae-45f0-9d02-9f81d4018a8e', 'Uganda', 'UGD', 'Africa');
          `);
  }
}
