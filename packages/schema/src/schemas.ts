const valueTypeNames = [
  'int',
  'long',
  'double',
  'boolean',
  'string',
  'char',
  'int[]',
  'long[]',
  'double[]',
  'boolean[]',
  'string[]',
  'int[][]',
  'string[][]',
  'ListNode',
  'TreeNode',
] as const

const returnTypeNames = [...valueTypeNames, 'void'] as const

const paramSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['name', 'type'],
  properties: {
    name: { type: 'string', minLength: 1 },
    type: { enum: valueTypeNames },
  },
} as const

const methodSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['name', 'params', 'returns'],
  properties: {
    name: { type: 'string', minLength: 1 },
    params: { type: 'array', items: { $ref: '#/$defs/param' } },
    returns: { enum: returnTypeNames },
  },
} as const

const functionSignatureSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['kind', 'className', 'method', 'params', 'returns', 'mutates'],
  properties: {
    kind: { const: 'function' },
    className: { type: 'string', minLength: 1 },
    method: { type: 'string', minLength: 1 },
    params: { type: 'array', items: { $ref: '#/$defs/param' } },
    returns: { enum: returnTypeNames },
    mutates: { type: 'array', items: { type: 'string', minLength: 1 } },
  },
} as const

const designSignatureSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['kind', 'className', 'constructor', 'methods'],
  properties: {
    kind: { const: 'design' },
    className: { type: 'string', minLength: 1 },
    constructor: { type: 'array', items: { $ref: '#/$defs/param' } },
    methods: { type: 'array', minItems: 1, items: { $ref: '#/$defs/method' } },
  },
} as const

const signatureSchema = {
  oneOf: [functionSignatureSchema, designSignatureSchema],
} as const

const limitsSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['timeMs', 'memoryMb'],
  properties: {
    timeMs: { type: 'integer', minimum: 50, maximum: 60000 },
    memoryMb: { type: 'integer', minimum: 16, maximum: 8192 },
    languageMultipliers: {
      type: 'object',
      additionalProperties: { type: 'number', exclusiveMinimum: 0 },
    },
  },
} as const

const checkerSchema = {
  oneOf: [
    {
      type: 'object',
      additionalProperties: false,
      required: ['kind'],
      properties: { kind: { const: 'exact' } },
    },
    {
      type: 'object',
      additionalProperties: false,
      required: ['kind'],
      properties: { kind: { const: 'unordered' } },
    },
    {
      type: 'object',
      additionalProperties: false,
      required: ['kind'],
      properties: { kind: { const: 'set-of-sets' } },
    },
    {
      type: 'object',
      additionalProperties: false,
      required: ['kind'],
      properties: {
        kind: { const: 'float' },
        absoluteTolerance: { type: 'number', minimum: 0 },
        relativeTolerance: { type: 'number', minimum: 0 },
      },
    },
  ],
} as const

const solutionSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['language', 'path', 'time', 'space'],
  properties: {
    language: { enum: ['python', 'typescript', 'javascript'] },
    path: { type: 'string', minLength: 1 },
    time: { type: 'string', minLength: 1 },
    space: { type: 'string', minLength: 1 },
    isCanonical: { type: 'boolean' },
  },
} as const

const relativeFilePathPattern = '^(?!/)(?!.*(?:^|/)\\.\\.(?:/|$)).+$'

export const packSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'schemaVersion',
    'id',
    'name',
    'version',
    'license',
    'attribution',
    'problems',
    'designs',
  ],
  properties: {
    schemaVersion: { const: 1 },
    id: { type: 'string', pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$' },
    name: { type: 'string', minLength: 1 },
    version: { type: 'string', pattern: '^\\d+\\.\\d+\\.\\d+(?:-[0-9A-Za-z.-]+)?$' },
    license: { type: 'string', minLength: 1 },
    attribution: { type: 'string', minLength: 1 },
    problems: {
      type: 'array',
      uniqueItems: true,
      items: { type: 'string', pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$' },
    },
    designs: {
      type: 'array',
      uniqueItems: true,
      items: { type: 'string', pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$' },
    },
  },
} as const

export const problemSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'schemaVersion',
    'id',
    'slug',
    'title',
    'difficulty',
    'patterns',
    'statement',
    'signature',
    'limits',
    'checker',
    'tests',
    'hints',
    'solutions',
    'explanation',
    'commonMistakes',
    'followUps',
    'license',
    'attribution',
  ],
  properties: {
    schemaVersion: { const: 1 },
    id: { type: 'string', pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*/[a-z0-9]+(?:-[a-z0-9]+)*$' },
    slug: { type: 'string', pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$' },
    title: { type: 'string', minLength: 1 },
    difficulty: { enum: ['easy', 'medium', 'hard'] },
    patterns: { type: 'array', minItems: 1, items: { type: 'string', minLength: 1 } },
    statement: { type: 'string', pattern: relativeFilePathPattern },
    signature: { $ref: '#/$defs/signature' },
    limits: { $ref: '#/$defs/limits' },
    checker: { $ref: '#/$defs/checker' },
    tests: {
      type: 'object',
      additionalProperties: false,
      required: ['sample', 'hidden'],
      properties: {
        sample: { type: 'string', pattern: relativeFilePathPattern },
        hidden: { type: 'string', pattern: relativeFilePathPattern },
      },
    },
    hints: { type: 'string', pattern: relativeFilePathPattern },
    solutions: { type: 'array', minItems: 1, items: { $ref: '#/$defs/solution' } },
    explanation: { type: 'string', pattern: relativeFilePathPattern },
    commonMistakes: { type: 'array', items: { type: 'string', minLength: 1 } },
    followUps: { type: 'array', items: { type: 'string', minLength: 1 } },
    license: { type: 'string', minLength: 1 },
    attribution: { type: 'string', minLength: 1 },
    leetcodeSlug: { type: 'string', pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$' },
    version: { type: 'integer', minimum: 1 },
  },
  $defs: {
    param: paramSchema,
    method: methodSchema,
    signature: signatureSchema,
    limits: limitsSchema,
    checker: checkerSchema,
    solution: solutionSchema,
  },
} as const

export const designSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'schemaVersion',
    'id',
    'slug',
    'title',
    'difficulty',
    'tags',
    'prompt',
    'requirements',
    'scale',
    'rubric',
    'reference',
    'followUps',
    'commonMistakes',
    'license',
    'attribution',
  ],
  properties: {
    schemaVersion: { const: 1 },
    id: { type: 'string', pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*/[a-z0-9]+(?:-[a-z0-9]+)*$' },
    slug: { type: 'string', pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$' },
    title: { type: 'string', minLength: 1 },
    difficulty: { enum: ['easy', 'medium', 'hard'] },
    tags: { type: 'array', minItems: 1, items: { type: 'string', minLength: 1 } },
    prompt: { type: 'string', pattern: relativeFilePathPattern },
    requirements: {
      type: 'object',
      additionalProperties: false,
      required: ['functional', 'nonFunctional'],
      properties: {
        functional: { type: 'array', minItems: 1, items: { type: 'string', minLength: 1 } },
        nonFunctional: { type: 'array', minItems: 1, items: { type: 'string', minLength: 1 } },
      },
    },
    scale: {
      type: 'object',
      additionalProperties: false,
      required: ['writesPerDay', 'readsPerDay', 'retentionYears'],
      properties: {
        writesPerDay: { type: 'integer', minimum: 0 },
        readsPerDay: { type: 'integer', minimum: 0 },
        retentionYears: { type: 'integer', minimum: 0 },
      },
    },
    rubric: { type: 'string', pattern: relativeFilePathPattern },
    reference: { type: 'string', pattern: relativeFilePathPattern },
    referenceScene: { type: 'string', pattern: relativeFilePathPattern },
    followUps: { type: 'array', items: { type: 'string', minLength: 1 } },
    commonMistakes: { type: 'array', items: { type: 'string', minLength: 1 } },
    license: { type: 'string', minLength: 1 },
    attribution: { type: 'string', minLength: 1 },
    version: { type: 'integer', minimum: 1 },
  },
} as const

export const hintsSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['hints'],
  properties: {
    hints: {
      type: 'array',
      minItems: 3,
      maxItems: 4,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['level', 'title', 'body'],
        properties: {
          level: { type: 'integer', minimum: 1, maximum: 4 },
          title: { type: 'string', minLength: 1 },
          body: { type: 'string', minLength: 1 },
        },
      },
    },
  },
} as const

export const testCaseSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['input', 'expected'],
  properties: {
    input: {},
    expected: {},
    notes: { type: 'string' },
    performance: { type: 'boolean' },
  },
} as const

export const rubricSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['dimensions'],
  properties: {
    dimensions: {
      type: 'array',
      minItems: 7,
      maxItems: 7,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'name', 'description', 'levels'],
        properties: {
          id: { type: 'string', pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$' },
          name: { type: 'string', minLength: 1 },
          description: { type: 'string', minLength: 1 },
          levels: {
            type: 'object',
            additionalProperties: false,
            required: ['1', '2', '3', '4'],
            properties: {
              '1': { type: 'string', minLength: 1 },
              '2': { type: 'string', minLength: 1 },
              '3': { type: 'string', minLength: 1 },
              '4': { type: 'string', minLength: 1 },
            },
          },
        },
      },
    },
  },
} as const
