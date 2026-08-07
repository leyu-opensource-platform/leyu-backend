import {
  Country,
  Language,
  Region,
  RejectionType,
} from 'src/base_data/entities';
import { DataSource, In } from 'typeorm';

export async function seedCountries(dataSource: DataSource): Promise<void> {
  const repository = dataSource.getRepository(Country);
  await repository.insert([
    {
      id: '911f08f2-4ed4-4a43-819a-0e83b1aa102d',
      name: 'Ethiopia',
      code: 'ETH',
      continent: 'Africa',
    },
    {
      id: '460e2d8b-bd31-42f6-9195-301bb7677156',
      name: 'Nigeria',
      code: 'NGR',
      continent: 'Africa',
    },
    {
      id: '732b9995-9d90-49b7-86d0-411a4905fa91',
      name: 'Ghana',
      code: 'GHN',
      continent: 'Africa',
    },
    {
      id: '2dc902b4-5aef-4ecd-b1e2-ad25bf0f8ada',
      name: 'Tanzania',
      code: 'TZN',
      continent: 'Africa',
    },
    {
      id: '61bd7c1b-c389-4497-ac85-cd74ef753805',
      name: 'Kenya',
      code: 'KEN',
      continent: 'Africa',
    },
    {
      id: 'e42b4521-a2ae-45f0-9d02-9f81d4018a8e',
      name: 'Uganda',
      code: 'UGA',
      continent: 'Africa',
    },
  ]);
}

export async function clearCountries(dataSource: DataSource): Promise<void> {
  const repository = dataSource.getRepository(Country);
  await repository.delete({
    id: In([
      '911f08f2-4ed4-4a43-819a-0e83b1aa102d',
      '460e2d8b-bd31-42f6-9195-301bb7677156',
      '732b9995-9d90-49b7-86d0-411a4905fa91',
      '2dc902b4-5aef-4ecd-b1e2-ad25bf0f8ada',
      '61bd7c1b-c389-4497-ac85-cd74ef753805',
      'e42b4521-a2ae-45f0-9d02-9f81d4018a8e',
    ]),
  });
}
export async function seedRegions(dataSource: DataSource): Promise<void> {
  const repository = dataSource.getRepository(Region);
  // id should be uuid
  await repository.insert([
    {
      id: '92e676cb-517f-4c4a-9546-5d586fc14d80',
      name: 'Oromia',
      country_id: '911f08f2-4ed4-4a43-819a-0e83b1aa102d',
    },
    {
      id: '92e676cb-517f-4c4a-9546-5d586fc14d81',
      name: 'Tigray',
      country_id: '911f08f2-4ed4-4a43-819a-0e83b1aa102d',
    },
    {
      id: '92e676cb-517f-4c4a-9546-5d586fc14d82',
      name: 'Addis Ababa',
      country_id: '911f08f2-4ed4-4a43-819a-0e83b1aa102d',
    },
    {
      id: '92e676cb-517f-4c4a-9546-5d586fc14d83',
      name: 'Sidama',
      country_id: '911f08f2-4ed4-4a43-819a-0e83b1aa102d',
    },
    {
      id: '92e676cb-517f-4c4a-9546-5d586fc14d84',
      name: 'Afar',
      country_id: '911f08f2-4ed4-4a43-819a-0e83b1aa102d',
    },
    {
      id: '92e676cb-517f-4c4a-9546-5d586fc14d85',
      name: 'Somali',
      country_id: '911f08f2-4ed4-4a43-819a-0e83b1aa102d',
    },
    {
      id: '92e676cb-517f-4c4a-9546-5d586fc14d86',
      name: 'Central Ethiopia',
      country_id: '911f08f2-4ed4-4a43-819a-0e83b1aa102d',
    },
  ]);
}
export async function clearRegions(dataSource: DataSource): Promise<void> {
  const repository = dataSource.getRepository(Region);
  await repository.delete({
    id: In([
      '92e676cb-517f-4c4a-9546-5d586fc14d80',
      '92e676cb-517f-4c4a-9546-5d586fc14d81',
      '92e676cb-517f-4c4a-9546-5d586fc14d82',
      '92e676cb-517f-4c4a-9546-5d586fc14d83',
      '92e676cb-517f-4c4a-9546-5d586fc14d84',
      '92e676cb-517f-4c4a-9546-5d586fc14d85',
      '92e676cb-517f-4c4a-9546-5d586fc14d86',
    ]),
  });
}

export async function seedRejectionTypes(
  dataSource: DataSource,
): Promise<void> {
  const repository = dataSource.getRepository(RejectionType);
  await repository.insert([
    {
      id: '92e676cb-517f-4c4a-9546-5d586fc14d70',
      name: 'Not Qualified',
      description: 'Not Qualified',
    },
    {
      id: '92e676cb-517f-4c4a-9546-5d586fc14d71',
      name: 'Not Sufficient',
      description: 'Not Sufficient',
    },
    {
      id: '92e676cb-517f-4c4a-9546-5d586fc14d72',
      name: 'Low Audio Quality',
      description: 'Not Applicable',
    },
  ]);
}
export async function clearRejectionTypes(
  dataSource: DataSource,
): Promise<void> {
  const repository = dataSource.getRepository(RejectionType);
  await repository.delete({
    id: In([
      '92e676cb-517f-4c4a-9546-5d586fc14d70',
      '92e676cb-517f-4c4a-9546-5d586fc14d71',
      '92e676cb-517f-4c4a-9546-5d586fc14d72',
    ]),
  });
}

export async function seedLanguages(dataSource: DataSource): Promise<void> {
  const repository = dataSource.getRepository(Language);
  await repository.insert([
    {
      id: '92e676cb-517f-4c4a-9546-5d586fc14d90',
      name: 'Amharic',
      code: 'amh',
    },
    {
      id: '92e676cb-517f-4c4a-9546-5d586fc14d91',
      name: 'Oromo',
      code: 'om',
    },
    {
      id: '92e676cb-517f-4c4a-9546-5d586fc14d92',
      name: 'Tigrigna',
      code: 'tg',
    },
  ]);
}
export async function clearLanguages(dataSource: DataSource): Promise<void> {
  const repository = dataSource.getRepository('Language');
  await repository.delete({
    id: In([
      '92e676cb-517f-4c4a-9546-5d586fc14d90',
      '92e676cb-517f-4c4a-9546-5d586fc14d91',
      '92e676cb-517f-4c4a-9546-5d586fc14d92',
    ]),
  });
}

export async function seedDialects(dataSource: DataSource): Promise<void> {
  const repository = dataSource.getRepository('Dialect');
  await repository.insert([
    {
      id: '92e676cb-517f-4c4a-9546-5d586fc14d95',
      name: 'Shewa Dialect',
      language_id: '92e676cb-517f-4c4a-9546-5d586fc14d90',
    },
    {
      id: '92e676cb-517f-4c4a-9546-5d586fc14d96',
      name: 'Shawa Dialect',
      language_id: '92e676cb-517f-4c4a-9546-5d586fc14d91',
    },
    {
      id: '92e676cb-517f-4c4a-9546-5d586fc14d97',
      name: 'Raya Dialect',
      language_id: '92e676cb-517f-4c4a-9546-5d586fc14d92',
    },
  ]);
}
export async function clearDialects(dataSource: DataSource): Promise<void> {
  const repository = dataSource.getRepository('Dialect');
  await repository.delete({
    id: In([
      '92e676cb-517f-4c4a-9546-5d586fc14d95',
      '92e676cb-517f-4c4a-9546-5d586fc14d96',
      '92e676cb-517f-4c4a-9546-5d586fc14d97',
    ]),
  });
}
