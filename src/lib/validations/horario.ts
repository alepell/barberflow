import { z } from "zod";

export const horarioDisponivelSchema = z.object({
  diaSemana: z.number().int().min(0).max(6),
  horaInicio: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Formato de hora inválido (HH:MM)"),
  horaFim: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Formato de hora inválido (HH:MM)"),
});

export const bloqueioHorarioSchema = z.object({
  data: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de data inválido (YYYY-MM-DD)"),
  horaInicio: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Formato de hora inválido (HH:MM)"),
  horaFim: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Formato de hora inválido (HH:MM)"),
  motivo: z.string().optional(),
});

export type HorarioDisponivelInput = z.infer<typeof horarioDisponivelSchema>;
export type BloqueioHorarioInput = z.infer<typeof bloqueioHorarioSchema>;
