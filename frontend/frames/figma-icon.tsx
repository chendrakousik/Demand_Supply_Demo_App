import type { CSSProperties, ReactNode } from 'react'

type IconBounds = { x: number; y: number; width: number; height: number }
type IconOwner = { nodeId: string; right: number }

export function FigmaIcon({ bounds, owner, children }: {
  bounds: IconBounds; owner?: IconOwner; children: ReactNode
}) {
  const style = {
    width: bounds.width,
    height: bounds.height,
    '--figma-icon-x': bounds.x,
    '--figma-icon-y': bounds.y,
    '--figma-icon-anchor': owner?.right,
  } as CSSProperties

  return <div className={owner ? 'figma-icon figma-icon--anchored' : 'figma-icon'}
    data-figma-icon-owner={owner?.nodeId} style={style} aria-hidden="true">
    <div className="figma-icon-art">{children}</div>
  </div>
}
