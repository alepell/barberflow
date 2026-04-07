import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  criarAgendamento,
  listarAgendamentosCliente,
} from "@/services/agendamento";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const agendamentos = await listarAgendamentosCliente(session.user.id);
    return NextResponse.json(agendamentos);
  } catch {
    return NextResponse.json(
      { error: "Erro ao listar agendamentos" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const agendamento = await criarAgendamento(session.user.id, body);
    return NextResponse.json(agendamento, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao criar agendamento";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
