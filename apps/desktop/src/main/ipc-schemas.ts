import { z } from 'zod'
import type {
  AiContext,
  AppSettings,
  DraftInput,
  EditorSettings,
  Failure,
  RunInput,
  SaveAiConfigInput,
  SaveDraftInput,
  SettingsPatch,
} from '../shared/types'

export const languageSchema = z.enum(['python', 'typescript'])

export const problemIdSchema = z.string().min(1).max(200)

export const searchQuerySchema = z.string().max(200)

export const packTokenSchema = z.string().uuid()

export const packImportKindSchema = z.enum(['archive', 'folder'])

export const packIdSchema = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)

export const noInputSchema = z.undefined()

const failureSchema: z.ZodType<Failure> = z.object({
  index: z.number().int().nonnegative(),
  isSample: z.boolean(),
  status: z.string().max(100),
  input: z.unknown().optional(),
  expected: z.unknown().optional(),
  actual: z.unknown().optional(),
  userStdout: z.string().max(100_000),
  userStderr: z.string().max(100_000),
  runtimeMs: z.number().nonnegative(),
  memoryBytes: z.number().nonnegative(),
  error: z
    .object({
      type: z.string().max(200),
      message: z.string().max(10_000),
      stack: z.string().max(100_000),
      userLine: z.number().int().nonnegative(),
    })
    .optional(),
  message: z.string().max(10_000).optional(),
}) as z.ZodType<Failure>

export const runInputSchema: z.ZodType<RunInput> = z.object({
  problemId: problemIdSchema,
  language: languageSchema,
  code: z.string().max(200_000),
  mode: z.enum(['sample', 'submit']),
}) as z.ZodType<RunInput>

export const draftInputSchema: z.ZodType<DraftInput> = z.object({
  problemId: problemIdSchema,
  language: languageSchema,
}) as z.ZodType<DraftInput>

export const saveDraftSchema: z.ZodType<SaveDraftInput> = z.object({
  problemId: problemIdSchema,
  language: languageSchema,
  code: z.string().max(200_000),
}) as z.ZodType<SaveDraftInput>

export const aiContextSchema: z.ZodType<AiContext> = z.object({
  problemId: problemIdSchema,
  language: languageSchema,
  code: z.string().max(200_000),
  failure: failureSchema.optional(),
}) as z.ZodType<AiContext>

export const aiConfigSchema: z.ZodType<SaveAiConfigInput> = z.object({
  type: z.enum(['none', 'mock', 'openai-compatible']),
  baseUrl: z.string().max(2000),
  model: z.string().max(200),
  apiKey: z.string().max(10_000).optional(),
  clearKey: z.boolean().optional(),
}) as z.ZodType<SaveAiConfigInput>

export const sceneJsonSchema = z.string().max(5_000_000)

export const pngDataUrlSchema = z.string().max(20_000_000)

const editorSettingsSchema: z.ZodType<EditorSettings> = z.object({
  fontSize: z.number().int().min(10).max(24),
  tabSize: z.number().int().min(2).max(8),
  wordWrap: z.boolean(),
}) as z.ZodType<EditorSettings>

export const appSettingsSchema: z.ZodType<AppSettings> = z.object({
  theme: z.enum(['system', 'light', 'dark']),
  language: languageSchema,
  editor: editorSettingsSchema,
  dailyGoalMinutes: z.number().int().min(5).max(480),
  reviewReminders: z.boolean(),
  onboardingCompleted: z.boolean().default(false),
}) as z.ZodType<AppSettings>

export const settingsPatchSchema: z.ZodType<SettingsPatch> = z.object({
  theme: z.enum(['system', 'light', 'dark']).optional(),
  language: languageSchema.optional(),
  editor: z
    .object({
      fontSize: z.number().int().min(10).max(24).optional(),
      tabSize: z.number().int().min(2).max(8).optional(),
      wordWrap: z.boolean().optional(),
    })
    .optional(),
  dailyGoalMinutes: z.number().int().min(5).max(480).optional(),
  reviewReminders: z.boolean().optional(),
  onboardingCompleted: z.boolean().optional(),
}) as z.ZodType<SettingsPatch>
