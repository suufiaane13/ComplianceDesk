export default function PageShell({ children, className = '' }) {
  return <div className={`flex flex-1 flex-col ${className}`}>{children}</div>
}
