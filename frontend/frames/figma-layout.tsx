import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

const referenceWidth = 1440
const referenceHeight = 900

export function FigmaLayout({ children, tools, sidebar, signIn }: {
  children: ReactNode; tools: ReactNode; sidebar: 'expanded' | 'compact' | undefined; signIn: boolean
}) {
  const viewport = useRef<HTMLElement>(null)
  const [size, setSize] = useState({ width: referenceWidth, height: referenceHeight })

  useLayoutEffect(() => {
    const element = viewport.current
    if (!element) return
    const measure = () => {
      const { width, height } = element.getBoundingClientRect()
      setSize(previous => previous.width === width && previous.height === height ? previous : { width, height })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const zoom = Math.min(1, size.width / referenceWidth, size.height / referenceHeight) || 1
  const textBoost = Math.min(0.1, (1 - zoom) * 0.4)
  const designWidth = Math.max(referenceWidth, size.width / zoom)
  const rail = sidebar === 'expanded' ? 260 : sidebar === 'compact' ? 95 : 0
  const shellStyle = { '--sidebar-width': `${rail * zoom}px` } as CSSProperties
  const frameStyle = {
    width: designWidth,
    height: Math.max(referenceHeight, size.height / zoom),
    zoom,
    '--figma-extra': `${designWidth - referenceWidth}px`,
    '--figma-rail': rail,
    '--figma-label-scale': 1.22 + textBoost,
    '--figma-copy-scale': 1.16 + textBoost,
    '--figma-title-scale': 1.08 + textBoost / 3,
    '--figma-heading-scale': 1.05 + textBoost / 5,
  } as CSSProperties

  return <div className={sidebar ? 'figma-shell figma-shell--' + sidebar : 'figma-shell'} style={shellStyle}>
    <main ref={viewport} className="figma-viewport" aria-label="SiliconFlow workspace">
      <div className={signIn ? 'figma-frame figma-frame--sign-in' : 'figma-frame'} style={frameStyle}>{children}</div>
    </main>
    {tools}
  </div>
}
