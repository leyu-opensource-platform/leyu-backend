import { MigrationInterface, QueryRunner } from 'typeorm';

const FLAG_TYPE_IDS = {
  inappropriateContent: '92e676cb-517f-4c4a-9546-5d586fc14db1',
  suspectedFraud: '92e676cb-517f-4c4a-9546-5d586fc14db2',
  audioQualityConcern: '92e676cb-517f-4c4a-9546-5d586fc14db3',
  needsSecondOpinion: '92e676cb-517f-4c4a-9546-5d586fc14db4',
  other: '92e676cb-517f-4c4a-9546-5d586fc14db5',
};

export class SeedDefaultFlagTypes1786510000000 implements MigrationInterface {
  name = 'SeedDefaultFlagTypes1786510000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const flagTypes: [string, string, string][] = [
      [
        FLAG_TYPE_IDS.inappropriateContent,
        'Inappropriate Content',
        'Submission contains offensive, unsafe, or otherwise inappropriate content.',
      ],
      [
        FLAG_TYPE_IDS.suspectedFraud,
        'Suspected Fraud or Duplicate',
        'Submission looks copied, replayed, or otherwise not a genuine original recording.',
      ],
      [
        FLAG_TYPE_IDS.audioQualityConcern,
        'Audio Quality Concern',
        'Recording quality issue worth flagging for a second opinion beyond a simple reject.',
      ],
      [
        FLAG_TYPE_IDS.needsSecondOpinion,
        'Needs Second Opinion',
        'Reviewer is unsure and wants another reviewer or the PM to weigh in.',
      ],
      [
        FLAG_TYPE_IDS.other,
        'Other',
        'Any other reason that does not fit the categories above.',
      ],
    ];

    for (const [id, name, description] of flagTypes) {
      await queryRunner.query(
        `INSERT INTO "setting"."flag_type" ("id", "name", "description")
         VALUES ($1, $2, $3)
         ON CONFLICT ("name") DO NOTHING`,
        [id, name, description],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "setting"."flag_type" WHERE "id" = ANY($1::uuid[])`,
      [Object.values(FLAG_TYPE_IDS)],
    );
  }
}
