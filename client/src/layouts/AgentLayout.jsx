import Sidebar from "../components/Sidebar";

export default function AgentLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-white">
      <Sidebar role="agent" />
      <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6">
        <div className="mx-auto w-full max-w-[1440px] pb-10">{children}</div>
      </main>
    </div>
  );
}
