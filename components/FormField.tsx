type FormFieldProps = {
  label: import("react").ReactNode;
  required?: boolean;
  error?: string;
  className?: string;
  children: import("react").ReactNode;
};

export function FormField({ label, required, error, className, children }: FormFieldProps) {
  return (
    <label className={className ? `field ${className}` : "field"}>
      <span>
        {label}
        {required && <abbr aria-label="필수" title="필수 입력">*</abbr>}
      </span>
      {children}
      {error && <p className="form-message" data-tone="error">{error}</p>}
    </label>
  );
}
