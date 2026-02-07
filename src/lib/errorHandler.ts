import { useToastStore } from '../store/useToastStore'

/**
 * Unified error handler for Citadelle.
 * Always logs to console with context, optionally shows a toast.
 */
export function handleError(
  error: unknown,
  context: string,
  options?: { silent?: boolean; toastType?: 'error' | 'warning' }
): void {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`[${context}] ${message}`, error)

  if (!options?.silent) {
    useToastStore.getState().addToast({
      type: options?.toastType ?? 'error',
      message: `${context} : ${message}`,
    })
  }
}
