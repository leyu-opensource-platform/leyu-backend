import { MigrationInterface, QueryRunner } from 'typeorm';

export class PublicSchemaMigration1710000000001 implements MigrationInterface {
  name = 'PublicSchemaMigration1710000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ─── ENUM types ───────────────────────────────────────────────────
    await queryRunner.query(
      `CREATE TYPE "public"."users_gender_enum" AS ENUM('Male', 'Female')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_verification_codes_status_enum" AS ENUM('pending', 'verified', 'expired')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."transaction_type_enum" AS ENUM('Credit', 'Withdraw')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."transaction_status_enum" AS ENUM('Pending', 'Done')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."project_status_enum" AS ENUM('Active', 'InActive')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."task_type_task_type_enum" AS ENUM('audio-text', 'text-audio', 'text-text')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."invitation_link_role_enum" AS ENUM('Contributor', 'Facilitator', 'Reviewer')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_task_role_enum" AS ENUM('Contributor', 'Facilitator', 'Reviewer')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_task_status_enum" AS ENUM('Active', 'InActive', 'Flagged', 'Rejected', 'Pending')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."data_set_status_enum" AS ENUM('Pending', 'Flagged', 'Approved', 'Rejected')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."data_set_queue_status_enum" AS ENUM('pending', 'completed', 'failed')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."micro_task_status_enum" AS ENUM('open', 'closed')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."notification_type_enum" AS ENUM('task-assign', 'task-invitation', 'task-rejected', 'task-approved')`,
    );

    // ─── auth & role tables ───────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "permissions" (
        "id"           uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "name"         character varying NOT NULL,
        "type"         character varying NOT NULL,
        "content"      character varying NOT NULL,
        "description"  character varying,
        "created_by"   character varying,
        "updated_by"   character varying,
        "created_date" TIMESTAMP         NOT NULL DEFAULT now(),
        "updated_date" TIMESTAMP         NOT NULL DEFAULT now(),
        CONSTRAINT "PK_permissions" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "role" (
        "id"           uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "name"         character varying NOT NULL,
        "description"  character varying,
        "created_by"   character varying,
        "updated_by"   character varying,
        "created_date" TIMESTAMP         NOT NULL DEFAULT now(),
        "updated_date" TIMESTAMP         NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_role_name" UNIQUE ("name"),
        CONSTRAINT "PK_role" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "role_permission" (
        "role_id"       uuid NOT NULL,
        "permission_id" uuid NOT NULL,
        CONSTRAINT "PK_role_permission" PRIMARY KEY ("role_id", "permission_id")
      )
    `);

    // ─── task_distribution schema tables ─────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "task_distribution"."user_score" (
        "id"      SERIAL        NOT NULL,
        "user_id" character varying NOT NULL,
        "score"   float         NOT NULL DEFAULT 0,
        CONSTRAINT "PK_task_distribution_user_score" PRIMARY KEY ("id")
      )
    `);

    // ─── users ────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id"               uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "first_name"       character varying,
        "middle_name"      character varying,
        "last_name"        character varying,
        "email"            character varying,
        "phone_number"     character varying,
        "national_id"      character varying,
        "password"         character varying NOT NULL,
        "profile_picture"  character varying,
        "birth_date"       TIMESTAMP,
        "gender"           "public"."users_gender_enum",
        "is_active"        boolean           NOT NULL DEFAULT true,
        "created_by"       character varying,
        "updated_by"       character varying,
        "created_date"     TIMESTAMP         NOT NULL DEFAULT now(),
        "updated_date"     TIMESTAMP         NOT NULL DEFAULT now(),
        "language_id"      uuid,
        "dialect_id"       uuid,
        "role_id"          uuid              NOT NULL,
        "woreda"           character varying,
        "city"             character varying,
        "zone_id"          uuid,
        "region_id"        uuid,
        "score_id"         integer,
        "sectors"          text[],
        CONSTRAINT "UQ_users_email"       UNIQUE ("email"),
        CONSTRAINT "UQ_users_phone"       UNIQUE ("phone_number"),
        CONSTRAINT "UQ_users_national_id" UNIQUE ("national_id"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);

    // ─── user_verification_codes ──────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "user_verification_codes" (
        "id"              uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "username"        character varying NOT NULL,
        "code"            character varying NOT NULL,
        "expiration_date" TIMESTAMP         NOT NULL,
        "status"          "public"."user_verification_codes_status_enum" NOT NULL DEFAULT 'pending',
        "created_date"    TIMESTAMP         NOT NULL DEFAULT now(),
        "updated_date"    TIMESTAMP         NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_verification_codes" PRIMARY KEY ("id")
      )
    `);

    // ─── user_log ─────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "user_log" (
        "id"                uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "user_ip"           character varying,
        "action_type"       character varying,
        "action_end_point"  character varying,
        "created_by"        character varying,
        "created_date"      TIMESTAMP         NOT NULL DEFAULT now(),
        "updated_date"      TIMESTAMP         NOT NULL DEFAULT now(),
        "user_id"           uuid              NOT NULL,
        CONSTRAINT "PK_user_log" PRIMARY KEY ("id")
      )
    `);

    // ─── user_device_token ────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "user_device_token" (
        "id"           uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "user_id"      uuid              NOT NULL,
        "device_token" character varying NOT NULL,
        "device_type"  character varying NOT NULL,
        "is_active"    boolean           NOT NULL DEFAULT true,
        "last_used_at" TIMESTAMP         DEFAULT now(),
        "created_date" TIMESTAMP         NOT NULL DEFAULT now(),
        "updated_date" TIMESTAMP         NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_device_token" PRIMARY KEY ("id")
      )
    `);

    // ─── wallet ───────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "wallet" (
        "id"           uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "balance"      numeric(10,4)     NOT NULL DEFAULT 0,
        "created_by"   character varying,
        "updated_by"   character varying,
        "created_date" TIMESTAMP         NOT NULL DEFAULT now(),
        "updated_date" TIMESTAMP         NOT NULL DEFAULT now(),
        "user_id"      uuid              NOT NULL,
        CONSTRAINT "UQ_wallet_user_id" UNIQUE ("user_id"),
        CONSTRAINT "PK_wallet" PRIMARY KEY ("id")
      )
    `);

    // ─── transaction ──────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "transaction" (
        "id"           uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "amount"       numeric(10,2)     NOT NULL,
        "type"         "public"."transaction_type_enum"   NOT NULL,
        "metadata"     jsonb,
        "status"       "public"."transaction_status_enum" NOT NULL,
        "user_id"      uuid              NOT NULL,
        "created_date" TIMESTAMP         NOT NULL DEFAULT now(),
        "updated_date" TIMESTAMP         NOT NULL DEFAULT now(),
        CONSTRAINT "PK_transaction" PRIMARY KEY ("id")
      )
    `);

    // ─── score_value ──────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "score_value" (
        "id"            uuid    NOT NULL DEFAULT uuid_generate_v4(),
        "value_in_birr" integer NOT NULL,
        "created_by"    character varying,
        "updated_by"    character varying,
        "created_date"  TIMESTAMP NOT NULL DEFAULT now(),
        "updated_date"  TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_score_value" PRIMARY KEY ("id")
      )
    `);

    // ─── project ──────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "project" (
        "id"               uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "name"             character varying NOT NULL,
        "description"      character varying,
        "cover_image_url"  character varying,
        "manager_id"       uuid,
        "start_date"       TIMESTAMP,
        "end_date"         TIMESTAMP,
        "status"           "public"."project_status_enum" NOT NULL DEFAULT 'Active',
        "is_archived"      boolean           NOT NULL DEFAULT false,
        "updated_by"       character varying,
        "tags"             text[],
        "created_date"     TIMESTAMP         NOT NULL DEFAULT now(),
        "updated_date"     TIMESTAMP         NOT NULL DEFAULT now(),
        "created_by"       character varying,
        CONSTRAINT "UQ_project_name" UNIQUE ("name"),
        CONSTRAINT "PK_project" PRIMARY KEY ("id")
      )
    `);

    // ─── task_type ────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "task_type" (
        "id"           uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "task_type"    "public"."task_type_task_type_enum" NOT NULL,
        "created_by"   character varying,
        "updated_by"   character varying,
        "created_date" TIMESTAMP         NOT NULL DEFAULT now(),
        "updated_date" TIMESTAMP         NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_task_type_task_type" UNIQUE ("task_type"),
        CONSTRAINT "PK_task_type" PRIMARY KEY ("id")
      )
    `);

    // ─── task ─────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "task" (
        "id"                                uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "name"                              character varying NOT NULL,
        "description"                       text,
        "is_public"                         boolean           NOT NULL DEFAULT true,
        "require_contributor_test"          boolean           NOT NULL DEFAULT false,
        "is_closed"                         boolean           NOT NULL DEFAULT false,
        "is_archived"                       boolean           NOT NULL DEFAULT false,
        "distribution_started"              boolean           NOT NULL DEFAULT false,
        "contributor_completion_time_limit" integer,
        "reviewer_completion_time_limit"    integer,
        "max_expected_no_of_contributors"   integer,
        "created_by"                        character varying,
        "updated_by"                        character varying,
        "created_date"                      TIMESTAMP         NOT NULL DEFAULT now(),
        "updated_date"                      TIMESTAMP         NOT NULL DEFAULT now(),
        "project_id"                        uuid              NOT NULL,
        "task_type_id"                      uuid              NOT NULL,
        "language_id"                       uuid              NOT NULL,
        CONSTRAINT "PK_task" PRIMARY KEY ("id")
      )
    `);

    // ─── task_requirement ─────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "task_requirement" (
        "id"                              uuid    NOT NULL DEFAULT uuid_generate_v4(),
        "task_id"                         uuid    NOT NULL,
        "max_contributor_per_micro_task"  integer,
        "max_contributor_per_facilitator" integer,
        "max_dataset_per_reviewer"        integer DEFAULT 10,
        "max_micro_task_per_contributor"  integer,
        "minimum_seconds"                 integer,
        "maximum_seconds"                 integer,
        "minimum_characters_length"       integer,
        "maximum_characters_length"       integer,
        "batch"                           integer,
        "appriximate_time_per_batch"      integer,
        "max_retry_per_task"              integer,
        "is_dialect_specific"             boolean NOT NULL DEFAULT false,
        "dialects"                        jsonb,
        "is_age_specific"                 boolean NOT NULL DEFAULT false,
        "age"                             jsonb,
        "is_sector_specific"              boolean NOT NULL DEFAULT false,
        "sectors"                         text[],
        "is_gender_specific"              boolean NOT NULL DEFAULT false,
        "gender"                          jsonb,
        "is_location_specific"            boolean NOT NULL DEFAULT false,
        "locations"                       jsonb,
        "created_date"                    TIMESTAMP NOT NULL DEFAULT now(),
        "updated_date"                    TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_task_requirement_task_id" UNIQUE ("task_id"),
        CONSTRAINT "PK_task_requirement" PRIMARY KEY ("id")
      )
    `);

    // ─── task_payment ─────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "task_payment" (
        "id"                               uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "task_id"                          uuid              NOT NULL,
        "contributor_credit_per_microtask" integer           NOT NULL,
        "reviewer_credit_per_microtask"    integer           NOT NULL,
        "status"                           character varying,
        "created_by"                       character varying,
        "updated_by"                       character varying,
        "created_date"                     TIMESTAMP         NOT NULL DEFAULT now(),
        "updated_date"                     TIMESTAMP         NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_task_payment_task_id" UNIQUE ("task_id"),
        CONSTRAINT "PK_task_payment" PRIMARY KEY ("id")
      )
    `);

    // ─── task_instruction ─────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "task_instruction" (
        "id"                    uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "task_id"               uuid              NOT NULL,
        "title"                 character varying NOT NULL,
        "content"               text              NOT NULL,
        "image_instruction_url" character varying,
        "video_instruction_url" character varying,
        "audio_instruction_url" character varying,
        "created_by"            character varying,
        "updated_by"            character varying,
        "created_date"          TIMESTAMP         NOT NULL DEFAULT now(),
        "updated_date"          TIMESTAMP         NOT NULL DEFAULT now(),
        CONSTRAINT "PK_task_instruction" PRIMARY KEY ("id")
      )
    `);

    // ─── user_task ────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "user_task" (
        "id"           uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "user_id"      uuid              NOT NULL,
        "has_done_task" boolean          NOT NULL DEFAULT false,
        "task_id"      uuid              NOT NULL,
        "role"         "public"."user_task_role_enum"   NOT NULL,
        "status"       "public"."user_task_status_enum" NOT NULL DEFAULT 'Active',
        "is_flagged"   boolean           NOT NULL DEFAULT false,
        "created_date" TIMESTAMP         NOT NULL DEFAULT now(),
        "updated_date" TIMESTAMP         NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_task" PRIMARY KEY ("id")
      )
    `);

    // ─── facilitator_contributor ──────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "facilitator_contributor" (
        "id"               uuid  NOT NULL DEFAULT uuid_generate_v4(),
        "facilitator_id"   uuid  NOT NULL,
        "contributor_ids"  text[],
        "task_id"          uuid  NOT NULL,
        "created_date"     TIMESTAMP NOT NULL DEFAULT now(),
        "updated_date"     TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_facilitator_contributor" UNIQUE ("facilitator_id", "task_id"),
        CONSTRAINT "PK_facilitator_contributor" PRIMARY KEY ("id")
      )
    `);

    // ─── invitation_link ──────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "invitation_link" (
        "id"                  uuid    NOT NULL DEFAULT uuid_generate_v4(),
        "project_id"          uuid,
        "task_id"             uuid,
        "expiry_date"         TIMESTAMP NOT NULL,
        "max_invitations"     integer,
        "current_invitations" integer   NOT NULL DEFAULT 0,
        "role"                "public"."invitation_link_role_enum",
        "organization_id"     uuid,
        "created_by"          character varying,
        "created_date"        TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_invitation_link" PRIMARY KEY ("id")
      )
    `);

    // ─── micro_task ───────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "micro_task" (
        "id"                      uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "code"                    character varying NOT NULL,
        "is_test"                 boolean           NOT NULL DEFAULT false,
        "instruction"             text,
        "file_path"               character varying,
        "text"                    text,
        "type"                    character varying,
        "has_meet_target_dataset" integer,
        "created_by"              character varying,
        "updated_by"              character varying,
        "created_date"            TIMESTAMP         NOT NULL DEFAULT now(),
        "updated_date"            TIMESTAMP         NOT NULL DEFAULT now(),
        "deletedAt"               TIMESTAMP,
        "task_id"                 uuid              NOT NULL,
        "status"                  "public"."micro_task_status_enum" NOT NULL DEFAULT 'open',
        CONSTRAINT "PK_micro_task" PRIMARY KEY ("id")
      )
    `);

    // ─── data_set ─────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "data_set" (
        "id"                      uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "code"                    character varying,
        "text_data_set"           text,
        "status"                  "public"."data_set_status_enum"       NOT NULL DEFAULT 'Pending',
        "is_draft"                boolean           NOT NULL DEFAULT false,
        "is_flagged"              boolean           NOT NULL DEFAULT false,
        "queue_status"            "public"."data_set_queue_status_enum" NOT NULL DEFAULT 'completed',
        "is_paid_for_contributor" boolean           NOT NULL DEFAULT false,
        "rejection_reason_id"     character varying,
        "is_paid_for_reviewer"    boolean           NOT NULL DEFAULT false,
        "is_test"                 boolean           NOT NULL DEFAULT false,
        "audio_duration"          integer,
        "created_by"              character varying,
        "updated_by"              character varying,
        "file_path"               character varying,
        "type"                    character varying,
        "created_date"            TIMESTAMP         NOT NULL DEFAULT now(),
        "updated_date"            TIMESTAMP         NOT NULL DEFAULT now(),
        "micro_task_id"           uuid,
        "contributor_id"          uuid              NOT NULL,
        "reviewer_id"             uuid,
        "dialect_id"              uuid,
        "annotation"              character varying,
        "language_id"             uuid,
        CONSTRAINT "PK_data_set" PRIMARY KEY ("id")
      )
    `);

    // ─── rejection_reason ─────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "rejection_reason" (
        "id"                  uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "reason"              character varying,
        "comment"             character varying,
        "rejection_type_id"   uuid              NOT NULL,
        "created_date"        TIMESTAMP         NOT NULL DEFAULT now(),
        "updated_date"        TIMESTAMP         NOT NULL DEFAULT now(),
        "data_set_id"         uuid              NOT NULL,
        CONSTRAINT "PK_rejection_reason" PRIMARY KEY ("id")
      )
    `);

    // ─── flag_reason ──────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "flag_reason" (
        "id"           uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "reason"       character varying,
        "comment"      character varying,
        "created_date" TIMESTAMP         NOT NULL DEFAULT now(),
        "updated_date" TIMESTAMP         NOT NULL DEFAULT now(),
        "data_set_id"  uuid              NOT NULL,
        "flag_type_id" uuid              NOT NULL,
        CONSTRAINT "PK_flag_reason" PRIMARY KEY ("id")
      )
    `);

    // ─── activity_logs ────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "activity_logs" (
        "id"           uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "user_id"      uuid              NOT NULL,
        "action"       character varying NOT NULL,
        "entity_type"  character varying,
        "entity_id"    character varying,
        "metadata"     character varying,
        "user_agent"   character varying,
        "ip"           character varying,
        "created_date" TIMESTAMP         NOT NULL DEFAULT now(),
        "updated_date" TIMESTAMP         NOT NULL DEFAULT now(),
        CONSTRAINT "PK_activity_logs" PRIMARY KEY ("id")
      )
    `);

    // ─── notification ─────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "notification" (
        "id"            uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "user_id"       uuid              NOT NULL,
        "role_id"       uuid,
        "title"         character varying NOT NULL,
        "message"       character varying NOT NULL,
        "type"          "public"."notification_type_enum" NOT NULL,
        "is_read"       boolean           NOT NULL DEFAULT false,
        "is_actionable" boolean           NOT NULL DEFAULT false,
        "action_url"    character varying,
        "created_by"    character varying,
        "updated_by"    character varying,
        "created_date"  TIMESTAMP         NOT NULL DEFAULT now(),
        "updated_date"  TIMESTAMP         NOT NULL DEFAULT now(),
        CONSTRAINT "PK_notification" PRIMARY KEY ("id")
      )
    `);

    // ─── blog ─────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "blog" (
        "id"             uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "title"          character varying NOT NULL,
        "author"         character varying,
        "full_content"   text,
        "image_url"      character varying,
        "overview"       text,
        "minutes_to_read" integer,
        "created_by"     character varying,
        "updated_by"     character varying,
        "created_date"   TIMESTAMP         NOT NULL DEFAULT now(),
        "updated_date"   TIMESTAMP         NOT NULL DEFAULT now(),
        CONSTRAINT "PK_blog" PRIMARY KEY ("id")
      )
    `);

    // ─── contact_us ───────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "contact_us" (
        "id"           uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "content"      character varying NOT NULL,
        "email"        character varying NOT NULL,
        "first_name"   character varying NOT NULL,
        "last_name"    character varying NOT NULL,
        "phone_number" character varying NOT NULL,
        "created_by"   character varying,
        "updated_by"   character varying,
        "created_date" TIMESTAMP         NOT NULL DEFAULT now(),
        "updated_date" TIMESTAMP         NOT NULL DEFAULT now(),
        CONSTRAINT "PK_contact_us" PRIMARY KEY ("id")
      )
    `);

    // ─── task_distribution schema tables ─────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "task_distribution"."contributor_micro_tasks" (
        "id"                                  uuid    NOT NULL DEFAULT uuid_generate_v4(),
        "contributor_id"                      uuid    NOT NULL,
        "gender"                              character varying,
        "task_id"                             uuid    NOT NULL,
        "micro_task_ids"                      text[],
        "status"                              "task_distribution"."contributor_micro_tasks_status_enum" NOT NULL DEFAULT 'New',
        "expected_micro_task_for_contributor" integer NOT NULL,
        "batch"                               integer,
        "current_batch"                       integer NOT NULL DEFAULT 0,
        "total_micro_tasks"                   integer NOT NULL,
        "dead_line"                           TIMESTAMP,
        "created_date"                        TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_contributor_micro_tasks" UNIQUE ("contributor_id", "task_id"),
        CONSTRAINT "PK_contributor_micro_tasks" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "task_distribution"."micro_task_statistics" (
        "id"                        uuid    NOT NULL DEFAULT uuid_generate_v4(),
        "micro_task_id"             character varying NOT NULL,
        "task_id"                   character varying NOT NULL,
        "no_of_contributors"        integer NOT NULL,
        "expected_no_of_contributors" integer NOT NULL,
        "total_male"                integer,
        "total_female"              integer,
        "created_date"              TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_micro_task_statistics" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "task_distribution"."reviewer_tasks" (
        "id"           uuid  NOT NULL DEFAULT uuid_generate_v4(),
        "task_id"      uuid  NOT NULL,
        "reviewer_id"  uuid  NOT NULL,
        "data_set_ids" text[],
        "expire_date"  TIMESTAMP NOT NULL,
        CONSTRAINT "PK_reviewer_tasks" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "task_distribution"."score_log" (
        "id"      SERIAL NOT NULL,
        "action"  "task_distribution"."score_log_action_enum" NOT NULL,
        "user_id" character varying NOT NULL,
        "point"   float NOT NULL DEFAULT 0,
        CONSTRAINT "PK_score_log" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "task_distribution"."score_log"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "task_distribution"."reviewer_tasks"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "task_distribution"."micro_task_statistics"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "task_distribution"."contributor_micro_tasks"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "task_distribution"."user_score"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "contact_us"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "blog"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "notification"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "activity_logs"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "flag_reason"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "rejection_reason"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "data_set"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "micro_task"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "invitation_link"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "facilitator_contributor"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_task"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "task_instruction"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "task_payment"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "task_requirement"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "task"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "task_type"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "project"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "score_value"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "transaction"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "wallet"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_device_token"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_log"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_verification_codes"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "role_permission"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "role"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "permissions"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "task_distribution"."score_log_action_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "task_distribution"."contributor_micro_tasks_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."notification_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."micro_task_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."data_set_queue_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."data_set_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."user_task_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."user_task_role_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."invitation_link_role_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."task_type_task_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."project_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."transaction_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."transaction_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."user_verification_codes_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."users_gender_enum"`);
  }
}
