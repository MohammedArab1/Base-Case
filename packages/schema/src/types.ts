export type Difficulty = 'easy' | 'medium' | 'hard'

export type ProblemLanguage = 'python' | 'typescript' | 'javascript'

export type ValueType =
  | 'int'
  | 'long'
  | 'double'
  | 'boolean'
  | 'string'
  | 'char'
  | 'int[]'
  | 'long[]'
  | 'double[]'
  | 'boolean[]'
  | 'string[]'
  | 'int[][]'
  | 'string[][]'
  | 'ListNode'
  | 'TreeNode'

export type ReturnType = ValueType | 'void'

export interface ParamSpec {
  readonly name: string
  readonly type: ValueType
}

export interface MethodSpec {
  readonly name: string
  readonly params: readonly ParamSpec[]
  readonly returns: ReturnType
}

export interface FunctionSignature {
  readonly kind: 'function'
  readonly className: string
  readonly method: string
  readonly params: readonly ParamSpec[]
  readonly returns: ReturnType
  readonly mutates: readonly string[]
}

export interface DesignSignature {
  readonly kind: 'design'
  readonly className: string
  readonly constructor: readonly ParamSpec[]
  readonly methods: readonly MethodSpec[]
}

export type Signature = FunctionSignature | DesignSignature

export interface Limits {
  readonly timeMs: number
  readonly memoryMb: number
  readonly languageMultipliers?: Readonly<Record<string, number>>
}

export type Checker =
  | { readonly kind: 'exact' }
  | { readonly kind: 'unordered' }
  | { readonly kind: 'set-of-sets' }
  | {
      readonly kind: 'float'
      readonly absoluteTolerance?: number
      readonly relativeTolerance?: number
    }

export interface SolutionRef {
  readonly language: ProblemLanguage
  readonly path: string
  readonly time: string
  readonly space: string
  readonly isCanonical?: boolean
}

export interface Problem {
  readonly schemaVersion: 1
  readonly id: string
  readonly slug: string
  readonly title: string
  readonly difficulty: Difficulty
  readonly patterns: readonly string[]
  readonly statement: string
  readonly signature: Signature
  readonly limits: Limits
  readonly checker: Checker
  readonly tests: {
    readonly sample: string
    readonly hidden: string
  }
  readonly hints: string
  readonly solutions: readonly SolutionRef[]
  readonly explanation: string
  readonly commonMistakes: readonly string[]
  readonly followUps: readonly string[]
  readonly license: string
  readonly attribution: string
  readonly leetcodeSlug?: string
  readonly version?: number
}

export interface TestCase {
  readonly input: unknown
  readonly expected: unknown
  readonly notes?: string
  readonly performance?: boolean
}

export interface Hint {
  readonly level: 1 | 2 | 3 | 4
  readonly title: string
  readonly body: string
}

export interface HintFile {
  readonly hints: readonly Hint[]
}

export interface PackManifest {
  readonly schemaVersion: 1
  readonly id: string
  readonly name: string
  readonly version: string
  readonly license: string
  readonly attribution: string
  readonly problems: readonly string[]
  readonly designs: readonly string[]
}

export interface DesignRequirements {
  readonly functional: readonly string[]
  readonly nonFunctional: readonly string[]
}

export interface DesignScale {
  readonly writesPerDay: number
  readonly readsPerDay: number
  readonly retentionYears: number
}

export interface RubricDimension {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly levels: {
    readonly '1': string
    readonly '2': string
    readonly '3': string
    readonly '4': string
  }
}

export interface Rubric {
  readonly dimensions: readonly RubricDimension[]
}

export interface DesignScenario {
  readonly schemaVersion: 1
  readonly id: string
  readonly slug: string
  readonly title: string
  readonly difficulty: Difficulty
  readonly tags: readonly string[]
  readonly prompt: string
  readonly requirements: DesignRequirements
  readonly scale: DesignScale
  readonly rubric: string
  readonly reference: string
  readonly referenceScene?: string
  readonly followUps: readonly string[]
  readonly commonMistakes: readonly string[]
  readonly license: string
  readonly attribution: string
  readonly version?: number
}
