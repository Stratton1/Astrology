import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex flex-col min-h-[calc(100vh-57px)]">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        {/* Star field decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-cosmos-sky/60 rounded-full animate-pulse-slow" />
          <div className="absolute top-1/3 right-1/3 w-0.5 h-0.5 bg-cosmos-gold/40 rounded-full animate-pulse-slow [animation-delay:1s]" />
          <div className="absolute top-2/3 left-1/3 w-1 h-1 bg-cosmos-lavender/50 rounded-full animate-pulse-slow [animation-delay:2s]" />
          <div className="absolute bottom-1/4 right-1/4 w-0.5 h-0.5 bg-cosmos-sky/30 rounded-full animate-pulse-slow [animation-delay:0.5s]" />
          <div className="absolute top-1/2 left-1/6 w-1 h-1 bg-cosmos-stardust/40 rounded-full animate-pulse-slow [animation-delay:1.5s]" />
          <div className="absolute top-1/5 right-1/5 w-0.5 h-0.5 bg-cosmos-azure/50 rounded-full animate-pulse-slow [animation-delay:3s]" />
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Zodiac wheel decoration */}
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full border border-cosmos-indigo/30 opacity-60" aria-hidden="true" />
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full border border-cosmos-azure/20 opacity-40" aria-hidden="true" />

          {/* Main heading */}
          <h1 className="font-display text-7xl md:text-9xl font-bold tracking-widest text-gradient-cosmos mb-4">
            COSMOS
          </h1>

          <p className="text-cosmos-silver text-lg md:text-xl font-light tracking-[0.3em] uppercase mb-6">
            Multi-Tradition Astrology Platform
          </p>

          <p className="text-cosmos-silver/70 text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-12">
            Explore your birth chart through the lens of Western, Vedic, and Hellenistic astrology.
            Calculate precise planetary positions, house divisions, and aspect patterns — then receive
            AI-powered interpretations tailored to each tradition.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/chart" className="btn-primary text-base px-8 py-4">
              Create Chart
            </Link>
            <Link href="#features" className="btn-secondary text-base px-8 py-4">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 border-t border-cosmos-midnight/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-center text-gradient-cosmos mb-16">
            Three Traditions, One Platform
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="cosmos-card text-center">
              <div className="text-4xl mb-4" aria-hidden="true">☿</div>
              <h3 className="font-display text-xl font-semibold text-cosmos-sky mb-3">Western</h3>
              <p className="text-cosmos-silver/70 text-sm leading-relaxed">
                Tropical zodiac with modern psychological interpretations. Supports Placidus,
                Whole Sign, Equal, Koch, Campanus, and Regiomontanus house systems.
              </p>
            </div>

            <div className="cosmos-card text-center">
              <div className="text-4xl mb-4" aria-hidden="true">♃</div>
              <h3 className="font-display text-xl font-semibold text-cosmos-gold mb-3">Vedic</h3>
              <p className="text-cosmos-silver/70 text-sm leading-relaxed">
                Sidereal zodiac with Lahiri, Raman, Krishnamurti, or Fagan-Bradley ayanamsha.
                Whole Sign house system with traditional Jyotish interpretation framework.
              </p>
            </div>

            <div className="cosmos-card text-center">
              <div className="text-4xl mb-4" aria-hidden="true">♄</div>
              <h3 className="font-display text-xl font-semibold text-cosmos-lavender mb-3">Hellenistic</h3>
              <p className="text-cosmos-silver/70 text-sm leading-relaxed">
                Ancient Greek astrology using Whole Sign houses with sect, bonification,
                and maltreatment analysis rooted in classical Hellenistic techniques.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-cosmos-midnight/50 py-8 px-6 text-center">
        <p className="text-cosmos-silver/40 text-sm">
          COSMOS — Precision astrology across traditions
        </p>
      </footer>
    </main>
  );
}
