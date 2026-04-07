import { describe, it, expect } from "vitest";
import {
  horarioDisponivelSchema,
  bloqueioHorarioSchema,
} from "@/lib/validations/horario";

describe("Validações de Horário", () => {
  describe("horarioDisponivelSchema", () => {
    it("deve aceitar dados válidos", () => {
      const result = horarioDisponivelSchema.safeParse({
        diaSemana: 1,
        horaInicio: "09:00",
        horaFim: "09:30",
      });
      expect(result.success).toBe(true);
    });

    it("deve aceitar domingo (0)", () => {
      const result = horarioDisponivelSchema.safeParse({
        diaSemana: 0,
        horaInicio: "10:00",
        horaFim: "10:30",
      });
      expect(result.success).toBe(true);
    });

    it("deve aceitar sábado (6)", () => {
      const result = horarioDisponivelSchema.safeParse({
        diaSemana: 6,
        horaInicio: "14:00",
        horaFim: "14:30",
      });
      expect(result.success).toBe(true);
    });

    it("deve rejeitar dia da semana inválido (7)", () => {
      const result = horarioDisponivelSchema.safeParse({
        diaSemana: 7,
        horaInicio: "09:00",
        horaFim: "09:30",
      });
      expect(result.success).toBe(false);
    });

    it("deve rejeitar dia da semana negativo", () => {
      const result = horarioDisponivelSchema.safeParse({
        diaSemana: -1,
        horaInicio: "09:00",
        horaFim: "09:30",
      });
      expect(result.success).toBe(false);
    });

    it("deve rejeitar hora com formato inválido", () => {
      const result = horarioDisponivelSchema.safeParse({
        diaSemana: 1,
        horaInicio: "9:00",
        horaFim: "09:30",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("bloqueioHorarioSchema", () => {
    it("deve aceitar dados válidos", () => {
      const result = bloqueioHorarioSchema.safeParse({
        data: "2025-01-15",
        horaInicio: "09:00",
        horaFim: "09:30",
      });
      expect(result.success).toBe(true);
    });

    it("deve aceitar dados com motivo", () => {
      const result = bloqueioHorarioSchema.safeParse({
        data: "2025-01-15",
        horaInicio: "09:00",
        horaFim: "09:30",
        motivo: "Feriado",
      });
      expect(result.success).toBe(true);
    });

    it("deve rejeitar data com formato inválido", () => {
      const result = bloqueioHorarioSchema.safeParse({
        data: "15-01-2025",
        horaInicio: "09:00",
        horaFim: "09:30",
      });
      expect(result.success).toBe(false);
    });
  });
});
