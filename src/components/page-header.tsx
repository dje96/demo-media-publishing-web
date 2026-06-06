interface PageHeaderProps {
  title: string
  description?: string
  className?: string
  kicker?: string
}

export default function PageHeader({ title, description, className = "", kicker }: PageHeaderProps) {
  const isCentered = className.includes("text-center")
  return (
    <div className={`mb-8 pb-6 border-b border-rule ${className}`}>
      {kicker && <div className="kicker mb-3">{kicker}</div>}
      <h1
        className="headline text-3xl sm:text-4xl mb-3"
        style={{ fontFamily: 'var(--font-newsreader), Georgia, serif' }}
      >
        {title}
      </h1>
      {description && (
        <p
          className={`text-lg leading-snug text-muted-foreground max-w-2xl ${isCentered ? "mx-auto" : ""}`}
          style={{ fontFamily: 'var(--font-newsreader), Georgia, serif' }}
        >
          {description}
        </p>
      )}
    </div>
  )
}
