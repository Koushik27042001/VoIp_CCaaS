import Sidebar from "../components/Sidebar";

export default function AdminLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar role="admin" />
      <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6">
        <div className="mx-auto w-full max-w-7xl pb-10">{children}</div>
      </main>
    </div>
  );
}
