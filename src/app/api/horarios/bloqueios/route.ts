import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { criarBloqueio, removerBloqueio } from "@/services/disponibilidade";

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
    const bloqueio = await criarBloqueio(body);
    return NextResponse.json(bloqueio, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao criar bloqueio";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const role = (session.user as unknown as { role: string }).role;
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Parâmetro 'id' é obrigatório" },
        { status: 400 }
      );
    }

    await removerBloqueio(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao remover bloqueio";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
