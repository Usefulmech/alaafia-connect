import { useNavigate } from 'react-router-dom'

export default function AppHeader({ title, subtitle, actions, showBack }) {
  const navigate = useNavigate()

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-outline-variant bg-surface-container-lowest/95 backdrop-blur-sm shadow-sm">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-4">
        {showBack ? (
          <button
            type="button"
            onClick={() => navigate(-1)}
            translate="no"
            className="inline-flex h-10 items-center justify-center rounded-2xl border border-outline-variant bg-surface px-3 text-sm font-semibold text-on-surface transition hover:border-primary hover:text-primary"
          >
            Back
          </button>
        ) : null}

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-on-surface-variant">
            Àlàáfíà Connect
          </p>
          <h1 className="truncate text-lg font-extrabold italic text-primary">
            {title}
          </h1>
          {subtitle ? <p className="mt-1 text-sm text-on-surface-variant">{subtitle}</p> : null}
        </div>

        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  )
}

