export type Language = 'python' | 'typescript'

export type ThemePreference = 'system' | 'light' | 'dark'

export interface EditorSettings {
  readonly fontSize: number
  readonly tabSize: number
  readonly wordWrap: boolean
}

export interface AiFeatureSettings {
  readonly explain: boolean
  readonly hint: boolean
  readonly approach: boolean
  readonly complexity: boolean
  readonly designNotes: boolean
  readonly followUp: boolean
}

export const defaultAiFeatureSettings: AiFeatureSettings = {
  explain: true,
  hint: true,
  approach: true,
  complexity: true,
  designNotes: true,
  followUp: true,
}

export interface AppSettings {
  readonly theme: ThemePreference
  readonly language: Language
  readonly editor: EditorSettings
  readonly aiEnabled: boolean
  readonly aiFeatures: AiFeatureSettings
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
  readonly aiEnabled?: boolean
  readonly aiFeatures?: Partial<AiFeatureSettings>
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
  aiEnabled: false,
  aiFeatures: defaultAiFeatureSettings,
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
  readonly requestId?: string
}

export type JudgeRunEvent =
  | {
      readonly requestId: string
      readonly type: 'test'
      readonly index: number
      readonly isSample: boolean
      readonly status: string
      readonly runtimeMs: number
      readonly memoryBytes: number
    }
  | { readonly requestId: string; readonly type: 'done' }
  | { readonly requestId: string; readonly type: 'error'; readonly message: string }

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

export interface ProblemProgressEntry {
  readonly problemId: string
  readonly attempts: number
  readonly accepted: number
  readonly reviewDueAt: string | null
  readonly reviewState: ReviewState | null
}

export type DataTransferCounts = Record<string, number>

export interface DataTransferResult {
  readonly saved: boolean
  readonly path?: string
  readonly counts?: DataTransferCounts
}

export interface ProblemNote {
  readonly notes: string
  readonly updatedAt: string | null
}

export interface SaveProblemNoteInput {
  readonly problemId: string
  readonly notes: string
}

export interface DesignScenarioSummary {
  readonly id: string
  readonly slug: string
  readonly title: string
  readonly difficulty: 'easy' | 'medium' | 'hard'
  readonly tags: readonly string[]
  readonly packId: string
  readonly packName: string
  readonly source: 'bundled' | 'user'
}

export interface DesignRubricLevels {
  readonly '1': string
  readonly '2': string
  readonly '3': string
  readonly '4': string
}

export interface DesignRubricDimension {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly levels: DesignRubricLevels
}

export interface DesignReference {
  readonly markdown: string
  readonly sceneJson: string | null
}

export interface DesignScenarioDetail extends DesignScenarioSummary {
  readonly prompt: string
  readonly requirements: {
    readonly functional: readonly string[]
    readonly nonFunctional: readonly string[]
  }
  readonly scale: {
    readonly writesPerDay: number
    readonly readsPerDay: number
    readonly retentionYears: number
  }
  readonly rubric: readonly DesignRubricDimension[]
  readonly checklist: readonly string[]
  readonly reference: DesignReference
  readonly followUps: readonly string[]
  readonly commonMistakes: readonly string[]
}

export const designNoteSections = [
  {
    id: 'requirements',
    label: 'Requirements',
    placeholder: 'Functional and non-functional requirements, assumptions, out of scope.',
  },
  {
    id: 'api',
    label: 'API',
    placeholder: 'Endpoints, request and response shapes, auth, pagination.',
  },
  {
    id: 'dataModel',
    label: 'Data model',
    placeholder: 'Entities, keys, indexes, and storage choices.',
  },
  {
    id: 'architecture',
    label: 'High-level architecture',
    placeholder: 'Clients, services, queues, caches, and datastores.',
  },
  {
    id: 'deepDives',
    label: 'Deep dives',
    placeholder: 'Two or three components you would go deep on.',
  },
  {
    id: 'tradeoffs',
    label: 'Trade-offs',
    placeholder: 'Consistency vs availability, SQL vs NoSQL, cost, complexity.',
  },
  {
    id: 'failureModes',
    label: 'Failure modes and monitoring',
    placeholder: 'What breaks, how you detect it, and how you recover.',
  },
] as const

export type DesignNoteSectionId = (typeof designNoteSections)[number]['id']

export type DesignNotes = Record<DesignNoteSectionId, string>

export const emptyDesignNotes: DesignNotes = {
  requirements: '',
  api: '',
  dataModel: '',
  architecture: '',
  deepDives: '',
  tradeoffs: '',
  failureModes: '',
}

export interface DesignRubricAnswer {
  readonly score: number
  readonly evidence: string
}

export type DesignRubricAnswers = Record<string, DesignRubricAnswer>

export interface DesignDraft {
  readonly scenarioId: string
  readonly sceneJson: string
  readonly notes: DesignNotes
  readonly rubric: DesignRubricAnswers
  readonly updatedAt: string | null
}

export interface SaveDesignDraftInput {
  readonly scenarioId: string
  readonly sceneJson?: string
  readonly notes?: DesignNotes
  readonly rubric?: DesignRubricAnswers
}

export interface SubmitDesignInput {
  readonly scenarioId: string
  readonly sceneJson: string
  readonly notes: DesignNotes
  readonly rubric: DesignRubricAnswers
}

export interface DesignAttemptSummary {
  readonly id: string
  readonly scenarioId: string
  readonly status: string
  readonly averageScore: number | null
  readonly createdAt: string
  readonly updatedAt: string
}

export interface DesignAttemptDetail extends DesignAttemptSummary {
  readonly sceneJson: string
  readonly notes: DesignNotes
  readonly rubric: DesignRubricAnswers
}

export interface ExportDesignAttemptInput {
  readonly attemptId: string
  readonly pngDataUrl?: string
}

export interface ExportDesignAttemptResult {
  readonly saved: boolean
  readonly path?: string
  readonly pngPath?: string
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

export type DiagnosticStatus = 'pass' | 'warn' | 'fail'

export interface DiagnosticCheck {
  readonly id: string
  readonly label: string
  readonly status: DiagnosticStatus
  readonly detail: string
  /** A short, actionable next step shown when the check is not passing. */
  readonly hint?: string
}

export interface DiagnosticsReport {
  readonly generatedAt: string
  readonly appVersion: string
  readonly platform: string
  readonly arch: string
  readonly ok: boolean
  readonly checks: readonly DiagnosticCheck[]
}

export type AiProviderType = 'none' | 'mock' | 'openai-compatible'

export type AiFeature = keyof AiFeatureSettings

export type AiConfidence = 'low' | 'medium' | 'high'

export type AiErrorCode =
  | 'cancelled'
  | 'timeout'
  | 'disabled'
  | 'rate_limited'
  | 'provider'
  | 'invalid_request'
  | 'internal_error'

export interface AiChatMessage {
  readonly role: 'system' | 'user' | 'assistant'
  readonly content: string
}

export interface AiProviderStatus {
  readonly type: AiProviderType
  readonly baseUrl: string
  readonly model: string
  readonly contextWindow: number
  readonly enabled: boolean
  readonly hasKey: boolean
}

export interface SaveAiConfigInput {
  readonly type: AiProviderType
  readonly baseUrl: string
  readonly model: string
  readonly contextWindow?: number
  readonly apiKey?: string
  readonly clearKey?: boolean
}

export interface AiTestConnectionResult {
  readonly ok: boolean
  readonly message: string
  readonly latencyMs: number
  readonly model: string
}

/** Coding context. Optional fields are used by the hint and approach features. */
export interface AiContext {
  readonly problemId: string
  readonly language: Language
  readonly code: string
  readonly failure?: Failure
  readonly plan?: string
  readonly question?: string
  readonly priorHints?: readonly string[]
  readonly hintLevel?: number
}

export interface AiConversationTurn {
  readonly role: 'user' | 'assistant'
  readonly content: string
}

/** Design context. The reference design and checklist are never included. */
export interface AiDesignContext {
  readonly scenarioId: string
  readonly notes: DesignNotes
  readonly rubric?: DesignRubricAnswers
  readonly question?: string
  readonly history?: readonly AiConversationTurn[]
}

export type AiRequest =
  | {
      readonly feature: Exclude<AiFeature, 'designNotes' | 'followUp'>
      readonly context: AiContext
    }
  | {
      readonly feature: 'designNotes' | 'followUp'
      readonly design: AiDesignContext
    }

export interface AiContextSection {
  readonly id: string
  readonly label: string
  readonly tokens: number
  readonly truncated: boolean
}

export interface AiPreview {
  readonly feature: AiFeature
  readonly text: string
  readonly messages: readonly AiChatMessage[]
  readonly estimatedTokens: number
  readonly budgetTokens: number
  readonly maxOutputTokens: number
  readonly sections: readonly AiContextSection[]
  readonly droppedSections: readonly string[]
  readonly redactions: number
}

export interface AiExplainResult {
  readonly summary: string
  readonly bugType: string
  readonly evidence: string
  readonly line: number | null
  readonly nextQuestion: string
  readonly confidence: AiConfidence
}

export interface AiHintResult {
  readonly observation: string
  readonly insight: string
  readonly nextStep: string
  readonly concept: string
  readonly revealLevel: number
}

export interface AiApproachResult {
  readonly matchesIntendedPattern: boolean
  readonly strengths: readonly string[]
  readonly risks: readonly string[]
  readonly suggestedQuestion: string
}

export interface AiComplexityResult {
  readonly time: string
  readonly space: string
  readonly reasoning: string
  readonly confidence: AiConfidence
}

export interface AiDesignDimensionReview {
  readonly name: string
  readonly score: number
  readonly evidence: string
  readonly nextStep: string
}

export interface AiDesignNotesResult {
  readonly dimensions: readonly AiDesignDimensionReview[]
  readonly strengths: readonly string[]
  readonly gaps: readonly string[]
  readonly followUpQuestions: readonly string[]
}

export interface AiFollowUpResult {
  readonly question: string
}

export type AiStructuredResult =
  | AiExplainResult
  | AiHintResult
  | AiApproachResult
  | AiComplexityResult
  | AiDesignNotesResult
  | AiFollowUpResult

export interface AiRunOutcome {
  readonly text: string
  readonly result?: AiStructuredResult
  readonly warning?: string
}

export type AiFeedbackReason = 'unhelpful' | 'leaky' | 'wrong' | 'other'

export interface AiFeedbackInput {
  readonly feature: AiFeature
  readonly reason: AiFeedbackReason
  readonly comment?: string
}

export type AiEvent =
  | { readonly requestId: string; readonly type: 'chunk'; readonly text: string }
  | {
      readonly requestId: string
      readonly type: 'done'
      readonly text: string
      readonly result?: AiStructuredResult
      readonly warning?: string
    }
  | {
      readonly requestId: string
      readonly type: 'error'
      readonly message: string
      readonly code: AiErrorCode
    }

export interface BaseCaseApi {
  readonly platform: string
  readonly versions: {
    readonly electron: string
    readonly chrome: string
    readonly node: string
  }
  readonly app: {
    getInfo(): Promise<AppInfo>
    diagnostics(): Promise<DiagnosticsReport>
  }
  readonly content: {
    list(): Promise<ProblemSummary[]>
    get(problemId: string): Promise<ProblemDetail>
    search(query: string): Promise<ProblemSummary[]>
  }
  readonly judge: {
    run(input: RunInput): Promise<RunResult>
    cancel(requestId: string): Promise<boolean>
    status(): Promise<JudgeStatus>
    onEvent(listener: (event: JudgeRunEvent) => void): () => void
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
    problems(): Promise<ProblemProgressEntry[]>
  }
  readonly data: {
    export(): Promise<DataTransferResult>
    import(): Promise<DataTransferResult>
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
    listScenarios(): Promise<DesignScenarioSummary[]>
    getScenario(scenarioId: string): Promise<DesignScenarioDetail>
    getDraft(scenarioId: string): Promise<DesignDraft>
    saveDraft(input: SaveDesignDraftInput): Promise<DesignDraft>
    submit(input: SubmitDesignInput): Promise<DesignAttemptSummary>
    listAttempts(scenarioId: string): Promise<DesignAttemptSummary[]>
    getAttempt(attemptId: string): Promise<DesignAttemptDetail>
    exportAttempt(input: ExportDesignAttemptInput): Promise<ExportDesignAttemptResult>
    getScene(): Promise<DesignScenePayload>
    saveScene(sceneJson: string): Promise<void>
    exportPng(dataUrl: string): Promise<{ saved: boolean; path?: string }>
  }
  readonly ai: {
    getStatus(): Promise<AiProviderStatus>
    saveConfig(input: SaveAiConfigInput): Promise<AiProviderStatus>
    testConnection(): Promise<AiTestConnectionResult>
    preview(request: AiRequest): Promise<AiPreview>
    run(request: AiRequest): Promise<{ requestId: string }>
    cancel(requestId: string): Promise<boolean>
    feedback(input: AiFeedbackInput): Promise<void>
    onEvent(listener: (event: AiEvent) => void): () => void
  }
}
