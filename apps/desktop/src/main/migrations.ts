export interface Migration {
  readonly version: number
  readonly sql: string
}

/**
 * Append-only schema history. Never edit a migration that has shipped; add a
 * new numbered entry instead.
 */
export const migrations: readonly Migration[] = [
  {
    version: 1,
    sql: `
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value_json TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS attempts (
        id TEXT PRIMARY KEY,
        problem_id TEXT NOT NULL,
        language TEXT NOT NULL,
        mode TEXT NOT NULL,
        code TEXT NOT NULL,
        status TEXT NOT NULL,
        passed INTEGER NOT NULL,
        total INTEGER NOT NULL,
        result_json TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS attempts_problem_created
        ON attempts (problem_id, created_at);

      CREATE TABLE IF NOT EXISTS drafts (
        problem_id TEXT NOT NULL,
        language TEXT NOT NULL,
        code TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        PRIMARY KEY (problem_id, language)
      );

      CREATE TABLE IF NOT EXISTS design_scenes (
        id TEXT PRIMARY KEY,
        scene_json TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS ai_provider_configs (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        base_url TEXT NOT NULL,
        model TEXT NOT NULL,
        key_ref TEXT,
        enabled INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `,
  },
  {
    version: 2,
    sql: `
      CREATE VIRTUAL TABLE IF NOT EXISTS problem_search USING fts5(
        problem_id UNINDEXED,
        title,
        patterns,
        pack_name,
        body,
        tokenize = 'unicode61 remove_diacritics 2'
      );
    `,
  },
  {
    version: 3,
    sql: `
      CREATE TABLE IF NOT EXISTS attempt_events (
        id TEXT PRIMARY KEY,
        attempt_id TEXT NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
        kind TEXT NOT NULL,
        payload_json TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS attempt_events_attempt_created
        ON attempt_events (attempt_id, created_at);

      CREATE TABLE IF NOT EXISTS mistake_tags (
        id TEXT PRIMARY KEY,
        label TEXT NOT NULL UNIQUE,
        description TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS attempt_mistake_tags (
        attempt_id TEXT NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
        tag_id TEXT NOT NULL REFERENCES mistake_tags(id) ON DELETE CASCADE,
        created_at TEXT NOT NULL,
        PRIMARY KEY (attempt_id, tag_id)
      );
      CREATE INDEX IF NOT EXISTS attempt_mistake_tags_tag
        ON attempt_mistake_tags (tag_id);

      CREATE TABLE IF NOT EXISTS review_cards (
        id TEXT PRIMARY KEY,
        item_kind TEXT NOT NULL CHECK (item_kind IN ('problem', 'design')),
        item_id TEXT NOT NULL,
        due_at TEXT NOT NULL,
        stability REAL NOT NULL,
        difficulty REAL NOT NULL,
        elapsed_days REAL NOT NULL DEFAULT 0,
        scheduled_days REAL NOT NULL DEFAULT 0,
        reps INTEGER NOT NULL DEFAULT 0,
        lapses INTEGER NOT NULL DEFAULT 0,
        state TEXT NOT NULL,
        last_reviewed_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        UNIQUE (item_kind, item_id)
      );
      CREATE INDEX IF NOT EXISTS review_cards_due
        ON review_cards (due_at);

      CREATE TABLE IF NOT EXISTS design_attempts (
        id TEXT PRIMARY KEY,
        scenario_id TEXT NOT NULL,
        scene_json TEXT NOT NULL,
        notes_json TEXT NOT NULL DEFAULT '{}',
        rubric_json TEXT NOT NULL DEFAULT '{}',
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS design_attempts_scenario_updated
        ON design_attempts (scenario_id, updated_at);
    `,
  },
  {
    version: 4,
    sql: `
      CREATE TABLE IF NOT EXISTS problem_notes (
        problem_id TEXT PRIMARY KEY,
        notes_md TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `,
  },
  {
    version: 5,
    sql: `
      -- ts-fsrs tracks short-term learning steps, which the Phase 2 table
      -- did not anticipate.
      ALTER TABLE review_cards ADD COLUMN learning_steps INTEGER NOT NULL DEFAULT 0;

      -- Snapshot the plan, hint usage, and solution view with every attempt so
      -- the review rating can be derived from what actually happened.
      ALTER TABLE attempts ADD COLUMN plan TEXT NOT NULL DEFAULT '';
      ALTER TABLE attempts ADD COLUMN hints_used INTEGER NOT NULL DEFAULT 0;
      ALTER TABLE attempts ADD COLUMN solution_viewed INTEGER NOT NULL DEFAULT 0;

      ALTER TABLE drafts ADD COLUMN plan TEXT NOT NULL DEFAULT '';

      CREATE TABLE IF NOT EXISTS review_logs (
        id TEXT PRIMARY KEY,
        card_id TEXT NOT NULL REFERENCES review_cards(id) ON DELETE CASCADE,
        rating TEXT NOT NULL,
        state_before TEXT NOT NULL,
        state_after TEXT NOT NULL,
        due_at TEXT NOT NULL,
        reviewed_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS review_logs_card_reviewed
        ON review_logs (card_id, reviewed_at);
      CREATE INDEX IF NOT EXISTS review_logs_reviewed
        ON review_logs (reviewed_at);
    `,
  },
  {
    version: 6,
    sql: `
      -- Local-only feedback on AI responses. Never leaves the machine.
      CREATE TABLE IF NOT EXISTS ai_feedback (
        id TEXT PRIMARY KEY,
        feature TEXT NOT NULL,
        provider_type TEXT NOT NULL,
        model TEXT NOT NULL,
        reason TEXT NOT NULL,
        comment TEXT,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS ai_feedback_created
        ON ai_feedback (created_at);
    `,
  },
  {
    version: 7,
    sql: `
      -- Custom request headers for OpenAI-compatible endpoints. Stored locally
      -- and excluded from user-data exports because values may be sensitive.
      ALTER TABLE ai_provider_configs
        ADD COLUMN headers_json TEXT NOT NULL DEFAULT '{}';
    `,
  },
]
