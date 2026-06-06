import { forwardRef } from "react"

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div>
        {label && (
          <label htmlFor={props.id} className="block text-[11px] uppercase tracking-[0.12em] font-semibold text-ink mb-2">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`w-full px-4 py-3 border border-rule bg-paper text-ink placeholder-muted-foreground focus:outline-none focus:border-ink ${error ? 'border-breaking' : ''} ${className}`}
          style={{ fontFamily: 'var(--font-newsreader), Georgia, serif' }}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-breaking">{error}</p>
        )}
      </div>
    )
  }
)

FormTextarea.displayName = "FormTextarea"

export default FormTextarea 