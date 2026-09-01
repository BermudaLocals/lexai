export default function Home() {
  return (
    <main className="bg-black text-white min-h-screen">
      <section className="relative min-h- flex items-center justify-center py-20 text-center px-6">
        <div>
          <p className="text-xs tracking-widest text-zinc-400 mb-4">291 Jurisdictions · 4M+ Cases · 47 Practice Areas</p>
          <h1 className="text-6xl md:text-8xl font-bold">Lex<span className="text-yellow-500">AI</span></h1>
          <p className="mt-6 text-xl text-zinc-300">The AI legal platform that learns your practice.</p>
          <div className="flex flex-col md:flex-row gap-4 justify-center mt-10">
            <a href="#pricing" className="bg-white text-black px-8 py-4 rounded-full font-bold">For Lawyers → $300/mo</a>
            <a href="/business" className="border border-yellow-500 text-yellow-400 px-8 py-4 rounded-full font-bold">For Businesses, Realtors →</a>
          </div>
          <p className="text-xs text-zinc-500 mt-4">Team $1200 (4 users) · Enterprise $3000 (10+ users) · 5-seat firm = $1500/mo = 500 credits</p>
        </div>
      </section>
    </main>
  );
}
