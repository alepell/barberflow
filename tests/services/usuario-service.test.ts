import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock } from "../__mocks__/prisma";
import {
  criarUsuario,
  buscarUsuarioPorEmail,
  buscarUsuarioPorId,
} from "@/services/usuario";
import bcrypt from "bcryptjs";

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Service: criarUsuario", () => {
  const inputValido = {
    name: "João Silva",
    email: "joao@email.com",
    password: "123456",
  };

  it("deve criar um usuário com senha hashada", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    (bcrypt.hash as ReturnType<typeof vi.fn>).mockResolvedValue(
      "hashed_password"
    );
    prismaMock.user.create.mockResolvedValue({
      id: "user-1",
      name: "João Silva",
      email: "joao@email.com",
      role: "CLIENTE",
      password: "hashed_password",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await criarUsuario(inputValido);

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { email: "joao@email.com" },
    });
    expect(bcrypt.hash).toHaveBeenCalledWith("123456", 10);
    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: {
        name: "João Silva",
        email: "joao@email.com",
        password: "hashed_password",
      },
    });
    expect(result).toEqual({
      id: "user-1",
      name: "João Silva",
      email: "joao@email.com",
      role: "CLIENTE",
    });
  });

  it("deve lançar erro se email já está cadastrado", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "user-existente",
      email: "joao@email.com",
    });

    await expect(criarUsuario(inputValido)).rejects.toThrow(
      "Email já cadastrado"
    );
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });

  it("deve lançar erro de validação para dados inválidos", async () => {
    await expect(
      criarUsuario({ name: "", email: "invalido", password: "12" })
    ).rejects.toThrow();
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });

  it("não deve retornar a senha no resultado", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    (bcrypt.hash as ReturnType<typeof vi.fn>).mockResolvedValue("hashed");
    prismaMock.user.create.mockResolvedValue({
      id: "user-1",
      name: "João Silva",
      email: "joao@email.com",
      role: "CLIENTE",
      password: "hashed",
    });

    const result = await criarUsuario(inputValido);

    expect(result).not.toHaveProperty("password");
  });

  it("deve atribuir role CLIENTE por padrão", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    (bcrypt.hash as ReturnType<typeof vi.fn>).mockResolvedValue("hashed");
    prismaMock.user.create.mockResolvedValue({
      id: "user-1",
      name: "João Silva",
      email: "joao@email.com",
      role: "CLIENTE",
      password: "hashed",
    });

    const result = await criarUsuario(inputValido);

    expect(result.role).toBe("CLIENTE");
  });
});

describe("Service: buscarUsuarioPorEmail", () => {
  it("deve retornar o usuário se encontrado", async () => {
    const mockUser = {
      id: "user-1",
      name: "João",
      email: "joao@email.com",
      role: "CLIENTE",
    };
    prismaMock.user.findUnique.mockResolvedValue(mockUser);

    const result = await buscarUsuarioPorEmail("joao@email.com");

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { email: "joao@email.com" },
    });
    expect(result).toEqual(mockUser);
  });

  it("deve retornar null se não encontrado", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const result = await buscarUsuarioPorEmail("inexistente@email.com");

    expect(result).toBeNull();
  });
});

describe("Service: buscarUsuarioPorId", () => {
  it("deve retornar o usuário com campos selecionados", async () => {
    const mockUser = {
      id: "user-1",
      name: "João",
      email: "joao@email.com",
      role: "CLIENTE",
      image: null,
    };
    prismaMock.user.findUnique.mockResolvedValue(mockUser);

    const result = await buscarUsuarioPorId("user-1");

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { id: "user-1" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
      },
    });
    expect(result).toEqual(mockUser);
  });

  it("deve retornar null se usuário não existe", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const result = await buscarUsuarioPorId("id-inexistente");

    expect(result).toBeNull();
  });
});
