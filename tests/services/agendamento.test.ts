import { describe, it, expect } from "vitest";
import {
  criarAgendamentoSchema,
  cancelarAgendamentoSchema,
} from "@/lib/validations/agendamento";

describe("Validações de Agendamento", () => {
  describe("criarAgendamentoSchema", () => {
    it("deve aceitar dados válidos", () => {
      const result = criarAgendamentoSchema.safeParse({
        data: "2025-01-15",
        horaInicio: "09:00",
        horaFim: "09:30",
      });
      expect(result.success).toBe(true);
    });

    it("deve rejeitar data com formato inválido", () => {
      const result = criarAgendamentoSchema.safeParse({
        data: "15/01/2025",
        horaInicio: "09:00",
        horaFim: "09:30",
      });
      expect(result.success).toBe(false);
    });

    it("deve rejeitar hora com formato inválido", () => {
      const result = criarAgendamentoSchema.safeParse({
        data: "2025-01-15",
        horaInicio: "9:00",
        horaFim: "09:30",
      });
      expect(result.success).toBe(false);
    });

    it("deve rejeitar dados faltando", () => {
      const result = criarAgendamentoSchema.safeParse({
        data: "2025-01-15",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("cancelarAgendamentoSchema", () => {
    it("deve aceitar ID válido", () => {
      const result = cancelarAgendamentoSchema.safeParse({
        id: "clx1234567890",
      });
      expect(result.success).toBe(true);
    });

    it("deve rejeitar ID vazio", () => {
      const result = cancelarAgendamentoSchema.safeParse({
        id: "",
      });
      expect(result.success).toBe(false);
    });
  });
});
