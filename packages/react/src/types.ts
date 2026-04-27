import type { IntentFormEngine } from '@intentform/core'

export interface IntentFormProps {
  engine: IntentFormEngine
  prompt?: string
  onSubmit?: (values: Record<string, unknown>) => void | Promise<void>
}
