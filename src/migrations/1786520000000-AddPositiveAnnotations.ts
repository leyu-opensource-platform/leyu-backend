import { MigrationInterface, QueryRunner } from 'typeorm';

const AUDIO_QUALITY_ANNOTATION_TYPE_ID = '92e676cb-517f-4c4a-9546-5d586fc14da0';
const ANNOTATION_IDS = {
  cleanAudio: '92e676cb-517f-4c4a-9546-5d586fc14da6',
  clearPronunciation: '92e676cb-517f-4c4a-9546-5d586fc14da7',
  naturalPacing: '92e676cb-517f-4c4a-9546-5d586fc14da8',
};

export class AddPositiveAnnotations1786520000000
  implements MigrationInterface
{
  name = 'AddPositiveAnnotations1786520000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const annotations: [string, string, string][] = [
      [
        ANNOTATION_IDS.cleanAudio,
        'Good Audio Quality',
        'Clean, clear recording with no background noise or distortion.',
      ],
      [
        ANNOTATION_IDS.clearPronunciation,
        'Clear Pronunciation',
        'Speaker pronounced every word clearly and correctly.',
      ],
      [
        ANNOTATION_IDS.naturalPacing,
        'Natural Speech',
        'Natural pacing and intonation, sounds like genuine spoken language.',
      ],
    ];

    for (const [id, name, description] of annotations) {
      await queryRunner.query(
        `INSERT INTO "setting"."annotation" ("id", "name", "description", "annotation_type_id")
         VALUES ($1, $2, $3, $4)
         ON CONFLICT ("name") DO NOTHING`,
        [id, name, description, AUDIO_QUALITY_ANNOTATION_TYPE_ID],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "setting"."annotation" WHERE "id" = ANY($1::uuid[])`,
      [Object.values(ANNOTATION_IDS)],
    );
  }
}
