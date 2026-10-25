export type Language = 'python' | 'typescript'

export type ThemePreference = 'system' | 'light' | 'dark'

export interface EditorSettings {
  readonly fontSize: number
  readonly tabSize: number
  readonly wordWrap: boolean
}

export interface AppSettings {
  readonly theme: ThemePreference
  readonly language: Language
  readonly editor: EditorSettings
  readonly dailyGoalMinutes: number
  readonly reviewDailyLimit: number
  readonly newCardsPerDay: number
  readonly reviewReminders: boolean
  readonly onboardingCompleted: boolean
}

export interface SettingsPatch {
  readonly theme?: ThemePreference
  readonly language?: Language
  readonly editor?: Partial<EditorSettings>
  readonly dailyGoalMinutes?: number
  readonly reviewDailyLimit?: number
  readonly newCardsPerDay?: number
  readonly reviewReminders?: boolean
  readonly onboardingCompleted?: boolean
}

export const defaultAppSettings: AppSettings = {
  theme: 'system',
  language: 'python',
  editor: {
    fontSize: 13,
    tabSize: 2,
    wordWrap: false,
  },
  dailyGoalMinutes: 30,
  reviewDailyLimit: 20,
  newCardsPerDay: 10,
  reviewReminders: true,
  onboardingCompleted: false,
}

export type SectionId = 'today' | 'coding' | 'design' | 'review' | 'progress' | 'settings'

export interface ProblemSummary {
  readonly id: string
  readonly slug: string
  readonly title: string
  readonly difficulty: 'easy' | 'medium' | 'hard'
  readonly patterns: readonly string[]
  readonly packId: string
  readonly packName: string
  readonly source: 'bundled' | 'user'
}

export interface ContentPackSummary {
  readonly id: string
  readonly name: string
  readonly version: string
  readonly license: string
  readonly attribution: string
  readonly source: 'bundled' | 'user'
  readonly problemCount: number
  readonly designCount: number
  readonly path: string
}

export type PackImportKind = 'archive' | 'folder'

export interface PackIssue {
  readonly path: string
  readonly message: string
}

export interface PackPreviewResult {
  readonly ok: boolean
  readonly preview?: ContentPackSummary & {
    readonly token: string
    readonly warnings: readonly string[]
  }
  readonly issues?: readonly PackIssue[]
  readonly warnings?: readonly string[]
}

export interface Hint {
  readonly level: number
  readonly title: string
  readonly body: string
}

export interface ProblemDetail extends ProblemSummary {
  readonly statement: string
  readonly languageTemplates: Record<Language, string>
  readonly hints: readonly Hint[]
  readonly testCounts: {
    readonly sample: number
    readonly hidden: number
  }
  readonly commonMistakes: readonly string[]
  readonly followUps: readonly string[]
}

export interface CompileResult {
  readonly ok: boolean
  readonly stdout: string
  readonly stderr: string
  readonly durationMs: number
}

export interface RuntimeSummary {
  readonly totalMs: number
  readonly maxMs: number
  readonly peakMemoryBytes: number
}

export interface HarnessError {
  readonly type: string
  readonly message: string
  readonly stack: string
  readonly userLine: number
}

export interface Failure {
  readonly index: number
  readonly isSample: boolean
  readonly status: string
  readonly input?: unknown
  readonly expected?: unknown
  readonly actual?: unknown
  readonly userStdout: string
  readonly userStderr: string
  readonly runtimeMs: number
  readonly memoryBytes: number
  readonly error?: HarnessError
  readonly message?: string
}

export interface TestResult {
  readonly index: number
  readonly isSample: boolean
  readonly status: string
  readonly runtimeMs: number
  readonly memoryBytes: number
}

export interface RunResult {
  readonly status: string
  readonly passed: number
  readonly total: number
  readonly compile: CompileResult
  readonly runtime: RuntimeSummary
  readonly firstFailure?: Failure
  readonly tests: readonly TestResult[]
  readonly message?: string
}

export interface RunInput {
  readonly problemId: string
  readonly language: Language
  readonly code: string
  readonly mode: 'sample' | 'submit' | 'review'
  readonly plan?: string
  readonly hintsUsed?: number
  readonly solutionViewed?: boolean
}

export interface RuntimeInfo {
  readonly name: string
  readonly path: string
  readonly source?: 'env' | 'bundled' | 'system'
  readonly version: string
  readonly available: boolean
  readonly error?: string
}

export interface JudgeStatus {
  readonly ok: boolean
  readonly name?: string
  readonly version?: string
  readonly os?: string
  readonly arch?: string
  readonly runtimes?: Record<string, RuntimeInfo>
  readonly error?: string
}

export interface DraftInput {
  readonly problemId: string
  readonly language: Language
}

export interface DraftRecord {
  readonly code: string
  readonly plan: string
}

export interface SaveDraftInput extends DraftInput {
  readonly code: string
  readonly plan?: string
}

export interface Stats {
  readonly attempts: number
  readonly accepted: number
  readonly lastAttemptAt: string | null
}

export type AttemptMode = 'sample' | 'submit' | 'review'

export interface AttemptSummary {
  readonly id: string
  readonly problemId: string
  readonly language: Language
  readonly mode: AttemptMode
  readonly status: string
  readonly passed: number
  readonly total: number
  readonly hintsUsed: number
  readonly solutionViewed: boolean
  readonly plan: string
  readonly createdAt: string
}

export interface AttemptDetail extends AttemptSummary {
  readonly code: string
  readonly result: RunResult
  readonly mistakeTagIds: readonly string[]
}

export interface TagAttemptInput {
  readonly attemptId: string
  readonly tagIds: readonly string[]
}

export interface MistakeTag {
  readonly id: string
  readonly label: string
  readonly description: string | null
}

export interface MistakeTagCount {
  readonly tagId: string
  readonly label: string
  readonly count: number
}

export type ReviewItemKind = 'problem' | 'design'

export type ReviewState = 'new' | 'learning' | 'review' | 'relearning'

export type ReviewGrade = 'again' | 'hard' | 'good' | 'easy'

export interface ReviewCard {
  readonly id: string
  readonly itemKind: ReviewItemKind
  readonly itemId: string
  readonly dueAt: string
  readonly stability: number
  readonly difficulty: number
  readonly elapsedDays: number
  readonly scheduledDays: number
  readonly learningSteps: number
  readonly reps: number
  readonly lapses: number
  readonly state: ReviewState
  readonly lastReviewedAt: string | null
  readonly createdAt: string
  readonly updatedAt: string
}

export interface ReviewPreview {
  readonly grade: ReviewGrade
  readonly dueAt: string
  readonly intervalDays: number
}

export interface ReviewQueueItem extends ReviewCard {
  readonly title: string
  readonly subtitle: string
  readonly previews: readonly ReviewPreview[]
}

export interface ReviewQueue {
  readonly due: readonly ReviewQueueItem[]
  readonly newCards: readonly ReviewQueueItem[]
  readonly totalDue: number
  readonly totalNew: number
  readonly dueLimit: number
  readonly newLimit: number
  readonly reviewedToday: number
  readonly nextDueAt: string | null
}

export interface GradeReviewInput {
  readonly cardId: string
  readonly grade: ReviewGrade
}

export interface GradeReviewResult {
  readonly card: ReviewCard
  readonly previews: readonly ReviewPreview[]
}

export interface TodaySummary {
  readonly dueCount: number
  readonly newCount: number
  readonly reviewedToday: number
  readonly attemptsToday: number
  readonly acceptedToday: number
  readonly streakDays: number
  readonly lastAttemptAt: string | null
  readonly continueProblemId: string | null
  readonly dailyGoalMinutes: number
}

export interface PatternProgress {
  readonly pattern: string
  readonly problems: number
  readonly attempted: number
  readonly accepted: number
}

export interface ProgressSummary {
  readonly attempts: number
  readonly accepted: number
  readonly lastAttemptAt: string | null
  readonly streakDays: number
  readonly reviewsDue: number
  readonly reviewsCompleted: number
  readonly reviewsCompletedToday: number
  readonly patterns: readonly PatternProgress[]
  readonly mistakes: readonly MistakeTagCount[]
  readonly recentAttempts: readonly AttemptSummary[]
}

export interface ProblemNote {
  readonly notes: string
  readonly updatedAt: string | null
}

export interface SaveProblemNoteInput {
  readonly problemId: string
  readonly notes: string
}

export interface DesignScenePayload {
  readonly sceneJson: string | null
  readonly updatedAt: string | null
}

export interface AppInfo {
  readonly appVersion: string
  readonly platform: string
  readonly versions: {
    readonly electron: string
    readonly chrome: string
    readonly node: string
  }
  readonly userDataPath: string
  readonly databasePath: string
  readonly logsPath: string
}

export type AiProviderType = 'none' | 'mock' | 'openai-compatible'

export interface AiProviderStatus {
  readonly type: AiProviderType
  readonly baseUrl: string
  readonly model: string
  readonly enabled: boolean
  readonly hasKey: boolean
}

export interface SaveAiConfigInput {
  readonly type: AiProviderType
  readonly baseUrl: string
  readonly model: string
  readonly apiKey?: string
  readonly clearKey?: boolean
}

export interface AiContext {
  readonly problemId: string
  readonly language: Language
  readonly code: string
  readonly failure?: Failure
}

export interface AiPreview {
  readonly text: string
  readonly messages: readonly {
    readonly role: 'system' | 'user'
    readonly content: string
  }[]
}

export type AiEvent =
  | { readonly requestId: string; readonly type: 'chunk'; readonly text: string }
  | { readonly requestId: string; readonly type: 'done' }
  | { readonly requestId: string; readonly type: 'error'; readonly message: string }

export interface BaseCaseApi {
  readonly platform: string
  readonly versions: {
    readonly electron: string
    readonly chrome: string
    readonly node: string
  }
  readonly app: {
    getInfo(): Promise<AppInfo>
  }
  readonly content: {
    list(): Promise<ProblemSummary[]>
    get(problemId: string): Promise<ProblemDetail>
    search(query: string): Promise<ProblemSummary[]>
  }
  readonly judge: {
    run(input: RunInput): Promise<RunResult>
    status(): Promise<JudgeStatus>
  }
  readonly drafts: {
    get(input: DraftInput): Promise<DraftRecord | null>
    save(input: SaveDraftInput): Promise<void>
  }
  readonly attempts: {
    stats(): Promise<Stats>
    list(problemId: string): Promise<AttemptSummary[]>
    recent(limit?: number): Promise<AttemptSummary[]>
    get(attemptId: string): Promise<AttemptDetail>
    tag(input: TagAttemptInput): Promise<AttemptDetail>
  }
  readonly mistakes: {
    list(): Promise<MistakeTag[]>
  }
  readonly review: {
    queue(): Promise<ReviewQueue>
    preview(cardId: string): Promise<ReviewPreview[]>
    grade(input: GradeReviewInput): Promise<GradeReviewResult>
  }
  readonly progress: {
    summary(): Promise<ProgressSummary>
    today(): Promise<TodaySummary>
  }
  readonly notes: {
    get(problemId: string): Promise<ProblemNote>
    save(input: SaveProblemNoteInput): Promise<ProblemNote>
  }
  readonly settings: {
    get(): Promise<AppSettings>
    update(patch: SettingsPatch): Promise<AppSettings>
  }
  readonly packs: {
    list(): Promise<ContentPackSummary[]>
    preview(kind: PackImportKind): Promise<PackPreviewResult | null>
    install(token: string): Promise<ContentPackSummary>
    uninstall(packId: string): Promise<void>
  }
  readonly design: {
    getScene(): Promise<DesignScenePayload>
    saveScene(sceneJson: string): Promise<void>
    exportPng(dataUrl: string): Promise<{ saved: boolean; path?: string }>
  }
  readonly ai: {
    getStatus(): Promise<AiProviderStatus>
    saveConfig(input: SaveAiConfigInput): Promise<AiProviderStatus>
    preview(context: AiContext): Promise<AiPreview>
    explain(context: AiContext): Promise<{ requestId: string }>
    onEvent(listener: (event: AiEvent) => void): () => void
  }
}
