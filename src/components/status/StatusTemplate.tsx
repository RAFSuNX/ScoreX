interface StatusTemplateProps {
  code: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryAction?: {
    label: string;
    href: string;
  };
  children?: React.ReactNode;
}

export function StatusTemplate({
  code,
  title,
  description,
  actionLabel,
  onAction,
  secondaryAction = { label: "Go Home", href: "/" },
  children,
}: StatusTemplateProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="w-full max-w-lg text-center space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground tracking-widest">
            STATUS {code}
          </p>
          <h1 className="text-3xl font-semibold">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        {children && <div className="text-sm text-muted-foreground">{children}</div>}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          {actionLabel && onAction && (
            <button
              type="button"
              onClick={onAction}
              className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
            >
              {actionLabel}
            </button>
          )}
          <a
            href={secondaryAction.href}
            className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
          >
            {secondaryAction.label}
          </a>
        </div>
      </div>
    </div>
  );
}
