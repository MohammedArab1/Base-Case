import type { BaseCaseApi } from '../../shared/types'

declare global {
  interface Window {
    readonly baseCase: BaseCaseApi
  }
}

export {}
