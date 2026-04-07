import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  cancelarAgendamentoCliente,
  confirmarAgendamento,
  cancelarAgendamentoAdmin,
} from "@/services/agendamento";

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/agendamentos/[id]">
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id } = await ctx.params;

  try {
    const body = await request.json();
    const role = (session.user as unknown as { role: string }).role;

    if (body.action === "confirmar" && role === "ADMIN") {
      const agendamento = await confirmarAgendamento(id);
      return NextResponse.json(agendamento);
    }

    if (body.action === "cancelar") {
      const agendamento =
        role === "ADMIN"
          ? await cancelarAgendamentoAdmin(id)
          : await cancelarAgendamentoCliente(id, session.user.id);
      return NextResponse.json(agendamento);
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao atualizar agendamento";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
