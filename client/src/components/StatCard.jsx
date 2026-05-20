export default function StatCard({ title, value, accent = "from-cyan-400 to-violet-500" }) {
  return (
    <article className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-panel backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-cyan-300/40">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`} />
      <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">{title}</p>
      <strong className="mt-4 block text-4xl font-black text-white">{value}</strong>
      <div className="mt-4 h-2 rounded-full bg-white/10">
        <div className={`h-full w-2/3 rounded-full bg-gradient-to-r ${accent} transition-all group-hover:w-full`} />
      </div>
    </article>
  );
}
