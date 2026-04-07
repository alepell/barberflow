import { z } from "zod";

export const criarAgendamentoSchema = z.object({
  data: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de data inválido (YYYY-MM-DD)"),
  horaInicio: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Formato de hora inválido (HH:MM)"),
  horaFim: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Formato de hora inválido (HH:MM)"),
});

export const cancelarAgendamentoSchema = z.object({
  id: z.string().min(1, "ID do agendamento é obrigatório"),
});

export type CriarAgendamentoInput = z.infer<typeof criarAgendamentoSchema>;
export type CancelarAgendamentoInput = z.infer<
  typeof cancelarAgendamentoSchema
>;
