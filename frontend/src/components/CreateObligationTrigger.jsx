import Button from './ui/Button'
import { PlusIcon } from './icons'

export default function CreateObligationTrigger({ onClick, className = '' }) {
  return (
    <Button onClick={onClick} className={className}>
      <PlusIcon className="h-4 w-4" /> Nouvelle obligation
    </Button>
  )
}
