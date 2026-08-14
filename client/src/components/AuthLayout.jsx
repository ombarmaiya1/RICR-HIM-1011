/**
 * AuthLayout — faithfully reproduces the Stitch "AI Career Pro / Monolith Career System" design:
 *
 * Structure (from the Stitch screenshot):
 *   <body bg=#000000>
 *     <div class="page-surface" bg=#f9f9f9>        ← white content area
 *       <main center-vertically>
 *         <div class="card" border=2px solid #000>  ← card
 *           <header> ARCHITECT AI logo </header>
 *           {children}
 *         </div>
 *       </main>
 *       <footer>                                    ← inside white area
 *     </div>
 *   </body>
 */
export default function AuthLayout({ children }) {
  return (
    /* Black outer body (body bg set in CSS), white inner surface */
    <div className="page-surface min-h-screen flex flex-col">

      {/* Vertically centered main */}
      <main className="flex-1 flex items-center justify-center px-4 py-10">

        {/* Card — 2px solid black border, no shadow, no radius */}
        <div
          className="fade-up w-full bg-base-100 p-8 md:p-12 border-2 border-primary"
          style={{ maxWidth: '448px' }}
        >
          {/* Brand */}
          <header className="mb-12 text-center">
            <h1
              className="text-4xl font-bold text-primary leading-tight mb-1"
              style={{
                fontFamily: 'Inter, sans-serif',
                letterSpacing: '-0.02em',
                fontWeight: 700,
              }}
            >
              AI CAREER PRO
            </h1>
            <p
              className="text-sm text-secondary mt-1"
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
            >
              Career Platform Access
            </p>
          </header>

          {children}
        </div>
      </main>

      {/* Footer — inside the white surface, below the card */}
      <footer
        className="border-t py-4 px-10 flex flex-col md:flex-row justify-between items-center gap-2"
        style={{ borderColor: '#cfc4c5' }}
      >
        <span
          className="text-xs font-bold text-primary uppercase tracking-widest"
          style={{ letterSpacing: '0.05em' }}
        >
          © 2024 AI CAREER PRO. ALL RIGHTS RESERVED.
        </span>
        <nav className="flex gap-6">
          {['Privacy Policy', 'Terms of Service', 'Contact Support'].map((t) => (
            <a
              key={t}
              href="#"
              className="text-xs hover:underline transition-colors"
              style={{ color: '#4c4546' }}
            >
              {t}
            </a>
          ))}
        </nav>
      </footer>
    </div>
  )
}
