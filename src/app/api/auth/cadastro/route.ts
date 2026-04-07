import { NextResponse } from "next/server";
import { criarUsuario } from "@/services/usuario";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const user = await criarUsuario(body);
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao criar conta";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
