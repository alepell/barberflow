# BarberBook — Sistema de Agendamento de Barbearia

## Visão Geral

Sistema web de agendamento para barbearia com duas áreas distintas:

- **Cliente**: cria conta, visualiza disponibilidade e agenda horários.
- **Barbeiro (Admin)**: gerencia agenda, visualiza agendamentos do dia/semana, bloqueia horários.

Versão de produção (v1) é considerada funcional quando ambas as áreas estiverem operacionais com autenticação segura e o fluxo de agendamento completo funcionando end-to-end.

---

## Stack

- **Framework**: Next.js 16.2 (App Router)
- **Banco de Dados**: PostgreSQL
- **ORM**: Prisma
- **Autenticação**: NextAuth.js v5 (Auth.js) — email/senha + Google OAuth
- **Testes**: Vitest + Testing Library (apenas lógica, sem testes de componentes visuais)
- **Linter**: ESLint + Prettier
- **CI**: GitHub Actions

---

## Arquitetura

```
/app
  /(auth)           → páginas de login e cadastro
  /(cliente)        → área autenticada do cliente
    /dashboard      → agendamentos do cliente
    /novo           → fluxo de novo agendamento
  /(admin)          → área restrita ao barbeiro
    /dashboard      → visão geral da agenda
    /agenda         → gerenciamento de horários
  /api
    /auth           → endpoints do NextAuth
    /agendamentos   → CRUD de agendamentos
    /horarios       → gerenciamento de disponibilidade

/lib
  /auth.ts          → configuração do NextAuth
  /prisma.ts        → instância do Prisma client
  /validations/     → schemas Zod de validação

/services           → lógica de negócio isolada (testável)
  /agendamento.ts
  /disponibilidade.ts
  /usuario.ts

/tests
  /services/        → testes unitários das regras de negócio
  /api/             → testes de integração dos endpoints
```

### Módulos principais

- **Auth**: Autenticação via NextAuth com providers Email/Senha e Google. Separação de roles: `CLIENTE` e `ADMIN`.
- **Agendamento**: Criação, listagem, cancelamento e confirmação de agendamentos. Um horário só pode ter um agendamento ativo.
- **Disponibilidade**: O admin define os horários disponíveis por dia da semana. Horários já agendados ficam bloqueados para novos clientes.
- **Usuário**: Cadastro, perfil básico, associação de role.

---

## Variáveis de Ambiente

```env
# Banco de dados
DATABASE_URL=postgresql://user:password@localhost:5432/barberbook

# NextAuth
NEXTAUTH_SECRET=       # string aleatória longa e segura
NEXTAUTH_URL=          # http://localhost:3000 em dev

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Email (para magic link / recuperação de senha — opcional na v1)
EMAIL_SERVER_HOST=
EMAIL_SERVER_PORT=
EMAIL_SERVER_USER=
EMAIL_SERVER_PASSWORD=
EMAIL_FROM=
```

---

## Fluxos Principais (Escopo v1)

### 1. Autenticação

- Cadastro com email e senha
- Login com email e senha
- Login/cadastro via Google OAuth
- Proteção de rotas por role (middleware Next.js)

### 2. Agendamento (Cliente)

- Visualizar horários disponíveis
- Selecionar data e horário
- Confirmar agendamento
- Visualizar e cancelar agendamentos próprios

### 3. Gestão de Agenda (Admin)

- Visualizar todos os agendamentos por data
- Confirmar ou cancelar agendamento de um cliente
- Bloquear/desbloquear horários específicos

---

## Fora do Escopo da v1

- Pagamento online
- Notificações por email/SMS
- Múltiplos barbeiros / funcionários
- Avaliações e reviews
- App mobile nativo
- Painel de analytics

---

## Regras de Desenvolvimento

### TDD — Não Negociável

- Testes **sempre** antes da implementação
- Cobertura obrigatória: happy path + erros esperados + edge cases
- **Apenas lógica**: services, validações, API handlers
- **Sem testes de componentes visuais** (sem render, sem snapshot)
- Nenhuma feature é considerada pronta sem testes passando

### Desenvolvimento Modular

- Cada feature é desenvolvida em etapas pequenas e atômicas
- Ao final de cada módulo, o agente para e aguarda aprovação antes de prosseguir
- Nenhum módulo começa antes do anterior estar aprovado e com CI verde

### Commits

- Um commit = uma coisa
- Formato: `feat: descrição cursa` / `fix: ...` / `refactor: ...` / `test: ...`
- **Nenhum commit com testes falhando** — o agente deve verificar e corrigir antes de commitar

---

## Checklist Pré-Commit

```
[ ] Todos os testes passando (vitest run)
[ ] Linter sem erros (eslint . --max-warnings 0)
[ ] Prettier aplicado (prettier --check .)
[ ] Sem variáveis de ambiente hardcoded no código
[ ] Sem console.log esquecido
[ ] Sem warnings de segurança (npm audit)
```

---

## Configuração de CI (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "20" }
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm audit --audit-level=high
```

Tempo alvo: < 60 segundos. CI quebrado = bloqueio total.

---

## Ordem de Implementação (Módulos)

```
Módulo 0 — Setup do Projeto
  → Next.js + Prisma + PostgreSQL + ESLint + Prettier + Vitest
  → Schema inicial do banco (User, Agendamento, HorarioDisponivel)
  → CI configurado e verde

Módulo 1 — Autenticação
  → NextAuth com Email/Senha
  → NextAuth com Google OAuth
  → Roles: CLIENTE e ADMIN
  → Middleware de proteção de rotas
  ⏸ AGUARDA APROVAÇÃO

Módulo 2 — Agendamento (Cliente)
  → Serviço de disponibilidade (listar horários livres)
  → Serviço de criação de agendamento
  → Serviço de cancelamento pelo cliente
  → API routes correspondentes
  ⏸ AGUARDA APROVAÇÃO

Módulo 3 — Gestão de Agenda (Admin)
  → Listagem de agendamentos por data
  → Confirmação/cancelamento pelo admin
  → Bloqueio de horários
  → Proteção por role ADMIN
  ⏸ AGUARDA APROVAÇÃO

Módulo 4 — Interface (páginas e componentes)
  → Apenas após toda lógica aprovada e testada
  ⏸ AGUARDA APROVAÇÃO
```

---

## Common Hurdles

_(preencher conforme problemas forem encontrados durante o desenvolvimento)_

---

## Design Patterns do Projeto

_(preencher conforme decisões de arquitetura forem tomadas)_

---

## Métricas de Saúde do Projeto

| Métrica               | Saudável     | Atenção                     |
| --------------------- | ------------ | --------------------------- |
| Commits/dia           | > 5 atômicos | Commits grandes e espaçados |
| Ratio teste/código    | > 1.0x       | < 0.5x                      |
| Maior arquivo         | < 300 LOC    | > 500 LOC                   |
| CI tempo              | < 60s        | > 3min                      |
| Warnings de segurança | 0            | Qualquer número             |
| Testes falhando       | 0            | Qualquer número             |

---

## Resumo

> **Você (dev) decide o quê. O agente decide o como. Testes validam a lógica. CI é o árbitro. Nenhum módulo avança sem aprovação explícita.**
