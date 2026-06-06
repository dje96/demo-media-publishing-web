import { forwardRef } from "react"

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div>
        {label && (
          <label htmlFor={props.id} className="block text-[11px] uppercase tracking-[0.12em] font-semibold text-ink mb-2">
            {label}
          </label>
        )}
        <input
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

FormInput.displayName = "FormInput"

export default FormInput 