import { describe, it, expect } from "vitest";
import { cadastroSchema, loginSchema } from "@/lib/validations/usuario";

describe("Validações de Usuário", () => {
  describe("cadastroSchema", () => {
    it("deve aceitar dados válidos", () => {
      const result = cadastroSchema.safeParse({
        name: "João Silva",
        email: "joao@email.com",
        password: "123456",
      });
      expect(result.success).toBe(true);
    });

    it("deve rejeitar nome curto", () => {
      const result = cadastroSchema.safeParse({
        name: "J",
        email: "joao@email.com",
        password: "123456",
      });
      expect(result.success).toBe(false);
    });

    it("deve rejeitar email inválido", () => {
      const result = cadastroSchema.safeParse({
        name: "João Silva",
        email: "email-invalido",
        password: "123456",
      });
      expect(result.success).toBe(false);
    });

    it("deve rejeitar senha curta", () => {
      const result = cadastroSchema.safeParse({
        name: "João Silva",
        email: "joao@email.com",
        password: "123",
      });
      expect(result.success).toBe(false);
    });

    it("deve rejeitar senha muito longa", () => {
      const result = cadastroSchema.safeParse({
        name: "João Silva",
        email: "joao@email.com",
        password: "a".repeat(101),
      });
      expect(result.success).toBe(false);
    });
  });

  describe("loginSchema", () => {
    it("deve aceitar dados válidos", () => {
      const result = loginSchema.safeParse({
        email: "joao@email.com",
        password: "123456",
      });
      expect(result.success).toBe(true);
    });

    it("deve rejeitar email inválido", () => {
      const result = loginSchema.safeParse({
        email: "invalido",
        password: "123456",
      });
      expect(result.success).toBe(false);
    });

    it("deve rejeitar senha vazia", () => {
      const result = loginSchema.safeParse({
        email: "joao@email.com",
        password: "",
      });
      expect(result.success).toBe(false);
    });
  });
});
