export default function BusinessPage() {
  return (
    <main className="bg-black text-white min-h-screen">
      <section className="py-20 text-center px-6">
        <p className="text-xs tracking-widest text-zinc-400 mb-4">291 Jurisdictions · 4M+ Cases · 47 Practice Areas</p>
        <h1 className="text-5xl md:text-7xl font-bold leading-tight">
          The AI legal platform <br /><span className="text-zinc-500">that runs your business.</span>
        </h1>
        <p className="mt-6 text-lg text-zinc-300 max-w-2xl mx-auto">Contracts, leases, compliance without $350/hr lawyer. Same 16 AI features lawyers use — for realtors, small biz, contractors & startups.</p>
        <div className="flex gap-4 justify-center mt-8">
          <a href="/api/auth/signup" className="bg-white text-black px-8 py-3 rounded-full font-bold">Start Business Trial →</a>
          <a href="#pricing" className="border border-yellow-500/50 text-yellow-400 px-8 py-3 rounded-full">See Pricing</a>
        </div>
        <p className="text-xs text-zinc-500 mt-3">7-Day Free Trial · No Card · 5-seat min $1500/mo = 500 credits (100/seat)</p>
      </section>
      <section className="px-6 md:px-12 grid md:grid-cols-4 gap-6 mt-10">
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">🏠 <b>Realtors</b><br/><span className="text-sm text-zinc-400">Lease, Purchase, Disclosure, Commission. Risk 0-100 in 4.2s.</span></div>
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">🏢 <b>Small Businesses</b><br/><span className="text-sm text-zinc-400">Operating Agreement, NDA, Employee Contract, TOS, Privacy.</span></div>
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">🏗️ <b>Contractors</b><br/><span className="text-sm text-zinc-400">Service Agreement, SOW, Change Orders, Lien Waiver.</span></div>
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">🚀 <b>Startups</b><br/><span className="text-sm text-zinc-400">Incorporation, SAFE, Cap Table, IP Assignment.</span></div>
      </section>
    </main>
  );
}
