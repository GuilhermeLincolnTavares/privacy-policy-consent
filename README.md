# Privacy Policy Consent

Módulo de notificação de alterações na política de privacidade. Após o login, o usuário que
ainda não aceitou a versão vigente da política vê um modal com o texto e um botão de
confirmação. O aceite é persistido para que o modal não apareça novamente. No painel
administrativo, uma grid mostra se cada usuário já aceitou os termos, e o administrador pode
ativar ou desativar a exibição da notificação.

> **Status:** em desenvolvimento. As seções marcadas como _a preencher_ serão completadas
> junto com cada funcionalidade.

## Sumário

1. [Visão geral e concepção](#1-visão-geral-e-concepção)
2. [Instalação e configuração](#2-instalação-e-configuração)
3. [Testes](#3-testes)
4. [Estrutura e arquitetura](#4-estrutura-e-arquitetura)
5. [Como estender](#5-como-estender)
6. [Fluxo de trabalho](#6-fluxo-de-trabalho)

## 1. Visão geral e concepção

**Stack:** Java 21 + Spring Boot 4.2 (Maven), PostgreSQL 17 (Docker Compose), Flyway,
React + Vite + TypeScript.

### Decisões de concepção

- **Política versionada.** Cada versão da política é uma linha em `privacy_policies`, e só uma
  é a vigente. Quando uma nova versão é publicada, todos os usuários voltam a ser notificados,
  sem que nenhum dado precise ser alterado.
- **Aceite por versão.** `privacy_consents` liga usuário e versão da política e guarda a data
  do aceite. O par usuário + política é único, então aceitar duas vezes não duplica o registro
  e o histórico é preservado.
- **Botão de ativar/desativar.** O enunciado não define quem usa o botão. Foi interpretado como
  um interruptor do **administrador**, global, que controla se o modal é exibido. Com ele
  desligado, ninguém vê a notificação, mas o status de aceite não é alterado. O interruptor
  fica em `privacy_settings` (uma única linha), separado das políticas, para continuar
  desligado quando uma nova versão for publicada.
- **Regra do modal.** O modal aparece quando a notificação está ligada **e** o usuário não
  aceitou a versão vigente. O status só vira "aceito" quando o usuário aceita.

### Modelo de dados

```
users  ◄──── privacy_consents ────►  privacy_policies

privacy_settings   (isolada, uma linha global)
```

| Tabela | Papel |
|---|---|
| `users` | Usuários e perfil (`USER` ou `ADMIN`). |
| `privacy_policies` | Versões da política, com a marcação da vigente (`is_current`). |
| `privacy_consents` | Quem aceitou qual versão e quando. Par `user_id` + `policy_id` único. |
| `privacy_settings` | Interruptor global da notificação (`notification_enabled`), linha única. |

O schema é criado e versionado pelo Flyway em `backend/src/main/resources/db/migration`.

## 2. Instalação e configuração

### Pré-requisitos

- Java 21 ou superior
- Node.js 20 ou superior
- Docker e Docker Compose

### Banco de dados

```bash
docker compose up -d
docker compose ps        # o status deve ser "healthy"
```

Configuração do banco (usada por padrão pelo backend):

| Item | Valor |
|---|---|
| Host / porta | `localhost:5432` |
| Banco | `privacy_consent` |
| Usuário / senha | `consent` / `consent` |

Quem não usar Docker pode instalar o PostgreSQL e criar o banco `privacy_consent` com esse
usuário e senha. Os valores podem ser trocados pelas variáveis `DB_URL`, `DB_USER` e
`DB_PASSWORD`.

### Backend

```bash
cd backend
./mvnw spring-boot:run        # Windows: .\mvnw.cmd spring-boot:run
```

A API sobe em `http://localhost:8080`. Ao iniciar, o Flyway aplica as migrations.

### Frontend

_A preencher._

### Usuários de teste

_A preencher (serão criados junto com a autenticação)._

## 3. Testes

_A preencher: como rodar os testes automatizados, o roteiro de validação manual e os exemplos
de chamadas à API._

## 4. Estrutura e arquitetura

```
privacy-policy-consent/
├── backend/             API Spring Boot
├── frontend/            Interface React
├── docker-compose.yml   PostgreSQL
├── CLAUDE.md            Diretrizes de desenvolvimento
└── README.md
```

### Arquitetura adotada

Camadas clássicas do Spring, organizadas por funcionalidade:

```
controller  →  service  →  repository  →  banco
```

- **Controller:** recebe a requisição, valida a entrada e devolve a resposta.
- **Service:** concentra a regra de negócio, como a decisão de exibir o modal.
- **Repository:** acesso ao banco com Spring Data.
- **DTOs (`record`):** o que entra e sai pela API. As entidades JPA não são expostas.

### Decisões de arquitetura

- **Por que não arquitetura hexagonal?** Ela isola o domínio de detalhes externos por meio de
  portas e adaptadores, o que compensa com várias integrações trocáveis ou um domínio
  complexo. Aqui há quatro tabelas, uma regra central e um único banco, então as interfaces e
  os mapeamentos extras só aumentariam o código. A regra fica isolada em `ConsentService`, o
  que já permite trocar a interface ou o login sem alterá-la, e a evolução para hexagonal
  continua possível.
- **Por que não Atomic Design no frontend?** É uma metodologia pensada para design systems
  com muitos componentes reutilizáveis. O frontend tem poucas telas (login, modal e grid
  administrativa), então foi organizado por funcionalidade, mantendo o código de cada uma
  junto.

## 5. Como estender

_A preencher: publicar uma nova versão da política, adicionar outro tipo de notificação._

## 6. Fluxo de trabalho

- `main`: versão estável.
- `dev`: integração.
- `feat/*`: uma branch por funcionalidade, mesclada na `dev` por pull request.
- Commits no padrão Conventional Commits, em inglês.
