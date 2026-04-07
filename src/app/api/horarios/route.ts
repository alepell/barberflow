import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  listarHorariosLivres,
  criarHorarioDisponivel,
} from "@/services/disponibilidade";

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const data = searchParams.get("data");

  if (!data) {
    return NextResponse.json(
      { error: "Parâmetro 'data' é obrigatório" },
      { status: 400 }
    );
  }

  try {
    const horarios = await listarHorariosLivres(data);
    return NextResponse.json(horarios);
  } catch {
    return NextResponse.json(
      { error: "Erro ao listar horários" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const role = (session.user as unknown as { role: string }).role;
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const horario = await criarHorarioDisponivel(body);
    return NextResponse.json(horario, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erro ao criar horário disponível";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
