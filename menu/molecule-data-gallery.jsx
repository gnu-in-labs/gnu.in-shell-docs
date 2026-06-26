// molecule-data-gallery.jsx — primitives + scenes + generic renderer + embedded specs.

// menu-primitives.jsx
// Gnu.In-Shell context menu primitives.
// Tokens, shape presets, mask-reveal animation, dither/grain backgrounds,
// MenuShell, MenuRow, MenuSection, MenuSeparator, KbdHint, Submenu arrow.

const GNU = {
  anthracite: '#111418',
  signal:     '#FF6A00',
  beret:      '#5F7F52',
  shellWhite: '#F7F3ED',
  // derived
  ink:        '#111418',
  paper:      '#F7F3ED',
};

// Theme resolver — dark/light + branding heaviness.
function gnuTheme({ dark, brand }) {
  const heavy   = brand === 'heavy';
  const medium  = brand === 'medium';
  const light   = brand === 'light';
  if (dark) {
    return {
      bg:        heavy ? '#0E1114' : '#15181C',
      bgGrain:   heavy ? '#0A0C0F' : '#10131680',
      surface:   heavy ? '#181C20' : '#1B1F23',
      hover:     heavy ? '#22272D' : '#252A30',
      border:    heavy ? 'rgba(255,106,0,.14)' : 'rgba(255,255,255,.07)',
      text:      '#F7F3ED',
      textDim:   'rgba(247,243,237,.55)',
      textFaint: 'rgba(247,243,237,.32)',
      accent:    GNU.signal,
      accentDim: 'rgba(255,106,0,.14)',
      green:     GNU.beret,
      kbdBg:     'rgba(255,255,255,.06)',
      kbdBorder: 'rgba(255,255,255,.08)',
      sectionLb: heavy ? '#FF6A00' : 'rgba(247,243,237,.4)',
      shadow:    '0 24px 64px -8px rgba(0,0,0,.6),0 8px 24px -4px rgba(0,0,0,.4),0 0 0 .5px rgba(255,255,255,.04)',
      mode: 'dark',
    };
  }
  return {
    bg:        heavy ? '#F7F3ED' : '#FBFAF6',
    bgGrain:   heavy ? '#EFEAE0' : '#F2EEE6',
    surface:   '#FFFFFF',
    hover:     heavy ? 'rgba(255,106,0,.08)' : 'rgba(17,20,24,.05)',
    border:    heavy ? 'rgba(17,20,24,.12)' : 'rgba(17,20,24,.08)',
    text:      GNU.anthracite,
    textDim:   'rgba(17,20,24,.62)',
    textFaint: 'rgba(17,20,24,.36)',
    accent:    GNU.signal,
    accentDim: 'rgba(255,106,0,.1)',
    green:     GNU.beret,
    kbdBg:     'rgba(17,20,24,.04)',
    kbdBorder: 'rgba(17,20,24,.08)',
    sectionLb: heavy ? '#FF6A00' : 'rgba(17,20,24,.45)',
    shadow:    '0 24px 64px -8px rgba(17,20,24,.18),0 8px 24px -4px rgba(17,20,24,.1),0 0 0 .5px rgba(17,20,24,.06)',
    mode: 'light',
  };
}

// Shape presets: rounded-soft / sharp / pill / cut.
function gnuShape(preset) {
  switch (preset) {
    case 'sharp': return { menuRadius: 0,  rowRadius: 0,  pad: 6 };
    case 'pill':  return { menuRadius: 14, rowRadius: 999, pad: 6 };
    case 'cut':   return { menuRadius: 12, rowRadius: 4, cutCorner: true, pad: 6 };
    default:      return { menuRadius: 12, rowRadius: 7, pad: 6 };
  }
}

// Density tokens.
function gnuDensity(d) {
  if (d === 'touch') return { rowH: 44, rowPx: 14, fs: 14, iconSize: 18, gap: 12, kbdFs: 11, secPx: 14, secPy: 10 };
  if (d === 'mouse') return { rowH: 26, rowPx: 10, fs: 12, iconSize: 14, gap: 8, kbdFs: 10, secPx: 10, secPy: 6 };
  /* comfy */         return { rowH: 32, rowPx: 12, fs: 13, iconSize: 16, gap: 10, kbdFs: 10, secPx: 12, secPy: 8 };
}

// ─── Shader-y backgrounds ──────────────────────────────────────────────

// Dither / halftone svg pattern. Animated via CSS transform.
function DitherBg({ color = '#FF6A00', opacity = 0.08, animate = true }) {
  const id = React.useId();
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity }}>
      <defs>
        <pattern id={`d-${id}`} x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r=".7" fill={color} />
          <circle cx="4" cy="4" r=".5" fill={color} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#d-${id})`}>
        {animate && <animateTransform attributeName="transform" type="translate" from="0 0" to="6 6" dur="6s" repeatCount="indefinite" />}
      </rect>
    </svg>
  );
}

// Grain noise (small svg fractal noise).
function GrainBg({ opacity = 0.05 }) {
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity, mixBlendMode: 'overlay' }}>
      <filter id="grain-noise">
        <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="3" />
        <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .8 0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain-noise)" />
    </svg>
  );
}

// Refraction edge — soft warped colored ring at the menu edge to suggest the bg
// is being warped underneath.
function EdgeRefraction({ color, radius = 12 }) {
  return (
    <div aria-hidden style={{
      position: 'absolute', inset: -1, borderRadius: radius + 1, pointerEvents: 'none',
      background: `radial-gradient(120% 60% at 0% 0%, ${color}11, transparent 50%),
                   radial-gradient(120% 60% at 100% 100%, ${color}08, transparent 50%)`,
      mixBlendMode: 'screen',
    }} />
  );
}

// ─── Mask reveal: clip-path circle from cursor origin ──────────────────
// origin is { x, y } in pixels relative to menu top-left.
function MaskReveal({ origin = { x: 0, y: 0 }, duration = 280, children, style, radius = 12 }) {
  const [phase, setPhase] = React.useState(0); // 0 closed → 1 open
  React.useEffect(() => {
    let raf, t0;
    const tick = (t) => {
      if (!t0) t0 = t;
      const p = Math.min(1, (t - t0) / duration);
      // ease-out cubic
      setPhase(1 - Math.pow(1 - p, 3));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [duration]);
  // use clip-path circle scaling to ~150% of diagonal
  const r = `${phase * 160}%`;
  return (
    <div style={{
      ...style,
      borderRadius: radius,
      clipPath: `circle(${r} at ${origin.x}px ${origin.y}px)`,
      WebkitClipPath: `circle(${r} at ${origin.x}px ${origin.y}px)`,
      transform: `scale(${0.97 + phase * 0.03})`,
      transformOrigin: `${origin.x}px ${origin.y}px`,
      opacity: 0.4 + phase * 0.6,
    }}>{children}</div>
  );
}

// ─── Particle accents — small SVG burst on click ───────────────────────
function ParticleBurst({ x, y, color = GNU.signal, onDone }) {
  React.useEffect(() => { const t = setTimeout(onDone, 550); return () => clearTimeout(t); }, [onDone]);
  const parts = Array.from({ length: 7 }, (_, i) => {
    const a = (i / 7) * Math.PI * 2 + Math.random() * 0.4;
    const d = 14 + Math.random() * 10;
    return { dx: Math.cos(a) * d, dy: Math.sin(a) * d, r: 1 + Math.random() * 1.6, k: i };
  });
  return (
    <svg style={{ position: 'absolute', left: x - 30, top: y - 30, width: 60, height: 60, pointerEvents: 'none', overflow: 'visible' }}>
      {parts.map((p) => (
        <circle key={p.k} cx="30" cy="30" r={p.r} fill={color}>
          <animate attributeName="cx" from="30" to={30 + p.dx} dur=".5s" fill="freeze" />
          <animate attributeName="cy" from="30" to={30 + p.dy} dur=".5s" fill="freeze" />
          <animate attributeName="opacity" from="1" to="0" dur=".5s" fill="freeze" />
        </circle>
      ))}
    </svg>
  );
}

// ─── MenuShell: the unified outer wrapper ──────────────────────────────
function MenuShell({ theme, shape, density, width = 240, origin, withDither = false, withGrain = true, withRefraction = true, children, label, style }) {
  const radius = shape.menuRadius;
  return (
    <div style={{ position: 'relative', width, ...style }}>
      <MaskReveal origin={origin || { x: width / 2, y: 0 }} radius={radius}>
        <div style={{
          background: theme.surface,
          borderRadius: radius,
          padding: shape.pad,
          boxShadow: theme.shadow,
          border: `.5px solid ${theme.border}`,
          color: theme.text,
          fontFamily: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
          fontSize: density.fs,
          position: 'relative',
          overflow: 'hidden',
          clipPath: shape.cutCorner ? 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%)' : 'none',
        }}>
          {withDither && <DitherBg color={theme.accent} opacity={theme.mode === 'dark' ? 0.06 : 0.05} />}
          {withGrain && <GrainBg opacity={theme.mode === 'dark' ? 0.07 : 0.04} />}
          {withRefraction && <EdgeRefraction color={theme.accent} radius={radius} />}
          <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
          {label && (
            <div style={{
              position: 'absolute', top: 6, right: 8, fontSize: 9, letterSpacing: '0.12em',
              fontWeight: 600, color: theme.accent, textTransform: 'uppercase', zIndex: 2,
              fontVariantNumeric: 'tabular-nums', opacity: 0.7,
            }}>{label}</div>
          )}
        </div>
      </MaskReveal>
    </div>
  );
}

function MenuSection({ label, theme, density, children }) {
  return (
    <div>
      {label && (
        <div style={{
          padding: `${density.secPy}px ${density.secPx}px 4px`,
          fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase',
          color: theme.sectionLb, fontWeight: 600,
        }}>{label}</div>
      )}
      {children}
    </div>
  );
}

function MenuSeparator({ theme }) {
  return <div style={{ height: 1, background: theme.border, margin: '4px 6px' }} />;
}

function KbdHint({ keys, theme, density }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2, marginLeft: 'auto' }}>
      {keys.map((k, i) => (
        <span key={i} style={{
          fontSize: density.kbdFs, fontFamily: 'ui-monospace, "JetBrains Mono", monospace',
          padding: '1px 5px', borderRadius: 3,
          background: theme.kbdBg, border: `.5px solid ${theme.kbdBorder}`,
          color: theme.textDim, fontWeight: 500, lineHeight: 1.3,
        }}>{k}</span>
      ))}
    </span>
  );
}

function MenuRow({ icon, label, kbd, sub, danger, accent, hovered, onHover, onClick, theme, shape, density, hasSubmenu, swatch, toggle, toggleOn, disabled, mascot }) {
  const isHover = hovered;
  return (
    <div
      onMouseEnter={onHover}
      onClick={disabled ? undefined : onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: density.gap,
        padding: `0 ${density.rowPx}px`, height: density.rowH, minHeight: density.rowH,
        borderRadius: shape.rowRadius, cursor: disabled ? 'default' : 'pointer',
        background: isHover ? (danger ? 'rgba(255,80,60,.12)' : (accent ? theme.accent : theme.hover)) : 'transparent',
        color: disabled ? theme.textFaint : (isHover && accent ? '#fff' : (danger ? '#FF6044' : theme.text)),
        position: 'relative', transition: 'background .08s linear, color .08s linear',
        userSelect: 'none',
      }}
    >
      {/* hover fill bar (left orange tick) */}
      {isHover && !accent && !danger && (
        <div style={{
          position: 'absolute', left: 0, top: '20%', bottom: '20%', width: 2,
          background: theme.accent, borderRadius: 2,
        }} />
      )}
      {mascot && <SysterGlyph size={density.iconSize + 4} hover={isHover} />}
      {icon && !mascot && (
        <span style={{
          width: density.iconSize, height: density.iconSize, flexShrink: 0,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          color: 'currentColor', opacity: disabled ? 0.5 : (isHover ? 1 : 0.78),
        }}>{icon}</span>
      )}
      {swatch && (
        <span style={{
          width: density.iconSize - 2, height: density.iconSize - 2, borderRadius: 4,
          background: swatch, border: '.5px solid rgba(0,0,0,.2)', flexShrink: 0,
        }} />
      )}
      <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: '0 1 auto' }}>
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 450 }}>{label}</span>
        {sub && (
          <span style={{ fontSize: density.fs - 2, color: isHover && accent ? 'rgba(255,255,255,.75)' : theme.textDim, lineHeight: 1.2 }}>{sub}</span>
        )}
      </span>
      <span style={{ flex: 1 }} />
      {toggle != null && (
        <span style={{
          width: 26, height: 14, borderRadius: 999, position: 'relative',
          background: toggleOn ? theme.accent : theme.kbdBg, transition: 'background .12s',
          flexShrink: 0,
        }}>
          <span style={{
            position: 'absolute', top: 2, left: toggleOn ? 14 : 2, width: 10, height: 10,
            borderRadius: 999, background: '#fff', transition: 'left .15s cubic-bezier(.3,.7,.4,1)',
          }} />
        </span>
      )}
      {kbd && <KbdHint keys={kbd} theme={theme} density={density} />}
      {hasSubmenu && (
        <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="currentColor" strokeWidth="1.4" style={{ opacity: 0.55, marginLeft: 4, flexShrink: 0 }}>
          <path d="M2 1.5L6 4.5L2 7.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
}

// Tiny Sys.ter mascot — anthracite block w/ orange beret + green prompt arrow
function SysterGlyph({ size = 16, hover, beret = GNU.beret, body = GNU.signal, screen = GNU.anthracite }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0, transition: 'transform .2s' }}>
      {/* body */}
      <rect x="4" y="6" width="16" height="16" rx="2.5" fill={body} />
      {/* screen */}
      <rect x="6" y="8" width="12" height="12" rx="1.5" fill={screen} />
      {/* prompt arrow */}
      <path d="M9 12L11.5 14L9 16" stroke={GNU.shellWhite} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <line x1="12" y1="16.5" x2="14.5" y2="16.5" stroke={GNU.shellWhite} strokeWidth="1.4" strokeLinecap="round" />
      {/* beret */}
      <ellipse cx="12" cy="4" rx="5" ry="1.5" fill={beret} />
      <circle cx="14.5" cy="3.2" r="0.8" fill={beret} />
      {/* signal waves on hover */}
      {hover && (
        <g stroke={body} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.8">
          <path d="M21 8.5C22 9.5 22 11 21 12">
            <animate attributeName="opacity" values="0;1;0" dur="1.2s" repeatCount="indefinite" />
          </path>
        </g>
      )}
    </svg>
  );
}

// Common stroke icons (Lucide-ish, 1.6px)
const I = {
  wallpaper: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="m3 14 5-5 5 5"/><path d="m13 12 3-3 5 5"/><circle cx="8" cy="9" r="1"/></svg>,
  layout:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 12h18M12 3v18"/></svg>,
  add:       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%"><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></svg>,
  widget:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%"><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/></svg>,
  refresh:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%"><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/></svg>,
  terminal:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 9 3 3-3 3M13 15h4"/></svg>,
  settings:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>,
  pin:       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%"><path d="m12 17 .3 4M5 9l4-1 5-5 5 5-5 5-1 4-8-8z"/></svg>,
  trash:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>,
  copy:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>,
  move:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%"><path d="M5 9 2 12l3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20"/></svg>,
  resize:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%"><path d="M21 8V3h-5M3 16v5h5M21 3l-7 7M10 14l-7 7"/></svg>,
  tile:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%"><rect x="3" y="3" width="8" height="18" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/></svg>,
  float:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%"><rect x="6" y="6" width="14" height="12" rx="1.5"/><rect x="3" y="3" width="10" height="8" rx="1.5" opacity=".5"/></svg>,
  fullscreen:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%"><path d="M3 8V3h5M21 8V3h-5M3 16v5h5M21 16v5h-5"/></svg>,
  workspace: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%"><rect x="3" y="4" width="6" height="6" rx="1"/><rect x="11" y="4" width="6" height="6" rx="1"/><rect x="3" y="14" width="6" height="6" rx="1"/><rect x="11" y="14" width="6" height="6" rx="1"/></svg>,
  close:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%"><path d="M5 5l14 14M19 5L5 19"/></svg>,
  info:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%"><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/></svg>,
  paint:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%"><path d="M19 11h2v3a4 4 0 0 1-4 4h-1v2a2 2 0 0 1-4 0v-4h6V11zM3 5a2 2 0 0 1 2-2h12v8H5a2 2 0 0 1-2-2V5z"/></svg>,
  motion:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%"><path d="M3 12c4-8 14-8 18 0M3 12c4 8 14 8 18 0"/></svg>,
  shape:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%"><path d="m12 2 9 5v10l-9 5-9-5V7l9-5z"/></svg>,
  shader:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a13 13 0 0 1 0 18M12 3a13 13 0 0 0 0 18"/></svg>,
  audio:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%"><path d="M11 4 6 9H3v6h3l5 5V4zM15 9a3 3 0 0 1 0 6M18 6a8 8 0 0 1 0 12"/></svg>,
  network:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%"><path d="M5 12.5a10 10 0 0 1 14 0M8 16a6 6 0 0 1 8 0M11 19h2"/></svg>,
  bluetooth: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%"><path d="M7 7l10 10-5 5V2l5 5L7 17"/></svg>,
  power:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%"><path d="M12 2v10M5 7a9 9 0 1 0 14 0"/></svg>,
  bell:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9zM10 21a2 2 0 0 0 4 0"/></svg>,
  search:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%"><circle cx="11" cy="11" r="7"/><path d="m20 20-4.3-4.3"/></svg>,
};

// Search row at the top of menus.
function MenuSearch({ theme, density, value, onChange, placeholder = 'Search…' }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8, padding: `4px ${density.rowPx}px`,
      borderBottom: `.5px solid ${theme.border}`, marginBottom: 4,
    }}>
      <span style={{ width: density.iconSize, height: density.iconSize, color: theme.textDim }}>{I.search}</span>
      <input
        value={value || ''} onChange={(e) => onChange?.(e.target.value)} placeholder={placeholder}
        style={{
          flex: 1, border: 'none', background: 'transparent', outline: 'none',
          color: theme.text, fontSize: density.fs, fontFamily: 'inherit', height: density.rowH - 4,
        }}
      />
      <span style={{
        fontSize: density.kbdFs, fontFamily: 'ui-monospace, monospace',
        padding: '1px 5px', borderRadius: 3,
        background: theme.kbdBg, border: `.5px solid ${theme.kbdBorder}`, color: theme.textFaint,
      }}>⌘K</span>
    </div>
  );
}

Object.assign(window, {
  GNU, gnuTheme, gnuShape, gnuDensity,
  MenuShell, MenuSection, MenuSeparator, MenuRow, KbdHint, MenuSearch,
  DitherBg, GrainBg, EdgeRefraction, MaskReveal, ParticleBurst,
  SysterGlyph, MenuIcons: I,
  FitScale,
});

// FitScale — render `children` at logical (w × h) then transform-scale to fit
// the parent container (which is typically the artboard, sized via DCArtboard).
// Letterboxes via the `background` prop. Lets us bump all artboards to 1280×720
// without rewriting every menu's pixel-positioning.
function FitScale({ w, h, children, background = 'transparent', anchor = 'center' }) {
  const ref = React.useRef(null);
  const [s, setS] = React.useState(1);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      setS(Math.min(r.width / w, r.height / h));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [w, h]);
  return (
    <div ref={ref} style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      background, display: 'flex',
      alignItems: anchor === 'top' ? 'flex-start' : 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        width: w, height: h,
        transform: `scale(${s})`,
        transformOrigin: anchor === 'top' ? 'top center' : 'center center',
        flexShrink: 0,
      }}>{children}</div>
    </div>
  );
}


// menu-scenes.jsx
// Desktop backdrops the menus appear over, plus the menu compositions.

// ── Desktop backdrop ───────────────────────────────────────────────
function DesktopBg({ theme, dim = 0.55, children, style }) {
  // Animated subtle gradient + tiling, evokes Wayland compositor wallpaper.
  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      background: theme.mode === 'dark'
        ? 'radial-gradient(120% 80% at 30% 30%, #1A1F26 0%, #0B0D10 60%, #07090B 100%)'
        : 'radial-gradient(120% 80% at 30% 30%, #FBF7EE 0%, #EFEAE0 60%, #E5DFD2 100%)',
      ...style,
    }}>
      {/* slow-moving conic gradient as compositor "shader" */}
      <div style={{
        position: 'absolute', inset: '-20%',
        background: theme.mode === 'dark'
          ? `conic-gradient(from 0deg at 50% 50%, ${theme.accent}10, transparent 30%, ${GNU.beret}14 60%, transparent 80%, ${theme.accent}08)`
          : `conic-gradient(from 0deg at 50% 50%, ${theme.accent}18, transparent 30%, ${GNU.beret}22 60%, transparent 80%, ${theme.accent}10)`,
        filter: 'blur(40px)', opacity: dim,
      }} />
      {/* topbar sliver */}
      <div style={{
        position: 'absolute', top: 8, left: 8, right: 8, height: 22,
        borderRadius: 11, background: theme.mode === 'dark' ? 'rgba(17,20,24,.7)' : 'rgba(247,243,237,.85)',
        backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center',
        padding: '0 10px', gap: 8, fontSize: 10, color: theme.textDim,
        border: `.5px solid ${theme.border}`, fontFamily: 'ui-sans-serif, system-ui, sans-serif',
      }}>
        <SysterGlyph size={12} />
        <span style={{ fontWeight: 600, color: theme.text, letterSpacing: '-0.01em' }}>Gnu.In</span>
        <span style={{ opacity: 0.5 }}>·</span>
        <span>workspace 2/6</span>
        <span style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ width: 5, height: 5, borderRadius: 5, background: theme.green }} />
          <span>14:32</span>
        </span>
      </div>
      {children}
    </div>
  );
}

// A floating widget on the desktop (clock, system stats, etc.)
function DesktopWidget({ theme, x, y, w, h, kind, focused, label }) {
  return (
    <div style={{
      position: 'absolute', left: x, top: y, width: w, height: h,
      borderRadius: 10, background: theme.mode === 'dark' ? 'rgba(20,24,29,.85)' : 'rgba(255,255,255,.85)',
      backdropFilter: 'blur(20px)', border: focused ? `1.5px solid ${theme.accent}` : `.5px solid ${theme.border}`,
      boxShadow: focused ? `0 0 0 4px ${theme.accent}33, 0 8px 24px rgba(0,0,0,.18)` : '0 4px 16px rgba(0,0,0,.1)',
      padding: 10, color: theme.text, fontFamily: 'ui-sans-serif, system-ui, sans-serif',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {kind === 'clock' && (
        <>
          <div style={{ fontSize: 9, color: theme.textDim, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>Mardi 28 avril</div>
          <div style={{ fontSize: 32, fontWeight: 600, lineHeight: 1, marginTop: 4, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>14:32</div>
          <div style={{ fontSize: 9, color: theme.accent, marginTop: 'auto', fontWeight: 600 }}>{label || 'CLOCK'}</div>
        </>
      )}
      {kind === 'stats' && (
        <>
          <div style={{ fontSize: 9, color: theme.textDim, letterSpacing: '0.1em', fontWeight: 600 }}>SYSTEM</div>
          <div style={{ display: 'flex', gap: 4, marginTop: 6, height: 20, alignItems: 'flex-end' }}>
            {[0.4, 0.7, 0.3, 0.9, 0.5, 0.6, 0.8, 0.2].map((v, i) => (
              <div key={i} style={{ flex: 1, height: `${v * 100}%`, background: theme.accent, opacity: 0.4 + v * 0.6, borderRadius: 1 }} />
            ))}
          </div>
          <div style={{ fontSize: 10, marginTop: 6, fontWeight: 500 }}>CPU 34%</div>
          <div style={{ fontSize: 9, color: theme.textDim }}>RAM 8.2/16 GB</div>
        </>
      )}
      {kind === 'note' && (
        <>
          <div style={{ fontSize: 9, color: theme.green, letterSpacing: '0.1em', fontWeight: 600 }}>NOTE.MD</div>
          <div style={{ fontSize: 10, lineHeight: 1.4, marginTop: 4, color: theme.textDim }}>
            — review menu shapes<br/>— ask about touch densities<br/>— ship by friday
          </div>
        </>
      )}
    </div>
  );
}

// A floating window (for the window/client menu).
function DesktopWindow({ theme, x, y, w, h, title, focused }) {
  return (
    <div style={{
      position: 'absolute', left: x, top: y, width: w, height: h,
      borderRadius: 8, background: theme.mode === 'dark' ? '#1B1F24' : '#FFFFFF',
      border: focused ? `1.5px solid ${theme.accent}` : `.5px solid ${theme.border}`,
      boxShadow: focused ? `0 0 0 4px ${theme.accent}26, 0 12px 32px rgba(0,0,0,.25)` : '0 6px 20px rgba(0,0,0,.15)',
      overflow: 'hidden', fontFamily: 'ui-sans-serif, system-ui, sans-serif',
    }}>
      <div style={{
        height: 22, background: theme.mode === 'dark' ? '#15181C' : '#F2EEE6',
        borderBottom: `.5px solid ${theme.border}`, display: 'flex', alignItems: 'center',
        padding: '0 8px', gap: 6, fontSize: 9, color: theme.textDim,
      }}>
        <span style={{ width: 8, height: 8, borderRadius: 4, background: '#FF5F57' }} />
        <span style={{ width: 8, height: 8, borderRadius: 4, background: '#FFBD2E' }} />
        <span style={{ width: 8, height: 8, borderRadius: 4, background: '#28C940' }} />
        <span style={{ marginLeft: 8, fontWeight: 500, color: theme.text }}>{title}</span>
      </div>
      <div style={{ padding: 8, fontSize: 9, color: theme.textDim, lineHeight: 1.5 }}>
        <div style={{ width: '60%', height: 6, background: theme.border, borderRadius: 3, marginBottom: 5 }} />
        <div style={{ width: '90%', height: 6, background: theme.border, borderRadius: 3, marginBottom: 5 }} />
        <div style={{ width: '40%', height: 6, background: theme.border, borderRadius: 3, marginBottom: 5 }} />
        <div style={{ width: '75%', height: 6, background: theme.border, borderRadius: 3 }} />
      </div>
    </div>
  );
}

// Cursor glyph.
function Cursor({ x, y, theme }) {
  return (
    <svg style={{ position: 'absolute', left: x - 2, top: y - 2, pointerEvents: 'none', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,.4))', zIndex: 9 }} width="18" height="22" viewBox="0 0 18 22">
      <path d="M2 1 L2 17 L6.5 13 L9 18 L12 16.5 L9.5 11.5 L15 11 Z" fill={theme.mode === 'dark' ? '#fff' : '#000'} stroke={theme.mode === 'dark' ? '#000' : '#fff'} strokeWidth="1" strokeLinejoin="round"/>
    </svg>
  );
}

// Topbar tray icon row (for system tray menu artboard).
function TrayBar({ theme, focusKey }) {
  const items = [
    { k: 'audio', icon: MenuIcons.audio },
    { k: 'network', icon: MenuIcons.network },
    { k: 'bluetooth', icon: MenuIcons.bluetooth },
    { k: 'bell', icon: MenuIcons.bell },
    { k: 'power', icon: MenuIcons.power },
  ];
  return (
    <div style={{
      position: 'absolute', top: 8, right: 8, height: 22, padding: '0 6px',
      borderRadius: 11, background: theme.mode === 'dark' ? 'rgba(17,20,24,.7)' : 'rgba(247,243,237,.85)',
      backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', gap: 4,
      border: `.5px solid ${theme.border}`,
    }}>
      {items.map((it) => (
        <span key={it.k} style={{
          width: 14, height: 14, color: it.k === focusKey ? theme.accent : theme.textDim,
          display: 'inline-flex',
          background: it.k === focusKey ? theme.accentDim : 'transparent',
          borderRadius: 4, padding: 1,
        }}>{it.icon}</span>
      ))}
    </div>
  );
}

Object.assign(window, { DesktopBg, DesktopWidget, DesktopWindow, Cursor, TrayBar });


// molecule-renderer.jsx
// The GENERIC, data-driven renderer: one component that turns a molecule_specs.json
// record into a live menu — no bespoke per-molecule code. Hydrates the gallery AND
// (via the same data) maps onto the engine's reduce() → Scene. Depends on the menu
// primitives being loaded as window globals (MenuShell / MenuRow / MenuSection /
// MenuSeparator / MenuSearch / gnuShape / gnuDensity / MenuIcons / SysterGlyph).
//
// FULL COVERAGE: every layout strategy in molecule_specs.json renders from data —
//   panel family   · panel · panel-header · panel-search · panel-fileheader · panel-right · command-palette · card
//   radial family  · radial · radial-detached · radial-then-pills · radial-mode-pills · concentric-rings
//   flex/grid      · pills · compact-bar · swatch-grid · target-grid · transport
//   structural     · tile-grid · mega-columns · cascade · drill-in-place · fractal-cascade · bubble-tree
// No bespoke per-molecule code — only the data record drives the geometry.

function MoleculeRenderer({ m, theme, dpref }) {
  const h = React.createElement;
  const shape = window.gnuShape('rounded');
  const d = window.gnuDensity(dpref || m.density || 'mouse');
  const Icons = window.MenuIcons || {};
  const mm = m.model || {};
  const L = m.layout || '';
  const width = (m.density === 'touch' || dpref === 'touch') ? 280 : 244;

  const Row = (r, i) => h(window.MenuRow, {
    key: r.id || i, theme, shape, density: d,
    icon: r.kind === 'mascot' ? undefined : (r.icon ? Icons[r.icon] : undefined),
    mascot: r.kind === 'mascot' || undefined, swatch: r.swatch,
    label: r.label, sub: r.sub, kbd: r.kbd,
    accent: r.accent, danger: r.danger,
    hasSubmenu: r.kind === 'submenu' || undefined,
    toggle: r.kind === 'toggle' ? true : undefined, toggleOn: r.on,
    hovered: i === 0,
  });
  const Group = (g, gi, groups) => h(React.Fragment, { key: 'g' + gi },
    h(window.MenuSection, { label: g.head || undefined, theme, density: d }, (g.rows || []).map(Row)),
    gi < groups.length - 1 ? h(window.MenuSeparator, { theme }) : null);

  // ── shared panel pieces ──
  const headerEl = (hd) => {
    const top = h('div', { style: { display: 'flex', alignItems: 'center', gap: 9 } },
      hd.mascot ? h(window.SysterGlyph, { size: 20, hover: true })
        : hd.icon ? h('span', { style: { width: 18, height: 18, color: theme.accent } }, Icons[hd.icon]) : null,
      h('div', { style: { minWidth: 0, flex: 1 } },
        h('div', { style: { fontSize: 12.5, fontWeight: 600 } }, hd.title || hd.name),
        (hd.sub || hd.meta) ? h('div', { style: { fontSize: 10, color: theme.textDim, fontFamily: 'ui-monospace,monospace' } }, hd.sub || hd.meta) : null),
      hd.badge ? h('span', { style: { fontSize: 9, padding: '2px 6px', borderRadius: 999, background: 'rgba(0,0,0,.22)', color: theme.text } }, hd.badge)
        : hd.toggle ? h('div', { style: { width: 30, height: 17, borderRadius: 999, background: theme.accent, position: 'relative', flexShrink: 0 } }, h('div', { style: { position: 'absolute', top: 2, right: 2, width: 13, height: 13, borderRadius: '50%', background: '#fff' } }))
          : hd.status ? h('span', { style: { width: 8, height: 8, borderRadius: '50%', background: theme.green, flexShrink: 0 } }) : null);
    const slider = (typeof hd.slider === 'number') ? h('div', { style: { marginTop: 9, height: 5, background: theme.kbdBg, borderRadius: 3, position: 'relative' } },
      h('div', { style: { position: 'absolute', inset: 0, right: (100 - hd.slider * 100) + '%', background: theme.accent, borderRadius: 3 } })) : null;
    return h('div', { key: 'hd', style: { padding: '10px 12px', borderBottom: `.5px solid ${theme.border}` } }, top, slider);
  };
  const previewEl = (pv) => h('div', { key: 'pv', style: { padding: 12, borderBottom: `.5px solid ${theme.border}` } },
    h('div', { style: { height: 60, borderRadius: 8, background: `linear-gradient(135deg,${theme.accent},${theme.green})`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8, boxShadow: '0 4px 12px rgba(0,0,0,.25)' } },
      h('span', { style: { width: 22, height: 22, color: '#fff', opacity: .9 } }, Icons.widget || Icons.settings || null)),
    h('div', { style: { fontSize: 12.5, fontWeight: 600 } }, pv.title),
    h('div', { style: { fontSize: 10, color: theme.textDim, fontFamily: 'ui-monospace,monospace' } }, pv.meta),
    pv.slider ? h('div', { style: { marginTop: 8, display: 'flex', alignItems: 'center', gap: 7 } },
      h('span', { style: { fontSize: 9, color: theme.textFaint, fontFamily: 'ui-monospace,monospace' } }, pv.slider),
      h('div', { style: { flex: 1, height: 4, background: theme.kbdBg, borderRadius: 2 } }, h('div', { style: { width: '55%', height: '100%', background: theme.accent, borderRadius: 2 } }))) : null);
  const footerEl = () => h('div', { key: 'ft', style: { padding: '6px 10px 2px', display: 'flex', gap: 12, fontSize: 9, color: theme.textFaint, fontFamily: 'ui-monospace,monospace' } },
    h('span', null, '↑↓ naviguer'), h('span', null, '⏎ ouvrir'), h('span', { style: { marginLeft: 'auto' } }, 'esc'));
  const shell = (parts, w) => h(window.MenuShell, { theme, shape, density: d, width: w || width, origin: { x: 14, y: 14 }, label: m.family ? m.family.toUpperCase() : undefined }, parts);

  // ── PANEL family ──
  if (['panel', 'panel-header', 'panel-search', 'panel-fileheader', 'panel-right', 'command-palette', 'card'].indexOf(L) >= 0) {
    const parts = [];
    if (mm.preview) parts.push(previewEl(mm.preview));
    if (mm.header) parts.push(headerEl(mm.header));
    if (mm.search != null) parts.push(h(window.MenuSearch, { key: 'srch', theme, density: d, value: typeof mm.search === 'string' ? mm.search : '', placeholder: typeof mm.search === 'string' ? mm.search : 'Search…' }));
    (mm.groups || []).forEach((g, gi, arr) => parts.push(Group(g, gi, arr)));
    if (L === 'command-palette') parts.push(footerEl());
    return shell(parts, L === 'panel-right' ? 250 : width);
  }

  // ── RADIAL family — real ring geometry ──
  if (['radial', 'radial-detached', 'radial-then-pills', 'radial-mode-pills', 'concentric-rings'].indexOf(L) >= 0) {
    const ring = mm.ring || mm.discs || mm.modes || mm.inner || [];
    const n = ring.length || 1, R = 86, cx = 130, cy = 130;
    return h('div', { style: { position: 'relative', width: 260, height: 260 } },
      h('div', { style: { position: 'absolute', left: cx - R - 12, top: cy - R - 12, width: (R + 12) * 2, height: (R + 12) * 2, borderRadius: '50%', background: theme.mode === 'dark' ? 'rgba(17,20,24,.55)' : 'rgba(255,255,255,.45)', border: `.5px solid ${theme.border}`, boxShadow: theme.shadow } }),
      ring.map((it, i) => {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2, x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R, first = i === 0;
        return h('div', { key: i, style: { position: 'absolute', left: x - 22, top: y - 22, width: 44, height: 44, borderRadius: '50%', background: first ? theme.accent : theme.surface, border: `.5px solid ${first ? theme.accent : theme.border}`, color: first ? '#fff' : theme.text, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: first ? `0 6px 16px ${theme.accent}55` : '0 4px 10px rgba(0,0,0,.2)' } },
          h('span', { style: { width: 18, height: 18 } }, it.icon ? Icons[it.icon] : null));
      }),
      h('div', { style: { position: 'absolute', left: cx - 26, top: cy - 26, width: 52, height: 52, borderRadius: '50%', background: theme.surface, border: `.5px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,.25)' } },
        h(window.SysterGlyph, { size: 26, hover: true })));
  }

  // ── SWATCH grid (+ groups) ──
  if (L === 'swatch-grid') {
    const sw = mm.swatches || [];
    const grid = h('div', { key: 'sw', style: { padding: '4px 8px 8px' } },
      h('div', { style: { fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: theme.textFaint, fontWeight: 600, marginBottom: 8 } }, 'Palette'),
      h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 7 } },
        sw.map((c, i) => h('div', { key: i, style: { aspectRatio: '1', borderRadius: 7, background: c, border: i === 0 ? `2px solid ${theme.text}` : `.5px solid ${theme.border}`, boxShadow: i === 0 ? `0 0 0 3px ${theme.accent}44` : 'none' } }))));
    const parts = [grid, h(window.MenuSeparator, { key: 'sep', theme })];
    (mm.groups || []).forEach((g, gi, arr) => parts.push(Group(g, gi, arr)));
    return shell(parts, 232);
  }

  // ── TARGET grid (share sheet) ──
  if (L === 'target-grid') {
    const targets = mm.targets || [];
    const cols = ['#FF6A00', '#3D8DCC', '#5FAF8C', theme.green, '#9B8DCC', '#CE8E3F'];
    const grid = h('div', { key: 'tg' },
      mm.title ? h('div', { style: { padding: '6px 6px 4px', fontSize: 11, fontWeight: 600 } }, mm.title) : null,
      h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, padding: 6 } },
        targets.map((t, i) => h('div', { key: t.id || i, style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '10px 4px', borderRadius: 10, background: i === 0 ? theme.hover : 'transparent' } },
          h('div', { style: { width: 42, height: 42, borderRadius: '50%', background: i === 0 ? cols[i % cols.length] : theme.kbdBg, color: i === 0 ? '#fff' : cols[i % cols.length], display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: i === 0 ? `0 6px 14px ${cols[i % cols.length]}55` : 'none' } },
            h('span', { style: { width: 19, height: 19 } }, t.icon ? Icons[t.icon] : null)),
          h('span', { style: { fontSize: 9.5, color: theme.textDim, fontWeight: 500, textAlign: 'center' } }, t.label || t.id)))));
    return shell([grid], 256);
  }

  // ── TRANSPORT (media) ──
  if (L === 'transport') {
    const tk = mm.track || {};
    return h('div', { style: { width: 250, background: theme.surface, borderRadius: shape.menuRadius, boxShadow: theme.shadow, border: `.5px solid ${theme.border}`, overflow: 'hidden', color: theme.text, fontFamily: 'ui-sans-serif,system-ui,sans-serif', padding: 12 } },
      h('div', { style: { display: 'flex', gap: 11, alignItems: 'center' } },
        h('div', { style: { width: 52, height: 52, borderRadius: 8, background: `linear-gradient(135deg,${theme.accent},${theme.green})`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,.3)' } },
          h('span', { style: { width: 22, height: 22, color: '#fff', opacity: .9 } }, Icons.audio || null)),
        h('div', { style: { minWidth: 0 } },
          h('div', { style: { fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, tk.title),
          h('div', { style: { fontSize: 11, color: theme.textDim } }, tk.artist))),
      h('div', { style: { marginTop: 11, display: 'flex', alignItems: 'center', gap: 7 } },
        h('span', { style: { fontSize: 9, fontVariantNumeric: 'tabular-nums', color: theme.textDim } }, tk.pos),
        h('div', { style: { flex: 1, height: 4, background: theme.kbdBg, borderRadius: 2, position: 'relative' } },
          h('div', { style: { position: 'absolute', inset: 0, right: (100 - (tk.progress || 0) * 100) + '%', background: theme.accent, borderRadius: 2 } }),
          h('div', { style: { position: 'absolute', left: ((tk.progress || 0) * 100) + '%', top: -3, width: 10, height: 10, borderRadius: 5, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.3)', transform: 'translateX(-5px)' } })),
        h('span', { style: { fontSize: 9, fontVariantNumeric: 'tabular-nums', color: theme.textDim } }, tk.len)),
      h('div', { style: { marginTop: 11, display: 'flex', justifyContent: 'center', gap: 10 } },
        (mm.transport || []).map((k, i) => {
          const big = k === 'play';
          return h('div', { key: k, style: { width: big ? 44 : 36, height: big ? 44 : 36, borderRadius: '50%', background: big ? theme.accent : 'transparent', border: big ? 'none' : `.5px solid ${theme.border}`, color: big ? '#fff' : theme.text, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: big ? 16 : 13, boxShadow: big ? `0 4px 12px ${theme.accent}55` : 'none' } }, k === 'prev' ? '⏮' : k === 'next' ? '⏭' : '▶');
        })));
  }

  // ── PILLS / COMPACT-BAR ──
  if (['pills', 'compact-bar'].indexOf(L) >= 0) {
    const chips = mm.pills || mm.bar || [];
    return h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 7, width: 224, justifyContent: L === 'compact-bar' ? 'flex-start' : 'center' } },
      chips.map((it, i) => h('div', { key: it.id || i, style: { display: 'flex', alignItems: 'center', gap: 7, padding: '7px 13px', borderRadius: 999, background: i === 0 ? (it.danger ? '#FF5040' : theme.accent) : theme.surface, color: i === 0 ? '#fff' : (it.danger ? '#FF5040' : theme.text), border: `.5px solid ${theme.border}`, fontSize: 11.5, fontWeight: 600, boxShadow: '0 2px 6px rgba(0,0,0,.12)' } },
        it.icon ? h('span', { style: { width: 14, height: 14 } }, Icons[it.icon]) : null, h('span', null, it.label || it.id))));
  }

  // ── TILE-GRID diagram (+ rows) ──
  if (L === 'tile-grid') {
    const tiles = mm.tiles || [];
    const diagram = h('div', { key: 'tg', style: { padding: 10, borderBottom: `.5px solid ${theme.border}` } },
      h('div', { style: { position: 'relative', width: '100%', aspectRatio: '16/10', borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.kbdBg, overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 3, padding: 3 } },
        tiles.slice(0, 6).map((t, i) => h('div', { key: i, style: { borderRadius: 4, background: i === 0 ? theme.accent : theme.surface, border: `.5px solid ${theme.border}`, gridColumn: i === 0 ? '1 / 2' : i === 1 ? '2 / 3' : undefined, gridRow: i < 2 ? '1 / 3' : undefined, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7.5, color: i === 0 ? '#fff' : theme.textDim, fontFamily: 'ui-monospace,monospace' } }, t))));
    const parts = [diagram];
    (mm.groups || []).forEach((g, gi, arr) => parts.push(Group(g, gi, arr)));
    return shell(parts, 248);
  }

  // ── MEGA-COLUMNS ──
  if (L === 'mega-columns') {
    const cols = mm.columns || [];
    return h('div', { style: { display: 'flex', background: theme.surface, borderRadius: shape.menuRadius, boxShadow: theme.shadow, border: `.5px solid ${theme.border}`, overflow: 'hidden', color: theme.text, fontFamily: 'ui-sans-serif,system-ui,sans-serif' } },
      cols.map((col, ci) => h('div', { key: ci, style: { padding: '10px 12px', borderRight: ci < cols.length - 1 ? `.5px solid ${theme.border}` : 'none', minWidth: 96 } },
        h('div', { style: { fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: theme.textFaint, fontWeight: 600, marginBottom: 8 } }, col.head),
        (col.rows || []).map((r, ri) => h('div', { key: ri, style: { fontSize: 12, padding: '5px 8px', borderRadius: 6, marginBottom: 2, background: ci === 0 && ri === 0 ? theme.accent : 'transparent', color: ci === 0 && ri === 0 ? '#fff' : theme.text, cursor: 'pointer' } }, r)))));
  }

  // ── CASCADE (panel + peeked submenu) ──
  if (L === 'cascade') {
    const groups = mm.groups || [];
    const subKey = mm.sub ? Object.keys(mm.sub)[0] : null;
    const subItems = subKey ? mm.sub[subKey] : [];
    return h('div', { style: { position: 'relative', width: 360, height: 250 } },
      h('div', { style: { position: 'absolute', left: 0, top: 0, width: 200 } }, shell(groups.map((g, gi, arr) => Group(g, gi, arr)), 200)),
      subItems.length ? h('div', { style: { position: 'absolute', left: 186, top: 44, width: 150, background: theme.surface, borderRadius: shape.menuRadius, boxShadow: theme.shadow, border: `.5px solid ${theme.border}`, padding: shape.pad, color: theme.text, fontFamily: 'ui-sans-serif,system-ui,sans-serif' } },
        subItems.map((s, i) => h('div', { key: i, style: { fontSize: 12, padding: '6px 9px', borderRadius: 6, background: i === 0 ? theme.accent : 'transparent', color: i === 0 ? '#fff' : theme.text } }, s))) : null);
  }

  // ── DRILL-IN-PLACE (breadcrumb + leaves) ──
  if (L === 'drill-in-place') {
    const stack = mm.stack || [];
    const leaves = ['Beret', 'Signal', 'Anthracite', 'Shell', 'Custom…'];
    const crumb = h('div', { key: 'cr', style: { display: 'flex', alignItems: 'center', gap: 5, padding: '9px 11px', borderBottom: `.5px solid ${theme.border}`, fontSize: 11 } },
      mm.back ? h('span', { style: { width: 15, height: 15, color: theme.accent, marginRight: 2 } }, Icons.back || '‹') : null,
      stack.map((s, i) => h(React.Fragment, { key: i },
        i > 0 ? h('span', { style: { color: theme.textFaint, fontSize: 10 } }, '›') : null,
        h('span', { style: { fontWeight: i === stack.length - 1 ? 600 : 400, color: i === stack.length - 1 ? theme.text : theme.textDim } }, s))));
    const rows = h('div', { key: 'rw', style: { padding: shape.pad } }, leaves.map((lf, i) => h(window.MenuRow, { key: i, theme, shape, density: d, label: lf, swatch: i < 4 ? [theme.green, theme.accent, '#111418', '#F7F3ED'][i] : undefined, hovered: i === 0 })));
    return h('div', { style: { width: 220, background: theme.surface, borderRadius: shape.menuRadius, boxShadow: theme.shadow, border: `.5px solid ${theme.border}`, overflow: 'hidden', color: theme.text, fontFamily: 'ui-sans-serif,system-ui,sans-serif' } }, crumb, rows);
  }

  // ── FRACTAL-CASCADE (nested scaled/tilted panels) ──
  if (L === 'fractal-cascade') {
    const lvl = mm.levels || 3, scale = mm.scale || 0.82, tilt = mm.tilt_deg || [0, 4, 8], L1 = mm.L1 || [];
    const ghosts = [];
    for (let i = lvl - 1; i >= 1; i--) {
      ghosts.push(h('div', { key: 'gh' + i, style: { position: 'absolute', left: 20 + i * 26, top: 14 + i * 18, width: 190, transformOrigin: 'top left', transform: `scale(${Math.pow(scale, i)}) rotate(${tilt[i] || 0}deg)`, opacity: 0.4 - i * 0.1, background: theme.surface, borderRadius: shape.menuRadius, border: `.5px solid ${theme.border}`, boxShadow: theme.shadow, padding: shape.pad } },
        L1.map((r, ri) => h('div', { key: ri, style: { fontSize: 12, padding: '6px 9px', color: theme.textDim } }, r))));
    }
    const front = h('div', { key: 'front', style: { position: 'absolute', left: 14, top: 8, width: 190, background: theme.surface, borderRadius: shape.menuRadius, border: `.5px solid ${theme.border}`, boxShadow: theme.shadow, padding: shape.pad, color: theme.text, fontFamily: 'ui-sans-serif,system-ui,sans-serif' } },
      L1.map((r, ri) => h(window.MenuRow, { key: ri, theme, shape, density: d, label: r, hasSubmenu: true, hovered: ri === 0 })));
    return h('div', { style: { position: 'relative', width: 280, height: 230 } }, ghosts, front);
  }

  // ── BUBBLE-TREE (root + branches + leaves + connectors) ──
  if (L === 'bubble-tree') {
    const branches = mm.branches || [];
    const rootX = 46, rootY = 125, bx = 150, n = branches.length;
    const by = (i) => 30 + i * ((220 - 60) / Math.max(1, n - 1));
    return h('div', { style: { position: 'relative', width: 360, height: 250 } },
      h('svg', { style: { position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' } },
        branches.map((b, i) => h('path', { key: i, d: `M ${rootX + 22} ${rootY} C ${rootX + 70} ${rootY}, ${bx - 40} ${by(i) + 16}, ${bx} ${by(i) + 16}`, fill: 'none', stroke: i === 0 ? theme.accent : theme.border, strokeWidth: i === 0 ? 2 : 1 }))),
      h('div', { style: { position: 'absolute', left: rootX - 22, top: rootY - 22, width: 44, height: 44, borderRadius: '50%', background: theme.surface, border: `1px solid ${theme.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 14px ${theme.accent}44` } }, h(window.SysterGlyph, { size: 24, hover: true })),
      branches.map((b, i) => h('div', { key: i, style: { position: 'absolute', left: bx, top: by(i), display: 'flex', alignItems: 'center', gap: 6 } },
        h('div', { style: { padding: '6px 12px', borderRadius: 999, background: i === 0 ? theme.accent : theme.surface, color: i === 0 ? '#fff' : theme.text, border: `.5px solid ${theme.border}`, fontSize: 11.5, fontWeight: 600, boxShadow: '0 2px 8px rgba(0,0,0,.18)' } }, b.label),
        i === 0 ? h('div', { style: { display: 'flex', gap: 4 } }, (b.leaves || []).slice(0, 3).map((lf, li) => h('span', { key: li, style: { fontSize: 9.5, padding: '3px 8px', borderRadius: 999, background: theme.kbdBg, color: theme.textDim, border: `.5px solid ${theme.border}` } }, lf))) : null)));
  }

  // ── fallback summary (should be unreachable — every layout is mapped) ──
  const items = mm.ring || mm.discs || mm.pills || mm.bar || mm.targets || mm.swatches || mm.branches || mm.modes || mm.inner || mm.L1 || mm.tiles || [];
  return h('div', { style: { background: theme.surface, border: `.5px solid ${theme.border}`, borderRadius: shape.menuRadius, boxShadow: theme.shadow, padding: 14, color: theme.text, fontFamily: 'ui-sans-serif,system-ui,sans-serif', width: 240 } },
    h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 } }, h(window.SysterGlyph, { size: 18, hover: true }), h('span', { style: { fontSize: 12, fontWeight: 600 } }, m.id)),
    h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 6 } }, items.map((it, i) => h('span', { key: i, style: { fontSize: 10.5, padding: '4px 9px', borderRadius: 999, background: i === 0 ? theme.accent : theme.kbdBg, color: i === 0 ? '#fff' : theme.text, border: `.5px solid ${theme.border}` } }, (typeof it === 'string' ? it : (it.label || it.id || it.name || ''))))),
    h('div', { style: { marginTop: 10, fontSize: 9, fontFamily: 'ui-monospace,monospace', color: theme.accent } }, `strategy: ${m.layout} · style ${m.style}${m.backed ? ' · blob' : ''}`));
}

Object.assign(window, { MoleculeRenderer });


/* ════════════ DATA GALLERY · every molecule rendered FROM molecule_specs.json ════════════ */
const MOLECULE_SPECS = {
  "spec": "molecule-specs",
  "role": "SINGLE SOURCE OF TRUTH for the 27 context-menu molecules, expressed as ENGINE SCENE-GRAPH COMPOSITIONS (not bespoke JSX). Each molecule is data the engine's reduce() lays out into a Scene the host paints. Central, the gallery, and the Rust host all consume THIS — killing the double-implementation (JSX preview + hand-built host).",
  "resolves": {
    "23_vs_27": "molecules and styles are ORTHOGONAL axes. The engine has 23 MenuStyle layout KINDS; a molecule is a COMPOSITION (style + MenuModel + density + motion). The 21 archetypes use 18 distinct styles; the 6 recipes reuse existing styles (list / trayaudio) with composed content — they are NOT new engine kinds. So '27 molecules over 23 styles' is consistent, not a contradiction.",
    "double_implementation": "a molecule = { style, layout, model{groups[rows]}, motion }. reduce(style, model) already emits MenuPanel + MenuRow nodes + (chrome) Blob. The renderer paints from tokens. No molecule needs bespoke render code — only this data."
  },
  "engine_styles": {
    "chrome_blob_backed": ["list", "brand", "trayaudio", "traynetwork", "traybluetooth", "traypower", "trayunified"],
    "bespoke_self_surfaced": ["bubble", "bubbletree", "radial", "radialpill", "nestedradialpill", "radialdetached", "concentric", "megapanel", "fractal", "drill", "cascade", "windowtilegrid", "widgetcard", "workspacecard", "widgetpills", "windowcompact"]
  },
  "row_kinds": ["item", "radio", "toggle", "slider", "tile", "swatch", "mascot", "separator", "submenu"],
  "motion_atoms": "open sequences reference port-data/motion.spec.json atoms (A.01 fade · A.02 scale · A.04 mask-reveal · A.07 origami · A.14 spring · pill-stagger 32ms)",
  "molecules": [
    { "id": "EmptySpaceStandard", "family": "empty", "style": "list", "layout": "panel", "backed": true, "density": "mouse",
      "model": { "groups": [
        { "head": "", "rows": [ {"id":"add-widget","kind":"submenu","icon":"add","label":"Add widget…","kbd":["⌘","⇧","W"]}, {"id":"layout","kind":"submenu","icon":"layout","label":"Layout preset"}, {"id":"wallpaper","kind":"item","icon":"wallpaper","label":"Change wallpaper","kbd":["⌘","B"]} ] },
        { "head": "Workspace", "rows": [ {"id":"new-ws","kind":"item","icon":"workspace","label":"New workspace","kbd":["⌘","N"]}, {"id":"tile","kind":"toggle","icon":"tile","label":"Tile mode","on":true} ] },
        { "head": "", "rows": [ {"id":"term","kind":"item","icon":"terminal","label":"Open terminal here","kbd":["⌘","T"]}, {"id":"settings","kind":"item","icon":"settings","label":"Shell settings","kbd":["⌘",","]} ] }
      ] }, "motion": ["A.04 mask", "A.02 scale", "A.01 fade"] },
    { "id": "EmptySpaceBranded", "family": "empty", "style": "brand", "layout": "panel-header", "backed": true, "density": "mouse",
      "model": { "header": {"title":"Gnu.In-Shell","sub":"DESKTOP · SLOT 0","badge":"v6.2","dither":true}, "groups": [
        { "head": "", "rows": [ {"id":"syster","kind":"mascot","label":"Summon assistant","sub":"Ask the shell anything","kbd":["⌘","K"],"accent":true} ] },
        { "head": "Compose", "rows": [ {"id":"add","kind":"submenu","icon":"add","label":"Add widget"}, {"id":"preset","kind":"submenu","icon":"layout","label":"Preset","sub":"Beret · Anthracite · Signal"}, {"id":"wp","kind":"submenu","icon":"wallpaper","label":"Wallpaper"} ] },
        { "head": "System", "rows": [ {"id":"term","kind":"item","icon":"terminal","label":"Terminal here","kbd":["⌘","T"]}, {"id":"reload","kind":"item","icon":"refresh","label":"Reload shell"} ] }
      ] }, "motion": ["A.04 mask", "A.06 dither-shift", "A.01 fade"] },
    { "id": "EmptySpaceRadial", "family": "empty", "style": "radial", "layout": "radial", "backed": false, "density": "touch",
      "model": { "hub": "mascot", "ring": [ {"id":"add","icon":"add","label":"Add"}, {"id":"layout","icon":"layout","label":"Layout"}, {"id":"wallpaper","icon":"wallpaper","label":"Wall"}, {"id":"term","icon":"terminal","label":"Term"}, {"id":"workspace","icon":"workspace","label":"Wksp"}, {"id":"settings","icon":"settings","label":"Set"} ] },
      "geometry": { "R": 100, "r": 38 }, "motion": ["A.02 scale", "slice-stagger"] },
    { "id": "WidgetInline", "family": "widget", "style": "list", "layout": "panel", "backed": true, "density": "mouse",
      "model": { "header": {"icon":"widget","title":"Clock","id":"0x4A2"}, "groups": [ { "head":"", "rows": [ {"id":"configure","kind":"item","icon":"settings","label":"Configure…","kbd":["⏎"]}, {"id":"move","kind":"item","icon":"move","label":"Move","kbd":["M"]}, {"id":"resize","kind":"item","icon":"resize","label":"Resize","kbd":["R"]}, {"id":"pin","kind":"toggle","icon":"pin","label":"Pin to all workspaces","on":false} ] }, { "head":"", "rows":[ {"id":"dup","kind":"item","icon":"copy","label":"Duplicate"}, {"id":"rm","kind":"item","icon":"trash","label":"Remove","kbd":["⌫"],"danger":true} ] } ] },
      "motion": ["A.04 mask", "A.01 fade"] },
    { "id": "WidgetCard", "family": "widget", "style": "widgetcard", "layout": "card", "backed": false, "density": "mouse",
      "model": { "preview": {"title":"System Stats","meta":"140 × 90 · workspace 2","slider":"SIZE M"}, "groups": [ { "head":"", "rows":[ {"id":"configure","kind":"submenu","icon":"settings","label":"Configure"}, {"id":"shape","kind":"submenu","icon":"shape","label":"Shape","sub":"Rounded · 8px"}, {"id":"bg","kind":"submenu","icon":"shader","label":"Background","sub":"Glass · 18px"}, {"id":"pin","kind":"toggle","icon":"pin","label":"Pin everywhere","on":true} ] }, { "head":"", "rows":[ {"id":"rm","kind":"item","icon":"trash","label":"Remove","kbd":["⌫"],"danger":true} ] } ] },
      "motion": ["A.04 mask", "A.03 lift"] },
    { "id": "WidgetPills", "family": "widget", "style": "widgetpills", "layout": "pills", "backed": false, "density": "touch",
      "model": { "pills": [ {"id":"configure","icon":"settings","label":"Configure"}, {"id":"move","icon":"move","label":"Move"}, {"id":"resize","icon":"resize","label":"Resize"}, {"id":"pin","icon":"pin","label":"Pin"}, {"id":"dup","icon":"copy","label":"Duplicate"}, {"id":"rm","icon":"trash","label":"Remove","danger":true} ] },
      "motion": ["pill-stagger 8ms", "A.12 magnetic"] },
    { "id": "WindowStandard", "family": "window", "style": "list", "layout": "panel", "backed": true, "density": "mouse",
      "model": { "groups": [ { "head":"", "rows":[ {"id":"tile","kind":"submenu","icon":"tile","label":"Tile","kbd":["⌘","T"]}, {"id":"float","kind":"toggle","icon":"float","label":"Float","on":true}, {"id":"full","kind":"item","icon":"fullscreen","label":"Fullscreen","kbd":["F"]} ] }, { "head":"Workspace", "rows":[ {"id":"send","kind":"submenu","icon":"workspace","label":"Send to…"}, {"id":"pin","kind":"item","icon":"pin","label":"Pin to all","sub":"Sticky across workspaces"} ] }, { "head":"", "rows":[ {"id":"info","kind":"item","icon":"info","label":"Window info","kbd":["⌘","I"]}, {"id":"close","kind":"item","icon":"close","label":"Close","kbd":["⌘","W"],"danger":true} ] } ] },
      "motion": ["A.04 mask", "A.01 fade"] },
    { "id": "WindowTileDiagram", "family": "window", "style": "windowtilegrid", "layout": "tile-grid", "backed": false, "density": "mouse",
      "model": { "tiles": ["left½","right½","top-l","top-r","bot-l","bot-r"], "groups": [ { "head":"", "rows":[ {"id":"float","kind":"toggle","icon":"float","label":"Float","on":false}, {"id":"full","kind":"item","icon":"fullscreen","label":"Fullscreen","kbd":["F"]}, {"id":"close","kind":"item","icon":"close","label":"Close","kbd":["⌘","W"],"danger":true} ] } ] },
      "motion": ["A.04 mask", "tile-hover"] },
    { "id": "WindowCompact", "family": "window", "style": "windowcompact", "layout": "compact-bar", "backed": false, "density": "mouse",
      "model": { "bar": [ {"id":"tile","icon":"tile","label":"Tile"}, {"id":"float","icon":"float","label":"Float"}, {"id":"full","icon":"fullscreen","label":"Full"}, {"id":"pin","icon":"pin","label":"Pin"}, {"id":"send","icon":"workspace","label":"Send"}, {"id":"close","icon":"close","label":"Close","danger":true} ] },
      "motion": ["A.04 mask-x", "A.12 magnetic"] },
    { "id": "NestedCascade", "family": "nested", "style": "cascade", "layout": "cascade", "backed": true, "density": "mouse",
      "model": { "depth": 3, "groups": [ { "head":"", "rows":[ {"id":"theme","kind":"submenu","icon":"paint","label":"Theme"}, {"id":"preset","kind":"submenu","icon":"layout","label":"Preset","sub":"Beret"}, {"id":"anim","kind":"submenu","icon":"motion","label":"Animation"}, {"id":"shape","kind":"submenu","icon":"shape","label":"Shape"} ] } ], "sub": {"preset": ["Beret","Signal","Anthracite","Shell","Custom…"]} },
      "motion": ["A.04 mask per level", "connector-arc"] },
    { "id": "NestedDrill", "family": "nested", "style": "drill", "layout": "drill-in-place", "backed": true, "density": "mouse",
      "model": { "stack": ["root","Theme","Beret"], "back": true }, "motion": ["A.03 slide-x", "crumb-fade"] },
    { "id": "NestedMegaPanel", "family": "nested", "style": "megapanel", "layout": "mega-columns", "backed": true, "density": "mouse",
      "model": { "columns": [ {"head":"Theme","rows":["Beret","Signal","Anthracite","Shell"]}, {"head":"Shape","rows":["Round","Sharp","Pill","Cut"]}, {"head":"Motion","rows":["Settle","Lift","Reveal","Idle"]} ] },
      "motion": ["A.04 mask", "column-stagger"] },
    { "id": "TrayAudio", "family": "tray", "style": "trayaudio", "layout": "panel-right", "backed": true, "density": "mouse",
      "model": { "header": {"icon":"audio","title":"Volume","slider":0.64}, "groups": [ { "head":"Output device", "rows":[ {"id":"out-int","kind":"radio","icon":"audio","label":"Internal speakers","sub":"default","on":true}, {"id":"out-hd","kind":"radio","icon":"bluetooth","label":"HD 660 S2","sub":"bt · 84%"}, {"id":"out-mon","kind":"radio","icon":"audio","label":"Studio Monitor","sub":"usb"} ] }, { "head":"", "rows":[ {"id":"set","kind":"item","icon":"settings","label":"Sound settings…"} ] } ] },
      "motion": ["A.04 mask", "A.01 fade"] },
    { "id": "TrayNetwork", "family": "tray", "style": "traynetwork", "layout": "panel-right", "backed": true, "density": "mouse",
      "model": { "header": {"icon":"network","title":"Wi-Fi","toggle":true}, "groups": [ { "head":"Networks", "rows":[ {"id":"hh","kind":"item","label":"home-honeycomb","sub":"WPA3","on":true,"signal":4}, {"id":"cf","kind":"item","label":"cafe.local","sub":"WPA2","signal":3}, {"id":"gn","kind":"item","label":"gnu.in/guest","sub":"open","signal":2} ] }, { "head":"", "rows":[ {"id":"other","kind":"item","icon":"add","label":"Other network…"}, {"id":"set","kind":"item","icon":"settings","label":"Network settings…"} ] } ] },
      "motion": ["A.04 mask", "A.01 fade"] },
    { "id": "TrayPower", "family": "tray", "style": "traypower", "layout": "panel-right", "backed": true, "density": "mouse",
      "model": { "header": {"mascot":true,"title":"m4ckenzie","sub":"uptime 3d 14h","status":"online"}, "groups": [ { "head":"", "rows":[ {"id":"lock","kind":"item","label":"Lock","kbd":["⌘","L"]}, {"id":"out","kind":"item","label":"Sign out"} ] }, { "head":"", "rows":[ {"id":"sleep","kind":"item","label":"Sleep","sub":"veille"}, {"id":"restart","kind":"item","icon":"refresh","label":"Restart"}, {"id":"off","kind":"item","icon":"power","label":"Shut down","danger":true} ] } ] },
      "motion": ["A.04 mask", "A.01 fade"] },
    { "id": "RadialDetached", "family": "experiment", "style": "radialdetached", "layout": "radial-detached", "backed": false, "density": "mouse",
      "model": { "hub": "mascot", "discs": [ {"id":"add","icon":"add","label":"Add"}, {"id":"paint","icon":"paint","label":"Theme"}, {"id":"wall","icon":"wallpaper","label":"Wallpaper"}, {"id":"term","icon":"terminal","label":"Terminal"}, {"id":"workspace","icon":"workspace","label":"Workspace"}, {"id":"set","icon":"settings","label":"Settings"} ] },
      "geometry": {"R": 96}, "motion": ["disc-swell", "tag-reveal"] },
    { "id": "NestedRadialPill", "family": "experiment", "style": "nestedradialpill", "layout": "radial-then-pills", "backed": false, "density": "mouse",
      "model": { "ring": [ {"id":"theme","icon":"paint","subs":["Beret","Signal","Anthracite","Shell"]}, {"id":"shape","icon":"shape","subs":["Round","Sharp","Pill","Cut"]}, {"id":"motion","icon":"motion","subs":["Settle","Lift","Reveal","Idle"]}, {"id":"layout","icon":"layout","subs":["Tile","Float","Stack"]}, {"id":"shader","icon":"shader","subs":["Dither","Grain","Refract"]} ] },
      "geometry": {"R": 88, "r": 34}, "motion": ["slice-hover", "pill-cascade 30ms"] },
    { "id": "NestedConcentric", "family": "experiment", "style": "concentric", "layout": "concentric-rings", "backed": false, "density": "mouse",
      "model": { "inner": [ {"id":"theme","icon":"paint","subs":["Beret","Signal","Anth","Shell"]}, {"id":"shape","icon":"shape","subs":["Round","Sharp","Pill","Cut"]}, {"id":"motion","icon":"motion","subs":["Settle","Lift","Reveal","Idle"]}, {"id":"shader","icon":"shader","subs":["Dither","Grain","Refract","Off"]} ] },
      "geometry": {"RIN": 64, "ROUT": 116, "hub": 28}, "motion": ["ring-expand"] },
    { "id": "NestedFractal", "family": "experiment", "style": "fractal", "layout": "fractal-cascade", "backed": true, "density": "mouse",
      "model": { "levels": 3, "scale": 0.82, "tilt_deg": [0,4,8], "L1": ["Theme","Shape","Motion","Shader"] },
      "motion": ["A.04 mask per panel", "tilt-in"] },
    { "id": "NestedBubbleTree", "family": "experiment", "style": "bubbletree", "layout": "bubble-tree", "backed": false, "density": "mouse",
      "model": { "root": "mascot", "branches": [ {"id":"theme","label":"Theme","leaves":["Beret","Signal","Anth","Shell"]}, {"id":"shape","label":"Shape","leaves":["Round","Sharp","Pill"]}, {"id":"motion","label":"Motion","leaves":["Settle","Lift","Reveal","Iris"]}, {"id":"shader","label":"Shader","leaves":["Dither","Grain","Refract"]}, {"id":"layout","label":"Layout","leaves":["Tile","Float","Stack"]} ] },
      "motion": ["edge-draw", "bubble-pop"] },
    { "id": "EmptyRadialPill", "family": "experiment", "style": "radialpill", "layout": "radial-mode-pills", "backed": false, "density": "mouse",
      "model": { "modes": [ {"id":"add","icon":"add","items":["Widget…","Workspace","Folder","File"]}, {"id":"change","icon":"paint","items":["Wallpaper","Theme","Layout"]}, {"id":"open","icon":"terminal","items":["Terminal","Files","Browser"]}, {"id":"system","icon":"settings","items":["Settings","Reload shell","Lock"]} ] },
      "geometry": {"R": 60, "r": 24}, "motion": ["slice-hover", "pill-cascade"] },
    { "id": "ClipboardHistory", "family": "recipe", "style": "list", "layout": "panel-search", "backed": true, "density": "mouse",
      "composition_of": "list + search header + typed-preview rows",
      "model": { "search": "Filtrer le presse-papiers…", "groups": [ { "head":"Récents", "rows":[ {"id":"c1","kind":"item","icon":"clipboard","label":"compose-core::reduce(input)","sub":"texte","accent":true}, {"id":"c2","kind":"item","icon":"clipboard","label":"gnu.in/docs/context-spec","sub":"lien"}, {"id":"c3","kind":"swatch","swatch":"#FF6A00","label":"#FF6A00","sub":"couleur"}, {"id":"c4","kind":"item","icon":"clipboard","label":"Object.assign(window, …)","sub":"extrait"} ] }, { "head":"", "rows":[ {"id":"clr","kind":"item","icon":"trash","label":"Vider l'historique","danger":true} ] } ] },
      "motion": ["A.04 mask", "A.01 fade"] },
    { "id": "ColorSwatches", "family": "recipe", "style": "list", "layout": "swatch-grid", "backed": true, "density": "mouse",
      "composition_of": "list + 6-col swatch grid + eyedropper rows",
      "model": { "swatches": ["#FF6A00","#E05A00","#5F7F52","#3D8DCC","#CE8E3F","#111418","#F7F3ED","#9B8DCC","#5FAF8C","#E5675F","#E8B341","#6B7280"], "groups": [ { "head":"", "rows":[ {"id":"eye","kind":"item","icon":"eyedropper","label":"Pipette…","kbd":["⌘","P"]}, {"id":"cust","kind":"item","icon":"add","label":"Couleur personnalisée"} ] } ] },
      "motion": ["A.04 mask", "swatch-scale"] },
    { "id": "MediaControls", "family": "recipe", "style": "trayaudio", "layout": "transport", "backed": true, "density": "mouse",
      "composition_of": "trayaudio panel + art + scrubber + transport pills",
      "model": { "track": {"title":"Refraction","artist":"Sys.ter · compose-core OST","pos":"1:24","len":"3:38","progress":0.4}, "transport": ["prev","play","next"] },
      "motion": ["A.04 mask", "scrubber-fill"] },
    { "id": "SearchCommand", "family": "recipe", "style": "list", "layout": "command-palette", "backed": true, "density": "mouse",
      "composition_of": "list + search header + grouped results + kbd footer",
      "model": { "search": "th", "groups": [ { "head":"Actions", "rows":[ {"id":"r1","kind":"item","icon":"paint","label":"Changer le thème","kbd":["⌘","T"],"accent":true}, {"id":"r2","kind":"item","icon":"motion","label":"Éditer les motions"}, {"id":"r3","kind":"item","icon":"shape","label":"Préréglage de forme"} ] }, { "head":"Fichiers", "rows":[ {"id":"f1","kind":"item","icon":"file","label":"context-spec.md","sub":"design_refs/"}, {"id":"f2","kind":"item","icon":"file","label":"theme.json","sub":"blob.in/"} ] } ] },
      "motion": ["A.02 scale", "A.01 fade"] },
    { "id": "FileContext", "family": "recipe", "style": "list", "layout": "panel-fileheader", "backed": true, "density": "mouse",
      "composition_of": "list + file-preview header + actions + danger",
      "model": { "header": {"icon":"file","name":"rapport-q2.pdf","meta":"2.4 MB · PDF · modifié hier"}, "groups": [ { "head":"", "rows":[ {"id":"open","kind":"item","icon":"file","label":"Ouvrir","kbd":["⏎"],"accent":true}, {"id":"rename","kind":"item","icon":"rename","label":"Renommer","kbd":["F2"]}, {"id":"dup","kind":"item","icon":"copy","label":"Dupliquer","kbd":["⌘","D"]}, {"id":"move","kind":"submenu","icon":"folder","label":"Déplacer vers…"} ] }, { "head":"", "rows":[ {"id":"share","kind":"submenu","icon":"share","label":"Partager"}, {"id":"star","kind":"toggle","icon":"star","label":"Favori","on":false} ] }, { "head":"", "rows":[ {"id":"rm","kind":"item","icon":"trash","label":"Mettre à la corbeille","kbd":["⌫"],"danger":true} ] } ] },
      "motion": ["A.04 mask", "A.01 fade"] },
    { "id": "ShareGrid", "family": "recipe", "style": "list", "layout": "target-grid", "backed": true, "density": "mouse",
      "composition_of": "list + 3-col target grid",
      "model": { "title": "rapport-q2.pdf", "targets": [ {"id":"air","icon":"share","label":"Proximité"}, {"id":"mail","icon":"mail","label":"Mail"}, {"id":"msg","icon":"bell","label":"Message"}, {"id":"copy","icon":"copy","label":"Copier lien"}, {"id":"dl","icon":"download","label":"Télécharger"}, {"id":"term","icon":"terminal","label":"Terminal"} ] },
      "motion": ["A.04 mask", "target-lift"] }
  ],
  "consumers": {
    "engine": "reduce(style, model, anchor, density) → Scene{ Blob? · MenuPanel · MenuRow[] · sub } — layout drives geometry; backed drives the membrane Blob",
    "host": "paints the Scene via the Renderer trait; bespoke layouts (radial/bubble/fractal) are layout strategies of the same reducer, not separate renderers",
    "central": "should render its context menu FROM this registry (replacing the family-representative panel/ring)",
    "gallery": "Gnu.In Context Menus.dc.html should hydrate FROM this registry instead of carrying bespoke JSX per molecule"
  }
}
;
function DataGallery() {
  const [mode, setMode] = React.useState('dark');
  const [dens, setDens] = React.useState('mouse');
  const [narrow, setNarrow] = React.useState(() => window.innerWidth <= 760);
  React.useEffect(() => {
    const update = () => setNarrow(window.innerWidth <= 760);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  const theme = gnuTheme({ dark: mode === 'dark', brand: 'medium' });
  const mols = MOLECULE_SPECS.molecules;
  const mono = 'ui-monospace, "JetBrains Mono", monospace';
  const fams = ['empty','widget','window','nested','tray','recipe','experiment'];
  const famLabel = { empty:'01 · Espace vide', widget:'02 · Widget', window:'03 · Fenêtre', nested:'04 · Cascade', tray:'05 · Tray', recipe:'06 · Recettes', experiment:'07 · Expérimentations' };
  const layoutsCovered = new Set(mols.map(m => m.layout)).size;
  const pageBg = mode === 'dark' ? '#07090B' : '#E5DFD2';
  const pageFg = mode === 'dark' ? '#F7F3ED' : '#111418';
  const cardBg = mode === 'dark' ? '#0D1014' : '#FBFAF6';
  const faint = mode === 'dark' ? 'rgba(247,243,237,.42)' : 'rgba(17,20,24,.4)';
  const seg = (val, set, opts) => (
    <div style={{ display:'flex', background: mode === 'dark' ? '#15181C' : 'rgba(17,20,24,.06)', borderRadius:9, padding:3, border:'.5px solid '+theme.border, flexWrap:'wrap' }}>
      {opts.map(([v, lb]) => (
        <button key={v} onClick={() => set(v)} style={{
          border:'none', cursor:'pointer', padding:'5px 12px', borderRadius:6, fontSize:11, fontWeight:600, fontFamily:'inherit',
          background: val === v ? theme.accent : 'transparent', color: val === v ? '#1a1207' : (mode === 'dark' ? '#cbc5ca' : '#444'),
        }} aria-pressed={val === v}>{lb}</button>
      ))}
    </div>
  );
  const proof = [
    ['source', `${mols.length} molécules chargées depuis le registre`],
    ['layouts', `${layoutsCovered} stratégies de rendu couvertes`],
    ['renderer', 'un renderer générique pour les cas vérifiés'],
    ['densité', `prévisualisation ${dens} active`]
  ];
  return (
    <div style={{ minHeight:'100vh', width:'100%', maxWidth:'100vw', boxSizing:'border-box', overflowX:'hidden', background:pageBg, color:pageFg, fontFamily:'ui-sans-serif,system-ui,sans-serif', padding:narrow ? '20px 12px 64px 12px' : '24px 30px 64px 92px', transition:'background .2s, color .2s' }}>
      <div style={{ display:'flex', alignItems:narrow ? 'flex-start' : 'center', gap:14, justifyContent:'space-between', borderBottom:'1px solid '+theme.border, paddingBottom:16, flexWrap:'wrap' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, minWidth:0 }}>
          <SysterGlyph size={30} hover />
          <div>
            <h1 style={{ fontSize:narrow ? 18 : 19, fontWeight:700, margin:0, letterSpacing:0, lineHeight:1.15 }}>Renderer générique · hydraté depuis les données</h1>
            <div style={{ fontSize:11, color: mode === 'dark' ? 'rgba(247,243,237,.5)' : 'rgba(17,20,24,.5)', marginTop:2 }}>molecule_specs.json → MoleculeRenderer · {mols.length} molécules · {layoutsCovered} layouts · rendu data-driven</div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:narrow ? 'flex-start' : 'center', gap:16, flexWrap:'wrap' }}>
          <div style={{ display:'flex', alignItems:'center', gap:7 }}><span style={{ fontSize:9, color:faint, fontFamily:mono, letterSpacing:'0.1em' }}>THÈME</span>{seg(mode, setMode, [['dark','Sombre'],['light','Clair']])}</div>
          <div style={{ display:'flex', alignItems:'center', gap:7 }}><span style={{ fontSize:9, color:faint, fontFamily:mono, letterSpacing:'0.1em' }}>DENSITÉ</span>{seg(dens, setDens, [['mouse','Souris'],['comfy','Confort'],['touch','Tactile']])}</div>
          <div style={{ fontSize:10, fontFamily:mono, color:'#FF6A00', letterSpacing:'0.1em', fontWeight:600 }}>SOURCE UNIQUE DE RENDU</div>
        </div>
      </div>
      <section aria-label="Renderer proof" style={{ display:'grid', gridTemplateColumns:narrow ? '1fr' : 'repeat(4,minmax(0,1fr))', gap:10, marginTop:18 }}>
        {proof.map(([label, value]) => (
          <div key={label} style={{ borderRadius:10, border:'.5px solid '+theme.border, background:cardBg, padding:'12px 13px', minHeight:74 }}>
            <div style={{ fontSize:9, fontFamily:mono, color:'#FF6A00', letterSpacing:'.12em', textTransform:'uppercase', fontWeight:700 }}>{label}</div>
            <div style={{ fontSize:12, lineHeight:1.35, marginTop:9, color:mode === 'dark' ? 'rgba(247,243,237,.68)' : 'rgba(17,20,24,.68)', fontWeight:600 }}>{value}</div>
          </div>
        ))}
      </section>
      {fams.map(fam => {
        const items = mols.filter(m => m.family === fam);
        if (!items.length) return null;
        return (
          <section key={fam} style={{ marginTop:30 }}>
            <div style={{ fontSize:13, fontWeight:700, marginBottom:12 }}>{famLabel[fam]} <span style={{ fontSize:10.5, color:faint, fontWeight:400 }}>· {items.length}</span></div>
            <div style={{ display:'grid', gridTemplateColumns:narrow ? 'minmax(0,1fr)' : 'repeat(auto-fill, minmax(310px, 1fr))', gap:narrow ? 12 : 16 }}>
              {items.map(m => (
                <div key={m.id} style={{ borderRadius:14, overflow:'hidden', background:cardBg, border:'.5px solid '+theme.border, boxShadow: mode === 'dark' ? '0 10px 30px rgba(0,0,0,.4)' : '0 10px 30px rgba(17,20,24,.1)' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 13px', borderBottom:'.5px solid '+theme.border }}>
                    <span style={{ fontSize:12, fontWeight:600 }}>{m.id}</span>
                    <span style={{ fontSize:9, fontFamily:mono, color:faint }}>{m.style} · {m.layout}</span>
                  </div>
                  <div style={{ height:narrow ? 286 : 312, position:'relative', display:'grid', placeItems:'center', padding:narrow ? 10 : 14, overflow:'hidden' }}>
                    <MoleculeRenderer key={mode + dens} m={m} theme={theme} dpref={dens} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
Object.assign(window, { DataGallery });
