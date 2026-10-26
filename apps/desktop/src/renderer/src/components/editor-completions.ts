import { completionPath } from '@codemirror/lang-javascript'
import type { Completion, CompletionContext, CompletionResult } from '@codemirror/autocomplete'

export type MemberKind =
  | 'array'
  | 'string'
  | 'map'
  | 'set'
  | 'promise'
  | 'date'
  | 'regexp'
  | 'number'
  | 'boolean'
  | 'object'

interface MemberGroup {
  readonly methods: readonly string[]
  readonly properties?: readonly string[]
}

const javascriptMembers: Record<MemberKind, MemberGroup> = {
  array: {
    methods: [
      'at',
      'concat',
      'copyWithin',
      'entries',
      'every',
      'fill',
      'filter',
      'find',
      'findIndex',
      'findLast',
      'findLastIndex',
      'flat',
      'flatMap',
      'forEach',
      'includes',
      'indexOf',
      'join',
      'keys',
      'lastIndexOf',
      'map',
      'pop',
      'push',
      'reduce',
      'reduceRight',
      'reverse',
      'shift',
      'slice',
      'some',
      'sort',
      'splice',
      'toReversed',
      'toSorted',
      'toSpliced',
      'unshift',
      'values',
      'with',
    ],
    properties: ['length'],
  },
  string: {
    methods: [
      'at',
      'charAt',
      'charCodeAt',
      'codePointAt',
      'concat',
      'endsWith',
      'includes',
      'indexOf',
      'lastIndexOf',
      'match',
      'matchAll',
      'normalize',
      'padEnd',
      'padStart',
      'repeat',
      'replace',
      'replaceAll',
      'search',
      'slice',
      'split',
      'startsWith',
      'substring',
      'toLocaleLowerCase',
      'toLocaleUpperCase',
      'toLowerCase',
      'toUpperCase',
      'trim',
      'trimEnd',
      'trimStart',
    ],
    properties: ['length'],
  },
  map: {
    methods: ['clear', 'delete', 'entries', 'forEach', 'get', 'has', 'keys', 'set', 'values'],
    properties: ['size'],
  },
  set: {
    methods: ['add', 'clear', 'delete', 'entries', 'forEach', 'has', 'keys', 'values'],
    properties: ['size'],
  },
  promise: {
    methods: ['catch', 'finally', 'then'],
  },
  date: {
    methods: [
      'getDate',
      'getDay',
      'getFullYear',
      'getHours',
      'getMilliseconds',
      'getMinutes',
      'getMonth',
      'getSeconds',
      'getTime',
      'getTimezoneOffset',
      'getUTCDate',
      'getUTCFullYear',
      'getUTCMonth',
      'setDate',
      'setFullYear',
      'setHours',
      'setMilliseconds',
      'setMinutes',
      'setMonth',
      'setSeconds',
      'setTime',
      'toDateString',
      'toISOString',
      'toJSON',
      'toLocaleDateString',
      'toLocaleString',
      'toLocaleTimeString',
      'toTimeString',
      'toUTCString',
    ],
  },
  regexp: {
    methods: ['exec', 'test', 'toString'],
    properties: ['flags', 'global', 'ignoreCase', 'lastIndex', 'multiline', 'source', 'sticky'],
  },
  number: {
    methods: ['toExponential', 'toFixed', 'toLocaleString', 'toPrecision', 'toString', 'valueOf'],
  },
  boolean: {
    methods: ['toString', 'valueOf'],
  },
  object: {
    methods: [
      'hasOwnProperty',
      'isPrototypeOf',
      'propertyIsEnumerable',
      'toLocaleString',
      'toString',
      'valueOf',
    ],
  },
}

const pythonMembers: Record<MemberKind, MemberGroup> = {
  array: {
    methods: [
      'append',
      'clear',
      'copy',
      'count',
      'extend',
      'index',
      'insert',
      'pop',
      'remove',
      'reverse',
      'sort',
    ],
  },
  string: {
    methods: [
      'capitalize',
      'casefold',
      'center',
      'count',
      'encode',
      'endswith',
      'find',
      'format',
      'index',
      'isalnum',
      'isalpha',
      'isdigit',
      'islower',
      'isspace',
      'isupper',
      'join',
      'lower',
      'lstrip',
      'partition',
      'removeprefix',
      'removesuffix',
      'replace',
      'rfind',
      'rindex',
      'rpartition',
      'rsplit',
      'rstrip',
      'split',
      'splitlines',
      'startswith',
      'strip',
      'swapcase',
      'title',
      'upper',
      'zfill',
    ],
  },
  map: {
    methods: [
      'clear',
      'copy',
      'get',
      'items',
      'keys',
      'pop',
      'popitem',
      'setdefault',
      'update',
      'values',
    ],
  },
  set: {
    methods: [
      'add',
      'clear',
      'copy',
      'difference',
      'difference_update',
      'discard',
      'intersection',
      'intersection_update',
      'isdisjoint',
      'issubset',
      'issuperset',
      'pop',
      'remove',
      'symmetric_difference',
      'symmetric_difference_update',
      'union',
      'update',
    ],
  },
  promise: {
    methods: [],
  },
  date: {
    methods: [],
  },
  regexp: {
    methods: [],
  },
  number: {
    methods: ['bit_length', 'is_integer', 'to_bytes'],
  },
  boolean: {
    methods: [],
  },
  object: {
    methods: ['__eq__', '__repr__', '__str__'],
  },
}

const javascriptTypeKinds: Record<string, MemberKind> = {
  Array: 'array',
  ReadonlyArray: 'array',
  String: 'string',
  string: 'string',
  Map: 'map',
  ReadonlyMap: 'map',
  WeakMap: 'map',
  Set: 'set',
  ReadonlySet: 'set',
  WeakSet: 'set',
  Promise: 'promise',
  Date: 'date',
  RegExp: 'regexp',
  Number: 'number',
  number: 'number',
  Boolean: 'boolean',
  boolean: 'boolean',
  Object: 'object',
  object: 'object',
}

const pythonTypeKinds: Record<string, MemberKind> = {
  list: 'array',
  List: 'array',
  str: 'string',
  String: 'string',
  dict: 'map',
  Dict: 'map',
  defaultdict: 'map',
  Counter: 'map',
  set: 'set',
  Set: 'set',
  frozenset: 'set',
  FrozenSet: 'set',
  int: 'number',
  float: 'number',
  complex: 'number',
  bool: 'boolean',
  object: 'object',
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function annotationType(source: string, variable: string): string | null {
  const pattern = new RegExp(
    `\\b${escapeRegExp(variable)}\\??\\s*:\\s*([A-Za-z_$][\\w$]*(?:\\s*<[^>]*>)?(?:\\s*\\[\\])*)`,
  )
  const match = pattern.exec(source)
  return match?.[1]?.trim() ?? null
}

export function inferJavascriptMemberKind(source: string, variable: string): MemberKind | null {
  const annotated = annotationType(source, variable)

  if (annotated) {
    if (annotated.endsWith('[]')) {
      return 'array'
    }

    const typeName = annotated.split('<')[0]?.trim()

    if (typeName && javascriptTypeKinds[typeName]) {
      return javascriptTypeKinds[typeName]
    }
  }

  const initializer = new RegExp(
    `(?:const|let|var)\\s+${escapeRegExp(variable)}\\s*=\\s*([^\\n;]+)`,
  )
    .exec(source)?.[1]
    ?.trim()

  if (!initializer) {
    return null
  }

  const constructor = /^new\s+([A-Za-z_$][\w$]*)/.exec(initializer)?.[1]

  if (constructor && javascriptTypeKinds[constructor]) {
    return javascriptTypeKinds[constructor]
  }

  if (initializer.startsWith('[') || initializer.startsWith('Array.')) {
    return 'array'
  }
  if (initializer.startsWith('{')) {
    return 'object'
  }
  if (/^['"`]/.test(initializer)) {
    return 'string'
  }
  if (/^(?:-?\d|0x|0b|0o)/.test(initializer)) {
    return 'number'
  }
  if (/^(?:true|false)\b/.test(initializer)) {
    return 'boolean'
  }
  if (/\.(?:filter|flatMap|map|slice|split|toSorted|toReversed)\(/.test(initializer)) {
    return 'array'
  }

  return null
}

export function inferPythonMemberKind(source: string, variable: string): MemberKind | null {
  const annotated = annotationType(source, variable)

  if (annotated && pythonTypeKinds[annotated]) {
    return pythonTypeKinds[annotated]
  }

  const initializer = new RegExp(`\\b${escapeRegExp(variable)}\\s*=\\s*([^\\n;]+)`)
    .exec(source)?.[1]
    ?.trim()

  if (!initializer) {
    return null
  }

  if (/^(?:set|frozenset)\(/.test(initializer)) {
    return 'set'
  }
  if (/^(?:dict|defaultdict|Counter)\(/.test(initializer)) {
    return 'map'
  }
  if (/^(?:list|tuple)\(/.test(initializer)) {
    return 'array'
  }
  if (/^(?:str)\(/.test(initializer)) {
    return 'string'
  }
  if (initializer.startsWith('[')) {
    return 'array'
  }
  if (initializer.startsWith('{')) {
    return initializer === '{}' || initializer.includes(':') ? 'map' : 'set'
  }
  if (/^['"]/.test(initializer)) {
    return 'string'
  }
  if (/^(?:-?\d|0x|0b|0o)/.test(initializer)) {
    return 'number'
  }
  if (/^(?:True|False)\b/.test(initializer)) {
    return 'boolean'
  }

  return null
}

function toOptions(kind: MemberKind, language: 'javascript' | 'python'): Completion[] {
  const group = language === 'javascript' ? javascriptMembers[kind] : pythonMembers[kind]
  const detail = language === 'javascript' ? 'JavaScript' : 'Python'

  return [
    ...group.methods.map((label) => ({
      label,
      type: 'method' as const,
      detail,
    })),
    ...(group.properties ?? []).map((label) => ({
      label,
      type: 'property' as const,
      detail,
    })),
  ]
}

export function javascriptMemberCompletions(context: CompletionContext): CompletionResult | null {
  const path = completionPath(context)

  if (!path || path.path.length !== 1) {
    return null
  }

  const variable = path.path[0]

  if (!variable) {
    return null
  }

  const kind = inferJavascriptMemberKind(context.state.doc.toString(), variable)

  if (!kind) {
    return null
  }

  const word = context.matchBefore(/[\w$]*/)
  return {
    from: word?.from ?? context.pos,
    options: toOptions(kind, 'javascript'),
    validFor: /^[\w$]*$/,
  }
}

export function pythonMemberCompletions(context: CompletionContext): CompletionResult | null {
  const before = context.matchBefore(/[\w.]*/)
  const text = before?.text ?? ''

  if (!text.endsWith('.') && !text.includes('.')) {
    return null
  }

  const match = /([A-Za-z_]\w*)\.\w*$/.exec(text)

  if (!match) {
    return null
  }

  const variable = match[1]

  if (!variable) {
    return null
  }

  const kind = inferPythonMemberKind(context.state.doc.toString(), variable)

  if (!kind) {
    return null
  }

  const word = context.matchBefore(/\w*/)
  return { from: word?.from ?? context.pos, options: toOptions(kind, 'python'), validFor: /^\w*$/ }
}
