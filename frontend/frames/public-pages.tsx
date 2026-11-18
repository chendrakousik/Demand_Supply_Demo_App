import { PrototypeAction, PrototypeField, PrototypeText } from '../prototype-action.js'
import { Brand, WorkspaceCard } from './workspace-layout.js'
import { CardIcon } from './figma-card-icons.js'
import { SignInArtwork, SignInProviderIcon } from './figma-sign-in-artwork.js'

export function Home() {
  return <main className="public-layout home-layout">
    <header className="public-header">
      <Brand />
      <div className="public-header-actions">
        <p className="screen-eyebrow">DEMO PLANNING ENVIRONMENT · OCT 2026</p>
        <PrototypeAction action="Button / Sign in to SiliconFlow" className="screen-button screen-button--primary">
          Sign in →
        </PrototypeAction>
      </div>
    </header>
    <div className="home-content">
      <section className="home-hero">
        <div className="home-hero-copy">
          <p className="screen-eyebrow">SEMICONDUCTOR SUPPLY PLANNING</p>
          <h1>Precision planning.<br />Confident allocation.</h1>
          <p className="screen-subtitle">Bring supply data, customer commitments and allocation decisions into one workspace.</p>
        </div>
        <img alt="" src="/figma/1-2-e54be.png" />
      </section>
      <section className="home-choices">
        <h2>Choose your workspace</h2>
        <div className="screen-card-grid">
          <WorkspaceCard title="Data Management" description="Maintain product, customer and planning data"
            action="Button / Data Management" artwork={<CardIcon name="Home / Data Management" />} />
          <WorkspaceCard title="Supply Chain Operations" description="Plan supply, run allocations and review performance"
            action="Button / Supply Chain Operations" artwork={<CardIcon name="Home / Supply Chain Operations" />} />
        </div>
      </section>
    </div>
  </main>
}

export function SignIn() {
  return <main className="public-layout sign-in-layout">
    <section className="sign-in-brand" aria-label="SiliconFlow">
      <Brand />
      <div>
        <p className="screen-eyebrow">SEMICONDUCTOR SUPPLY INTELLIGENCE</p>
        <h1>Precision planning.<br />Confident decisions.</h1>
        <p>One connected workspace for data, allocation and supply-chain performance.</p>
      </div>
      <div className="sign-in-art"><SignInArtwork /></div>
    </section>
    <section className="sign-in-content" aria-labelledby="sign-in-title">
      <div className="sign-in-form">
        <p className="screen-eyebrow">WELCOME BACK</p>
        <h2 id="sign-in-title">Sign in to SiliconFlow</h2>
        <p className="screen-subtitle">Access your semiconductor supply operations workspace.</p>
        <div className="sign-in-fields">
          <label>Work email <PrototypeField field="email" className="sign-in-field" /></label>
          <div><p>Password</p><PrototypeField field="password" className="sign-in-field" /></div>
        </div>
        <div className="sign-in-options">
          <PrototypeField field="remember" />
          <PrototypeAction action="Forgot password" className="screen-text-button">Forgot password?</PrototypeAction>
        </div>
        <PrototypeAction action="Button / Sign in" className="screen-button screen-button--primary">Sign in →</PrototypeAction>
        <p className="screen-subtitle sign-in-divider">or continue with</p>
        <div className="sign-in-providers">
          <PrototypeAction action="Button / Google sign in" className="screen-button"><SignInProviderIcon provider="google" />Google</PrototypeAction>
          <PrototypeAction action="Button / Microsoft sign in" className="screen-button"><SignInProviderIcon provider="microsoft" />Microsoft</PrototypeAction>
        </div>
        <PrototypeText value="sign-in-note" className="screen-subtitle">Demo sign-in — authentication is simulated in this prototype.</PrototypeText>
      </div>
    </section>
  </main>
}

export function SelectRole() {
  const roles = [
    ['Admin', 'All modules + administration'],
    ['Data', 'Master data and transaction uploads'],
    ['Planner', 'Supply operations and allocation tools'],
    ['Business Analyst', 'Allocation results and reporting'],
  ] as const
  return <main className="public-layout role-layout">
    <header className="public-header"><Brand /></header>
    <section className="role-content" aria-label="Select role">
      <PrototypeText value="current-role" className="role-heading">Current role</PrototypeText>
      <p className="screen-subtitle">Select an assigned role below to change the permissions for this session.</p>
      <div className="screen-card-grid">
        {roles.map(([title, description]) => <WorkspaceCard key={title} title={title} description={description}
          action={'Role / ' + title} artwork={<CardIcon name={`SelectRole / ${title}`} />} />)}
      </div>
      <div className="screen-actions">
        <PrototypeAction action="Back Home" className="screen-button">← Home</PrototypeAction>
      </div>
    </section>
  </main>
}
