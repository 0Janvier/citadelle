import type { ChangeEvent } from 'react'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  autoFocus?: boolean
  className?: string
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Rechercher...',
  autoFocus = false,
  className = '',
}: SearchInputProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  const handleClear = () => {
    onChange('')
  }

  return (
    <div className={`relative ${className}`}>
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="
          w-full min-h-button-md
          pl-10 pr-10
          rounded-hig-md
          border border-[var(--border)]
          bg-[var(--bg-secondary)]
          text-body-hig text-[var(--text)]
          placeholder:text-[var(--text-muted)]
          focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-1
          transition-shadow duration-fast
        "
      />
      {value && (
        <button
          onClick={handleClear}
          className="
            absolute right-1 top-1/2 -translate-y-1/2
            w-8 h-8
            flex items-center justify-center
            rounded-hig-sm
            hover:bg-[var(--bg-tertiary)]
            transition-colors duration-fast
            focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]
          "
          title="Effacer"
          aria-label="Effacer la recherche"
        >
          <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
