// Custom Peso Icon Component matching lucide-react style (24x24 viewBox, centered)
const PesoIcon = ({ className = 'w-6 h-6', strokeWidth = 2 }) => {
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
      <path d="M8 13h4a4.5 4.5 0 0 0 0-9H8v16" />
      <path d="M5.5 7h13" />
      <path d="M5.5 10h13" />
    </svg>
  )
}

export default PesoIcon
