export type Language = 'python' | 'typescript'

export type SectionId = 'today' | 'coding' | 'design' | 'review' | 'progress' | 'settings'

export interface ProblemSummary {
  readonly id: string
  readonly slug: string
  readonly title: string
  readonly difficulty: 'easy' | 'medium' | 'hard'
  readonly patterns: readonly string[]
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
  readonly mode: 'sample' | 'submit'
}

export interface RuntimeInfo {
  readonly name: string
  readonly path: string
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

export interface SaveDraftInput extends DraftInput {
  readonly code: string
}

export interface Stats {
  readonly attempts: number
  readonly accepted: number
  readonly lastAttemptAt: string | null
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
  }
  readonly judge: {
    run(input: RunInput): Promise<RunResult>
    status(): Promise<JudgeStatus>
  }
  readonly drafts: {
    get(input: DraftInput): Promise<string | null>
    save(input: SaveDraftInput): Promise<void>
  }
  readonly attempts: {
    stats(): Promise<Stats>
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
