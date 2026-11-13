// Custom Peso Icon Component
// This matches the lucide-react icon style (24x24 viewBox, stroke currentColor)
const PesoIcon = ({ className = "w-6 h-6", strokeWidth = 2 }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* P symbol with double horizontal lines (Peso sign) */}
      <path d="M6 4v16" />
      <path d="M6 8h6a3 3 0 0 0 0-6H6" />
      <line x1="4" y1="10" x2="10" y2="10" />
      <line x1="4" y1="14" x2="10" y2="14" />
    </svg>
  )
}

export default PesoIcon
