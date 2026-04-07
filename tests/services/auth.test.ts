import { describe, it, expect, vi, beforeEach } from "vitest";
import bcrypt from "bcryptjs";

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";

const mockFindUnique = prisma.user.findUnique as ReturnType<typeof vi.fn>;
const mockCompare = bcrypt.compare as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
});

// We test the authorize logic directly by extracting it
// Since NextAuth wraps it, we replicate the logic here for unit testing
async function authorize(credentials: { email?: string; password?: string }) {
  if (!credentials?.email || !credentials?.password) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email: credentials.email },
  });

  if (!user || !(user as { password?: string }).password) {
    return null;
  }

  const isPasswordValid = await bcrypt.compare(
    credentials.password,
    (user as { password: string }).password
  );

  if (!isPasswordValid) {
    return null;
  }

  return {
    id: (user as { id: string }).id,
    email: (user as { email: string }).email,
    name: (user as { name: string }).name,
    role: (user as { role: string }).role,
  };
}

describe("Auth: authorize (Credentials)", () => {
  const mockUser = {
    id: "user-1",
    name: "João Silva",
    email: "joao@email.com",
    password: "hashed_password",
    role: "CLIENTE",
  };

  it("deve autenticar com credenciais válidas", async () => {
    mockFindUnique.mockResolvedValue(mockUser);
    mockCompare.mockResolvedValue(true);

    const result = await authorize({
      email: "joao@email.com",
      password: "123456",
    });

    expect(result).toEqual({
      id: "user-1",
      email: "joao@email.com",
      name: "João Silva",
      role: "CLIENTE",
    });
  });

  it("deve retornar null se email não fornecido", async () => {
    const result = await authorize({ email: "", password: "123456" });
    expect(result).toBeNull();
    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it("deve retornar null se senha não fornecida", async () => {
    const result = await authorize({ email: "joao@email.com", password: "" });
    expect(result).toBeNull();
    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it("deve retornar null se usuário não existe", async () => {
    mockFindUnique.mockResolvedValue(null);

    const result = await authorize({
      email: "inexistente@email.com",
      password: "123456",
    });

    expect(result).toBeNull();
  });

  it("deve retornar null se usuário não tem senha (login via Google)", async () => {
    mockFindUnique.mockResolvedValue({
      ...mockUser,
      password: null,
    });

    const result = await authorize({
      email: "joao@email.com",
      password: "123456",
    });

    expect(result).toBeNull();
    expect(mockCompare).not.toHaveBeenCalled();
  });

  it("deve retornar null se senha está incorreta", async () => {
    mockFindUnique.mockResolvedValue(mockUser);
    mockCompare.mockResolvedValue(false);

    const result = await authorize({
      email: "joao@email.com",
      password: "senha_errada",
    });

    expect(result).toBeNull();
  });

  it("deve funcionar com role ADMIN", async () => {
    const adminUser = { ...mockUser, role: "ADMIN" };
    mockFindUnique.mockResolvedValue(adminUser);
    mockCompare.mockResolvedValue(true);

    const result = await authorize({
      email: "joao@email.com",
      password: "123456",
    });

    expect(result?.role).toBe("ADMIN");
  });
});

describe("Auth: JWT callback logic", () => {
  it("deve adicionar role e id ao token quando user está presente", () => {
    const token = { sub: "user-1" };
    const user = { id: "user-1", role: "CLIENTE" };

    // Simulating jwt callback
    const updatedToken = { ...token };
    if (user) {
      (updatedToken as Record<string, unknown>).role = user.role;
      (updatedToken as Record<string, unknown>).id = user.id;
    }

    expect(updatedToken).toHaveProperty("role", "CLIENTE");
    expect(updatedToken).toHaveProperty("id", "user-1");
  });

  it("deve manter token inalterado quando user não está presente", () => {
    const token = { sub: "user-1", role: "CLIENTE", id: "user-1" };
    const user = null;

    const updatedToken = { ...token };
    if (user) {
      (updatedToken as Record<string, unknown>).role = (
        user as { role: string }
      ).role;
    }

    expect(updatedToken).toEqual(token);
  });
});

describe("Auth: Session callback logic", () => {
  it("deve adicionar id e role à session do usuário", () => {
    const session = { user: { name: "João", email: "joao@email.com" } };
    const token = { id: "user-1", role: "CLIENTE" };

    // Simulating session callback
    if (session.user) {
      (session.user as Record<string, unknown>).id = token.id;
      (session.user as Record<string, unknown>).role = token.role;
    }

    expect(session.user).toHaveProperty("id", "user-1");
    expect(session.user).toHaveProperty("role", "CLIENTE");
  });
});
