import { prisma } from "@/lib/prisma";
import {
  horarioDisponivelSchema,
  type HorarioDisponivelInput,
} from "@/lib/validations/horario";

export async function criarHorarioDisponivel(input: HorarioDisponivelInput) {
  const data = horarioDisponivelSchema.parse(input);

  const existente = await prisma.horarioDisponivel.findUnique({
    where: {
      diaSemana_horaInicio: {
        diaSemana: data.diaSemana,
        horaInicio: data.horaInicio,
      },
    },
  });

  if (existente) {
    throw new Error("Horário já cadastrado para este dia da semana");
  }

  return prisma.horarioDisponivel.create({ data });
}

export async function listarHorariosDisponiveis(diaSemana: number) {
  return prisma.horarioDisponivel.findMany({
    where: { diaSemana, ativo: true },
    orderBy: { horaInicio: "asc" },
  });
}

export async function listarHorariosLivres(data: string) {
  const dateObj = new Date(data + "T00:00:00");
  const diaSemana = dateObj.getUTCDay();

  const horarios = await prisma.horarioDisponivel.findMany({
    where: { diaSemana, ativo: true },
    orderBy: { horaInicio: "asc" },
  });

  const agendamentos = await prisma.agendamento.findMany({
    where: {
      data: dateObj,
      status: { in: ["PENDENTE", "CONFIRMADO"] },
    },
    select: { horaInicio: true },
  });

  const bloqueios = await prisma.bloqueioHorario.findMany({
    where: { data: dateObj },
    select: { horaInicio: true },
  });

  const horariosOcupados = new Set([
    ...agendamentos.map((a) => a.horaInicio),
    ...bloqueios.map((b) => b.horaInicio),
  ]);

  return horarios.map((h) => ({
    ...h,
    disponivel: !horariosOcupados.has(h.horaInicio),
  }));
}

export async function toggleHorarioDisponivel(id: string) {
  const horario = await prisma.horarioDisponivel.findUnique({
    where: { id },
  });

  if (!horario) {
    throw new Error("Horário não encontrado");
  }

  return prisma.horarioDisponivel.update({
    where: { id },
    data: { ativo: !horario.ativo },
  });
}

export async function criarBloqueio(input: {
  data: string;
  horaInicio: string;
  horaFim: string;
  motivo?: string;
}) {
  const dateObj = new Date(input.data + "T00:00:00");

  const existente = await prisma.bloqueioHorario.findUnique({
    where: {
      data_horaInicio: {
        data: dateObj,
        horaInicio: input.horaInicio,
      },
    },
  });

  if (existente) {
    throw new Error("Bloqueio já existe para este horário");
  }

  return prisma.bloqueioHorario.create({
    data: {
      data: dateObj,
      horaInicio: input.horaInicio,
      horaFim: input.horaFim,
      motivo: input.motivo,
    },
  });
}

export async function removerBloqueio(id: string) {
  const bloqueio = await prisma.bloqueioHorario.findUnique({
    where: { id },
  });

  if (!bloqueio) {
    throw new Error("Bloqueio não encontrado");
  }

  return prisma.bloqueioHorario.delete({ where: { id } });
}
