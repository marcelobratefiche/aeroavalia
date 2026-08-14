import { auth, signIn } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin";
import { AdminPanel } from "@/components/AdminPanel";

export const metadata = {
  title: "Avaliações recebidas — AeroAvalia",
};

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-2xl border border-[var(--line)] bg-[var(--bg-panel)] p-8 text-center shadow-xl">
          <p className="font-mono text-xs tracking-[0.35em] text-[var(--amber)] uppercase">
            Área restrita
          </p>
          <h1 className="font-display mt-2 text-xl font-semibold">
            Acesso da administração
          </h1>
          <p className="mt-2 text-sm text-[var(--ink-muted)]">
            Entre com a conta Google autorizada para ver as avaliações recebidas.
          </p>
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/admin" });
            }}
          >
            <button
              type="submit"
              className="mt-6 w-full rounded-lg bg-white py-2.5 text-sm font-semibold text-[#1f1f1f] transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Entrar com o Google
            </button>
          </form>
        </div>
      </main>
    );
  }

  if (!isAdminEmail(session.user.email)) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
        <div className="w-full max-w-sm rounded-2xl border border-[var(--line)] bg-[var(--bg-panel)] p-8 shadow-xl">
          <p className="font-mono text-xs tracking-[0.35em] uppercase" style={{ color: "var(--red)" }}>
            Acesso negado
          </p>
          <h1 className="font-display mt-2 text-xl font-semibold">
            Esta conta não tem permissão de administrador
          </h1>
          <p className="mt-2 text-sm text-[var(--ink-muted)]">
            Você está conectado como <strong>{session.user.email}</strong>. Peça ao
            responsável pelo sistema para adicionar este e-mail à lista de
            administradores.
          </p>
        </div>
      </main>
    );
  }

  return <AdminPanel adminName={session.user.name ?? "Administrador"} />;
}
