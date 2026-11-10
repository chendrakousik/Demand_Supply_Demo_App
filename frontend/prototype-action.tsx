import { createContext, useContext, type ReactNode } from 'react'
import type { Role } from './api.js'

type Interaction = {
  href(action: string): string | undefined
  enabled(action: string): boolean
  activate(action: string): void
  text(key: string, sample: ReactNode): ReactNode
  upload(type: 'demand' | 'supply', file: File): void
  role?: Role
  demo: boolean
  email(value: string): void
}
export const PrototypeInteraction = createContext<Interaction | null>(null)
function useInteraction() {
  const interaction = useContext(PrototypeInteraction)
  if (!interaction) throw new Error('Missing prototype interaction context')
  return interaction
}

type LayerProps = { className?: string; 'data-node-id'?: string; 'data-name'?: string; children?: ReactNode }
export function PrototypeAction({ action, ...props }: LayerProps & { action: string }) {
  const interaction = useInteraction()
  const href = interaction.href(action)
  const enabled = interaction.enabled(action)
  if (href && enabled) {
    return <a {...props} href={href} aria-label={action.split(' / ').at(-1)} onClick={event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      event.preventDefault()
      interaction.activate(action)
    }} />
  }
  const label = action.split(' / ').at(-1)
  const role = label === 'Business Analyst' ? 'BA' : label
  const selected = action.startsWith('Role / ') ? interaction.role === role : undefined
  const accessibleName = ({
    'Panel / products': 'Open Product Master', 'Panel / customers': 'Open Customer Master',
    'Panel / locations': 'Open Location Master', 'Panel / mappings': 'Open Product-Location Mapping',
    'Panel / restrictions': 'Review allocation restrictions', 'Panel / scope': 'Review pending workflow',
    'Panel / results': 'Review allocation results',
  } as Record<string, string>)[action] ?? label
  return <button {...props} type="button" aria-label={accessibleName} aria-pressed={selected} disabled={!enabled}
    onClick={() => interaction.activate(action)} />
}

export function PrototypeText({ value, children, ...props }: LayerProps & { value: string }) {
  return <p {...props}>{useInteraction().text(value, children)}</p>
}

export function PrototypeField({ field, className }: { field: 'email' | 'password' | 'remember'; className?: string }) {
  const interaction = useInteraction()
  if (field === 'email') {
    return <input className={className + ' prototype-field'} type="email" autoComplete="username" aria-label="Work email"
      placeholder="name@company.com" onChange={event => interaction.email(event.target.value)} />
  }
  if (field === 'remember') {
    return <p className={className} title="The sign-in provider manages session duration">◻ &nbsp;Remember me</p>
  }
  return <p className={className}>{interaction.demo ? '••••••••••' : 'Enter at the sign-in provider'}</p>
}

export function PrototypeUpload({ type, className }: { type: 'demand' | 'supply'; className?: string }) {
  const interaction = useInteraction()
  return <label className={className + ' prototype-upload'}>
    <input type="file" accept=".csv,text/csv" aria-label={'Select ' + type + ' CSV'} disabled={!interaction.enabled('Upload')}
      onChange={event => {
        const file = event.currentTarget.files?.[0]
        event.currentTarget.value = ''
        if (file) interaction.upload(type, file)
      }} />
    Select CSV • 10 MB maximum
  </label>
}
