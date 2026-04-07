import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { cadastroSchema, type CadastroInput } from "@/lib/validations/usuario";

export async function criarUsuario(input: CadastroInput) {
  const data = cadastroSchema.parse(input);

  const existente = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existente) {
    throw new Error("Email já cadastrado");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
    },
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export async function buscarUsuarioPorEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}

export async function buscarUsuarioPorId(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
    },
  });
}
