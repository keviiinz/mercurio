import Sidebar from "@/app/components/Sidebar";
import { getSession } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar tipo="base" rol={session?.rol ?? "operador"} />
      <main style={{ marginLeft: 220, flex: 1, minHeight: "100vh" }}>
        {children}
      </main>
    </div>
  );
}
