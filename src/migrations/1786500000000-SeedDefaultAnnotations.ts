import { MigrationInterface, QueryRunner } from 'typeorm';

const ANNOTATION_TYPE_ID = '92e676cb-517f-4c4a-9546-5d586fc14da0';
const ANNOTATION_IDS = {
  backgroundNoise: '92e676cb-517f-4c4a-9546-5d586fc14da1',
  mispronunciation: '92e676cb-517f-4c4a-9546-5d586fc14da2',
  clippedAudio: '92e676cb-517f-4c4a-9546-5d586fc14da3',
  lowVolume: '92e676cb-517f-4c4a-9546-5d586fc14da4',
  other: '92e676cb-517f-4c4a-9546-5d586fc14da5',
};

export class SeedDefaultAnnotations1786500000000
  implements MigrationInterface
{
  name = 'SeedDefaultAnnotations1786500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO "setting"."annotation_type" ("id", "name", "description")
       VALUES ($1, 'Audio Quality', 'Notes on the quality of the recorded audio submission.')
       ON CONFLICT ("name") DO NOTHING`,
      [ANNOTATION_TYPE_ID],
    );

    const annotations: [string, string, string][] = [
      [
        ANNOTATION_IDS.backgroundNoise,
        'Background Noise',
        'Recording has noticeable background noise.',
      ],
      [
        ANNOTATION_IDS.mispronunciation,
        'Mispronunciation',
        'Speaker mispronounced one or more words in the prompt.',
      ],
      [
        ANNOTATION_IDS.clippedAudio,
        'Clipped Audio',
        'Recording is cut off at the start or end.',
      ],
      [
        ANNOTATION_IDS.lowVolume,
        'Low Volume',
        'Recording volume is too low to clearly hear the speaker.',
      ],
      [
        ANNOTATION_IDS.other,
        'Other',
        'Any other note that does not fit the categories above.',
      ],
    ];

    for (const [id, name, description] of annotations) {
      await queryRunner.query(
        `INSERT INTO "setting"."annotation" ("id", "name", "description", "annotation_type_id")
         VALUES ($1, $2, $3, $4)
         ON CONFLICT ("name") DO NOTHING`,
        [id, name, description, ANNOTATION_TYPE_ID],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "setting"."annotation" WHERE "id" = ANY($1::uuid[])`,
      [Object.values(ANNOTATION_IDS)],
    );
    await queryRunner.query(
      `DELETE FROM "setting"."annotation_type" WHERE "id" = $1`,
      [ANNOTATION_TYPE_ID],
    );
  }
}
