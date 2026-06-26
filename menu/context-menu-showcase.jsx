const { useMemo, useState } = React;

const mono = 'ui-monospace, "JetBrains Mono", SFMono-Regular, Menlo, monospace';
const sans = 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

function useNarrowViewport(limit = 760) {
  const [narrow, setNarrow] = useState(() => window.innerWidth <= limit);
  React.useEffect(() => {
    const update = () => setNarrow(window.innerWidth <= limit);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [limit]);
  return narrow;
}

function IconBox({ label, active }) {
  return (
    <span style={{
      width: 28,
      height: 28,
      display: 'grid',
      placeItems: 'center',
      borderRadius: 8,
      border: '1px solid rgba(245,238,221,.12)',
      background: active ? '#FF6A00' : 'rgba(245,238,221,.06)',
      color: active ? '#15100a' : '#EDE6D5',
      font: `800 11px/1 ${mono}`
    }}>{label}</span>
  );
}

function Row({ icon, label, hint, active, danger, sub }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '28px minmax(0,1fr) auto',
      alignItems: 'center',
      gap: 10,
      minHeight: 38,
      padding: '5px 8px',
      borderRadius: 9,
      background: active ? 'linear-gradient(90deg,#FF6A00,#F18A31)' : 'transparent',
      color: danger ? '#FF7A5C' : active ? '#17100A' : '#F4EDDF'
    }}>
      <IconBox label={icon} active={active} />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 760, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
        {hint && <div style={{ color: active ? 'rgba(23,16,10,.66)' : 'rgba(244,237,223,.46)', font: `700 10px/1.35 ${mono}` }}>{hint}</div>}
      </div>
      <div style={{ color: active ? 'rgba(23,16,10,.6)' : 'rgba(244,237,223,.46)', font: `800 12px/1 ${mono}` }}>{sub ? '>' : ''}</div>
    </div>
  );
}

function MenuPanel({ title, meta, rows, width = 300 }) {
  return (
    <div style={{
      width,
      borderRadius: 15,
      overflow: 'hidden',
      border: '1px solid rgba(245,238,221,.13)',
      background: 'linear-gradient(180deg,rgba(27,30,34,.96),rgba(15,18,22,.96))',
      boxShadow: '0 24px 54px rgba(0,0,0,.38), inset 0 1px rgba(255,255,255,.04)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 12,
        padding: '12px 14px',
        borderBottom: '1px solid rgba(245,238,221,.1)'
      }}>
        <strong style={{ fontSize: 13 }}>{title}</strong>
        <span style={{ color: '#FF8E40', font: `800 10px/1 ${mono}`, letterSpacing: '.08em' }}>{meta}</span>
      </div>
      <div style={{ padding: 8 }}>
        {rows.map((row, index) => <Row key={index} {...row} />)}
      </div>
    </div>
  );
}

function CascadeStage({ density, narrow }) {
  const rows = [
    { icon: '+', label: 'Add widget', hint: 'compose surface', active: true, sub: true },
    { icon: '#', label: 'Layout preset', hint: 'grid, radial, stack', sub: true },
    { icon: '*', label: 'Wallpaper', hint: 'token-aware media', sub: true },
    { icon: '!', label: 'Shell settings', hint: 'host action' }
  ];
  const childRows = [
    { icon: 'A', label: 'Assistant dock', active: true },
    { icon: 'S', label: 'System stats' },
    { icon: 'N', label: 'Now playing' }
  ];
  const scale = narrow ? 0.68 : 1;
  return (
    <div style={{ position: 'relative', minHeight: narrow ? 230 : (density === 'compact' ? 260 : 310), overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: 512, height: 320, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        <div style={{ position: 'absolute', left: 0, top: 18 }}><MenuPanel title="Empty workspace" meta="ROOT" rows={rows} /></div>
        <div style={{ position: 'absolute', left: 256, top: 76 }}><MenuPanel title="Add widget" meta="L2" rows={childRows} width={230} /></div>
        <div style={{
          position: 'absolute',
          right: 18,
          bottom: 10,
          padding: '7px 10px',
          borderRadius: 999,
          border: '1px solid rgba(255,106,0,.3)',
          color: '#FF8E40',
          background: 'rgba(255,106,0,.08)',
          font: `800 10px/1 ${mono}`,
          letterSpacing: '.08em'
        }}>CASCADE BOUNDED</div>
      </div>
    </div>
  );
}

function RadialStage() {
  const items = [
    ['+', 0, -112], ['#', 94, -54], ['~', 94, 54],
    ['>', 0, 112], ['*', -94, 54], ['?', -94, -54]
  ];
  return (
    <div style={{ height: 310, position: 'relative', display: 'grid', placeItems: 'center' }}>
      <div style={{ width: 236, height: 236, borderRadius: '50%', border: '1px solid rgba(245,238,221,.1)', position: 'relative' }}>
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%,-50%)',
          width: 62,
          height: 62,
          borderRadius: 18,
          border: '1px solid rgba(255,106,0,.36)',
          background: 'rgba(255,106,0,.13)',
          display: 'grid',
          placeItems: 'center',
          color: '#FF8E40',
          font: `900 18px/1 ${mono}`
        }}>in</div>
        {items.map(([label, x, y], index) => (
          <button key={index} style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
            width: 48,
            height: 48,
            borderRadius: 16,
            border: '1px solid rgba(245,238,221,.13)',
            background: index === 0 ? '#FF6A00' : '#1B2026',
            color: index === 0 ? '#15100a' : '#F4EDDF',
            font: `900 15px/1 ${mono}`
          }}>{label}</button>
        ))}
      </div>
    </div>
  );
}

function DockStage() {
  return (
    <div style={{ height: 310, position: 'relative', display: 'grid', placeItems: 'center' }}>
      <div style={{
        display: 'flex',
        gap: 10,
        padding: 12,
        borderRadius: 18,
        border: '1px solid rgba(245,238,221,.13)',
        background: 'rgba(22,25,29,.96)',
        boxShadow: '0 22px 42px rgba(0,0,0,.32)'
      }}>
        {['DIR', 'TERM', 'WEB', 'CODE', 'MUSIC', 'IMG'].map((label, index) => (
          <button key={label} style={{
            width: index === 1 ? 76 : 52,
            height: 52,
            borderRadius: 13,
            border: '1px solid rgba(245,238,221,.12)',
            background: index === 1 ? '#FF6A00' : '#282C31',
            color: index === 1 ? '#15100a' : '#F4EDDF',
            font: `800 10px/1 ${mono}`
          }}>{label}</button>
        ))}
      </div>
      <div style={{ position: 'absolute', left: 28, top: 28 }}>
        <MenuPanel title="Terminal" meta="DOCK" rows={[
          { icon: '>', label: 'Open here', active: true },
          { icon: '+', label: 'New tab' },
          { icon: '^', label: 'Pin to dock' },
          { icon: 'x', label: 'Close', danger: true }
        ]} width={230} />
      </div>
    </div>
  );
}

function Card({ title, meta, children }) {
  return (
    <section style={{
      minHeight: 380,
      borderRadius: 18,
      border: '1px solid rgba(245,238,221,.12)',
      background: 'linear-gradient(180deg,#0D1116,#090C10)',
      overflow: 'hidden',
      boxShadow: '0 22px 54px rgba(0,0,0,.22)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 12,
        alignItems: 'center',
        padding: '14px 16px',
        borderBottom: '1px solid rgba(245,238,221,.1)'
      }}>
        <h2 style={{ margin: 0, fontSize: 15, letterSpacing: 0 }}>{title}</h2>
        <span style={{ color: 'rgba(245,238,221,.48)', font: `800 10px/1 ${mono}`, letterSpacing: '.08em' }}>{meta}</span>
      </div>
      <div style={{ padding: 18 }}>{children}</div>
    </section>
  );
}

function RuleStrip({ narrow }) {
  const rules = [
    ['bornes', 'le menu reste dans le viewport'],
    ['clavier', 'focus, retour et escape restent visibles'],
    ['tactile', 'la densité minimale est nommée'],
    ['preuve', 'chaque famille garde une surface bornée']
  ];
  return (
    <section aria-label="Context menu rules" style={{
      display: 'grid',
      gridTemplateColumns: narrow ? '1fr' : 'repeat(4,minmax(0,1fr))',
      gap: 10,
      marginTop: 18
    }}>
      {rules.map(([title, body]) => (
        <div key={title} style={{
          border: '1px solid rgba(245,238,221,.12)',
          borderRadius: 10,
          background: '#0D1116',
          padding: '13px 14px',
          minHeight: 88
        }}>
          <div style={{ color: '#FF8E40', font: `900 10px/1 ${mono}`, letterSpacing: '.12em', textTransform: 'uppercase' }}>{title}</div>
          <div style={{ marginTop: 10, color: 'rgba(244,237,223,.62)', fontSize: 12, lineHeight: 1.45 }}>{body}</div>
        </div>
      ))}
    </section>
  );
}

function ContextMenuShowcase() {
  const [density, setDensity] = useState('standard');
  const narrow = useNarrowViewport();
  const cards = useMemo(() => [
    ['Cascade', 'submenu chain', <CascadeStage density={density} narrow={narrow} />],
    ['Radial', 'pointer origin', <RadialStage />],
    ['Dock affordance', 'bounded fan', <DockStage />],
    ['Command stack', 'keyboard first', <MenuPanel title="Command menu" meta="STACK" rows={[
      { icon: 'L', label: 'Launcher action', hint: 'Space' },
      { icon: 'W', label: 'Window control', hint: 'Mod + W', active: true },
      { icon: 'S', label: 'Sidebar surface', hint: 'Mod + S', sub: true },
      { icon: 'O', label: 'OSD preview', hint: 'volume and brightness' },
      { icon: 'R', label: 'Reload surface', danger: true }
    ]} />]
  ], [density, narrow]);

  return (
    <main style={{
      minHeight: '100vh',
      background: '#07090B',
      color: '#F4EDDF',
      fontFamily: sans,
      padding: narrow ? '20px 12px 64px 12px' : '26px 30px 72px 92px',
      overflowX: 'hidden'
    }}>
      <header style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 18,
        paddingBottom: 18,
        borderBottom: '1px solid rgba(245,238,221,.1)',
        flexWrap: 'wrap'
      }}>
        <div>
          <div style={{ color: '#FF8E40', font: `900 10px/1 ${mono}`, letterSpacing: '.14em', marginBottom: 8 }}>CONTEXT.SPEC SURFACE</div>
          <h1 style={{ margin: 0, fontSize: 'clamp(30px,4vw,48px)', lineHeight: 1.02, letterSpacing: 0 }}>Menus contextuels</h1>
          <p style={{ maxWidth: 780, margin: '10px 0 0', color: 'rgba(244,237,223,.64)', fontSize: 14, lineHeight: 1.6 }}>
            Couche d'interaction pour les menus du shell: cascade, radial, dock fan et pile de commandes rendus comme surfaces bornées.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, padding: 4, borderRadius: 12, border: '1px solid rgba(245,238,221,.12)', background: '#11161B' }}>
          {['standard', 'compact'].map(value => (
            <button key={value} onClick={() => setDensity(value)} style={{
              border: 0,
              borderRadius: 8,
              padding: '8px 12px',
              background: density === value ? '#FF6A00' : 'transparent',
              color: density === value ? '#15100a' : '#F4EDDF',
              font: `900 11px/1 ${mono}`,
              cursor: 'pointer'
            }} aria-pressed={density === value}>{value}</button>
          ))}
        </div>
      </header>

      <RuleStrip narrow={narrow} />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,520px),1fr))',
        gap: 18,
        marginTop: 22
      }}>
        {cards.map(([title, meta, content]) => (
          <Card key={title} title={title} meta={meta}>{content}</Card>
        ))}
      </div>
    </main>
  );
}

Object.assign(window, { ContextMenuShowcase });
