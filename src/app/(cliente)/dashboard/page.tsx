import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user;

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="mx-auto max-w-4xl p-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="mt-2 text-gray-400">
          Bem-vindo, {user.name || user.email}!
        </p>
        <div className="mt-6 rounded-lg border border-gray-800 bg-gray-900 p-6">
          <h2 className="mb-3 text-sm font-medium text-gray-400">
            Dados da sessão
          </h2>
          <dl className="space-y-2 text-sm">
            <div className="flex gap-2">
              <dt className="font-medium text-gray-400">Nome:</dt>
              <dd className="text-white">{user.name}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-medium text-gray-400">Email:</dt>
              <dd className="text-white">{user.email}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-medium text-gray-400">Role:</dt>
              <dd className="text-white">
                {(user as unknown as { role?: string }).role || "CLIENTE"}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
