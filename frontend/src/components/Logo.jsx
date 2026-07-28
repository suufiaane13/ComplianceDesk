const LOGO_SRC = { default: '/logo/logo.png', footer: '/logo/logo-footer.png' }

export const logoHoverClassName = 'rounded-xl transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-safe:group-hover:scale-110 motion-safe:group-hover:-translate-y-1 motion-safe:group-active:scale-105 motion-safe:group-active:translate-y-0'

export default function Logo({ className = 'h-8 w-8', alt = 'ComplianceDesk Maroc', variant = 'default', ...props }) {
  return <img src={LOGO_SRC[variant] ?? LOGO_SRC.default} alt={alt} className={`object-contain ${className}`} width={128} height={128} decoding="async" {...props} />
}
