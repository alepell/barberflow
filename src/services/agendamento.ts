import { prisma } from "@/lib/prisma";
import {
  criarAgendamentoSchema,
  type CriarAgendamentoInput,
} from "@/lib/validations/agendamento";

export async function criarAgendamento(
  clienteId: string,
  input: CriarAgendamentoInput
) {
  const data = criarAgendamentoSchema.parse(input);
  const dateObj = new Date(data.data + "T00:00:00");
  const diaSemana = dateObj.getUTCDay();

  const horarioDisponivel = await prisma.horarioDisponivel.findFirst({
    where: {
      diaSemana,
      horaInicio: data.horaInicio,
      ativo: true,
    },
  });

  if (!horarioDisponivel) {
    throw new Error("Horário não disponível");
  }

  const bloqueio = await prisma.bloqueioHorario.findUnique({
    where: {
      data_horaInicio: {
        data: dateObj,
        horaInicio: data.horaInicio,
      },
    },
  });

  if (bloqueio) {
    throw new Error("Horário bloqueado pelo barbeiro");
  }

  const agendamentoExistente = await prisma.agendamento.findFirst({
    where: {
      data: dateObj,
      horaInicio: data.horaInicio,
      status: { in: ["PENDENTE", "CONFIRMADO"] },
    },
  });

  if (agendamentoExistente) {
    throw new Error("Horário já agendado");
  }

  return prisma.agendamento.create({
    data: {
      clienteId,
      data: dateObj,
      horaInicio: data.horaInicio,
      horaFim: data.horaFim,
    },
  });
}

export async function listarAgendamentosCliente(clienteId: string) {
  return prisma.agendamento.findMany({
    where: { clienteId },
    orderBy: [{ data: "desc" }, { horaInicio: "desc" }],
  });
}

export async function listarAgendamentosPorData(data: string) {
  const dateObj = new Date(data + "T00:00:00");

  return prisma.agendamento.findMany({
    where: { data: dateObj },
    include: {
      cliente: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { horaInicio: "asc" },
  });
}

export async function cancelarAgendamentoCliente(
  agendamentoId: string,
  clienteId: string
) {
  const agendamento = await prisma.agendamento.findUnique({
    where: { id: agendamentoId },
  });

  if (!agendamento) {
    throw new Error("Agendamento não encontrado");
  }

  if (agendamento.clienteId !== clienteId) {
    throw new Error("Você não tem permissão para cancelar este agendamento");
  }

  if (agendamento.status === "CANCELADO") {
    throw new Error("Agendamento já está cancelado");
  }

  return prisma.agendamento.update({
    where: { id: agendamentoId },
    data: { status: "CANCELADO" },
  });
}

export async function confirmarAgendamento(agendamentoId: string) {
  const agendamento = await prisma.agendamento.findUnique({
    where: { id: agendamentoId },
  });

  if (!agendamento) {
    throw new Error("Agendamento não encontrado");
  }

  if (agendamento.status !== "PENDENTE") {
    throw new Error("Apenas agendamentos pendentes podem ser confirmados");
  }

  return prisma.agendamento.update({
    where: { id: agendamentoId },
    data: { status: "CONFIRMADO" },
  });
}

export async function cancelarAgendamentoAdmin(agendamentoId: string) {
  const agendamento = await prisma.agendamento.findUnique({
    where: { id: agendamentoId },
  });

  if (!agendamento) {
    throw new Error("Agendamento não encontrado");
  }

  if (agendamento.status === "CANCELADO") {
    throw new Error("Agendamento já está cancelado");
  }

  return prisma.agendamento.update({
    where: { id: agendamentoId },
    data: { status: "CANCELADO" },
  });
}
