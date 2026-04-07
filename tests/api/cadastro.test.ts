import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/services/usuario", () => ({
  criarUsuario: vi.fn(),
}));

import { criarUsuario } from "@/services/usuario";

const mockCriarUsuario = criarUsuario as ReturnType<typeof vi.fn>;

async function callCadastroHandler(body: unknown) {
  const { POST } = await import("@/app/api/auth/cadastro/route");
  const request = new Request("http://localhost:3000/api/auth/cadastro", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return POST(request);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/auth/cadastro", () => {
  it("deve criar usuário e retornar 201", async () => {
    mockCriarUsuario.mockResolvedValue({
      id: "user-1",
      name: "João Silva",
      email: "joao@email.com",
      role: "CLIENTE",
    });

    const response = await callCadastroHandler({
      name: "João Silva",
      email: "joao@email.com",
      password: "123456",
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.user).toEqual({
      id: "user-1",
      name: "João Silva",
      email: "joao@email.com",
      role: "CLIENTE",
    });
  });

  it("deve retornar 400 se email já cadastrado", async () => {
    mockCriarUsuario.mockRejectedValue(new Error("Email já cadastrado"));

    const response = await callCadastroHandler({
      name: "João Silva",
      email: "joao@email.com",
      password: "123456",
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("Email já cadastrado");
  });

  it("deve retornar 400 para dados inválidos (validação Zod)", async () => {
    mockCriarUsuario.mockRejectedValue(new Error("Validation error"));

    const response = await callCadastroHandler({
      name: "",
      email: "invalido",
      password: "12",
    });

    expect(response.status).toBe(400);
  });

  it("não deve retornar a senha no corpo da resposta", async () => {
    mockCriarUsuario.mockResolvedValue({
      id: "user-1",
      name: "João Silva",
      email: "joao@email.com",
      role: "CLIENTE",
    });

    const response = await callCadastroHandler({
      name: "João Silva",
      email: "joao@email.com",
      password: "123456",
    });

    const data = await response.json();
    expect(data.user).not.toHaveProperty("password");
  });
});
