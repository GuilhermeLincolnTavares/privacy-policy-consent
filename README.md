# Energy Shield

Módulo de notificação de alterações na política de privacidade. Após o login, o usuário que
ainda não aceitou a versão vigente da política vê um modal com o texto e um botão de
confirmação. O aceite é persistido para que o modal não apareça novamente. No painel
administrativo, uma grid mostra se cada usuário já aceitou os termos, e o administrador pode
ativar ou desativar a exibição da notificação.

**Stack:** Java 21 + Spring Boot 4.2, PostgreSQL 17 e React + Vite + TypeScript.

## Sumário

1. [Visão geral e concepção](#1-visão-geral-e-concepção)
2. [Instalação e configuração](#2-instalação-e-configuração)
3. [Testes](#3-testes)
4. [Estrutura e arquitetura](#4-estrutura-e-arquitetura)
5. [Como estender](#5-como-estender)
6. [Para produção](#6-para-produção)
7. [Fluxo de trabalho](#7-fluxo-de-trabalho)

## 1. Visão geral e concepção

### O que o sistema faz

| Requisito do enunciado | Como foi atendido |
|---|---|
| Modal com o texto dos termos e botão de confirmação | Modal exibido logo após o login, com o título, a versão e o texto da política vigente. |
| Botão para ativar/desativar a notificação | Botão no painel administrativo (**Ativar notificação** / **Desativar notificação**). |
| Verificar se o usuário já aceitou, para evitar notificações repetidas | O aceite é gravado no banco, por usuário e por versão da política. |
| Grid de usuários com o status do aceite | Tabela no painel administrativo com nome, e-mail, perfil, status (**Aceitou** / **Pendente**) e data do aceite. |

### Fluxo

1. O usuário faz login e recebe um token (JWT).
2. O frontend consulta `GET /api/consent/status`.
3. Se `shouldShowModal` for verdadeiro, o modal é exibido e não pode ser fechado sem aceitar.
4. Ao clicar em **Li e aceito**, o frontend chama `POST /api/consent/accept`, o aceite é
   gravado e o modal some.
5. Nos próximos logins o modal não aparece, até que uma nova versão da política seja publicada.
6. O administrador acompanha, na grid, quem aceitou a versão vigente e quando.

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
- **Aceite idempotente.** Clicar duas vezes, ou duas abas aceitando ao mesmo tempo, resulta em
  um único registro. O método `acceptCurrentPolicy` deliberadamente **não** é `@Transactional`:
  no PostgreSQL, uma violação de unicidade aborta a transação inteira, então o serviço trata a
  duplicidade fora de transação e confirma com uma nova leitura que o aceite existe.
- **Login simples, sem cadastro.** Como o foco do teste é a notificação, os usuários de teste
  são criados na inicialização (veja [Usuários de teste](#usuários-de-teste)). A autenticação
  usa JWT (HS256) com expiração de 8 horas, e o perfil (`ADMIN` ou `USER`) vai no token.
- **Token no `localStorage`.** Escolha consciente para simplificar o teste. Veja
  [Para produção](#6-para-produção) para a alternativa mais segura.

### Modelo de dados

```
users  ◄──── privacy_consents ────►  privacy_policies

privacy_settings   (isolada, uma linha global)
```

| Tabela | Papel |
|---|---|
| `users` | Usuários e perfil (`USER` ou `ADMIN`). |
| `privacy_policies` | Versões da política, com a marcação da vigente (`is_current`). Um índice único parcial garante no máximo uma vigente. |
| `privacy_consents` | Quem aceitou qual versão e quando. Par `user_id` + `policy_id` único. |
| `privacy_settings` | Interruptor global da notificação (`notification_enabled`), linha única. |

O schema é criado e versionado pelo Flyway em `backend/src/main/resources/db/migration`.
O Hibernate roda com `ddl-auto: validate`, então só o Flyway altera o banco.

### Endpoints da API

| Método | Caminho | Quem acessa | Função |
|---|---|---|---|
| `POST` | `/api/auth/login` | público | Autentica e devolve o token, o nome e o perfil. |
| `GET` | `/api/consent/status` | autenticado | Informa se o modal deve ser exibido e devolve a política vigente. |
| `POST` | `/api/consent/accept` | autenticado | Registra o aceite da política vigente (`204`). |
| `GET` | `/api/admin/users` | `ADMIN` | Lista usuários com o status do aceite. |
| `GET` | `/api/admin/settings` | `ADMIN` | Consulta se a notificação está ativada. |
| `PUT` | `/api/admin/settings` | `ADMIN` | Ativa ou desativa a notificação. |

Erros seguem o formato `ProblemDetail`: `401` sem login ou com credenciais inválidas, `403`
para quem não é administrador e `404` quando não existe política vigente.

## 2. Instalação e configuração

### Pré-requisitos

- Java 21 ou superior
- Node.js 20.19 ou superior (ou 22.12+)
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

A API sobe em `http://localhost:8080`. Ao iniciar, o Flyway aplica as migrations (que já
criam a política na versão 1 e o interruptor, ligado) e os usuários de teste são criados.

Variáveis de ambiente opcionais:

| Variável | Padrão | Uso |
|---|---|---|
| `DB_URL` | `jdbc:postgresql://localhost:5432/privacy_consent` | Conexão com o banco. |
| `DB_USER` / `DB_PASSWORD` | `consent` / `consent` | Credenciais do banco. |
| `JWT_SECRET` | valor de desenvolvimento | Chave que assina os tokens. **Troque em produção.** |

### Frontend

```bash
cd frontend
npm install
npm run dev
```

A interface sobe em `http://localhost:5173` e conversa com a API em `http://localhost:8080`
(altere com a variável `VITE_API_URL`, se precisar). O backend já libera CORS para a porta
`5173`.

### Usuários de teste

Criados automaticamente na inicialização do backend (se ainda não existirem). A tela de login
também tem botões **Preencher** que preenchem o formulário com cada um.

| Nome | E-mail | Senha | Perfil |
|---|---|---|---|
| Admin | `admin@email.com` | `admin123` | `ADMIN` |
| Maria | `maria@email.com` | `maria123` | `USER` |
| João | `joao@email.com` | `joao123` | `USER` |

## 3. Testes

### Testes automatizados

```bash
# Backend (alguns testes precisam do banco no ar: docker compose up -d)
cd backend
./mvnw test                   # Windows: .\mvnw.cmd test

# Frontend
cd frontend
npm test
```

- **Backend (39 testes):** regras do `ConsentService` com Mockito (cada regra de negócio tem
  teste), um teste de concorrência do aceite contra o banco real, e testes de API com MockMvc
  (autenticação, autorização por perfil e respostas de erro).
- **Frontend (55 testes):** Vitest e Testing Library, com a API simulada. Cobrem login, rotas
  protegidas, modal, painel administrativo e o botão da notificação.

### Roteiro de validação manual

Com banco, backend e frontend no ar:

1. Entre como **Maria**: o modal aparece com a versão 1 da política.
2. Clique em **Li e aceito**: o modal fecha. Recarregue a página ou saia e entre de novo: o
   modal **não** volta.
3. Entre como **Admin**: o modal aparece (o administrador também é um usuário). Aceite.
4. Abra o **Painel administrativo**: a grid mostra Admin e Maria como **Aceitou**, com data,
   e João como **Pendente**.
5. Clique em **Desativar notificação** e entre como **João**: o modal **não** aparece, mesmo
   sem ter aceitado. Os aceites já registrados continuam intactos.
6. Reative a notificação: João volta a ver o modal.
7. Como Maria, tente abrir `http://localhost:5173/admin`: você é redirecionada, porque o
   painel é só do administrador.

### Testar o modal de novo (zerar os aceites)

```bash
docker exec privacy-consent-db psql -U consent -d privacy_consent \
  -c "DELETE FROM privacy_consents;"
```

Todos voltam a ficar **Pendente**. Nenhum usuário, política ou configuração é alterado.

### Testar uma nova versão da política

Publique a versão 2 (a vigente passa a ser a nova, e todos voltam a ver o modal):

```bash
docker exec privacy-consent-db psql -U consent -d privacy_consent -c "
BEGIN;
UPDATE privacy_policies SET is_current = FALSE WHERE is_current;
INSERT INTO privacy_policies (version, title, content, is_current)
VALUES (2, 'Política de Privacidade',
        'Texto da versão 2. Ao clicar em \"Li e aceito\", você confirma que leu e concorda com os termos.',
        TRUE);
COMMIT;"
```

Os aceites da versão 1 continuam no banco, mas valem só para ela, então a grid mostra todos
como **Pendente** até aceitarem a versão 2. Para desfazer o teste:

```bash
docker exec privacy-consent-db psql -U consent -d privacy_consent -c "
BEGIN;
DELETE FROM privacy_consents WHERE policy_id = (SELECT id FROM privacy_policies WHERE version = 2);
DELETE FROM privacy_policies WHERE version = 2;
UPDATE privacy_policies SET is_current = TRUE WHERE version = 1;
COMMIT;"
```

> Esses comandos mexem só nos dados. Nenhuma migration é criada, e o schema não muda.

### Exemplos de chamadas à API

Em Git Bash, Linux ou macOS (no PowerShell, use `curl.exe`). Primeiro, faça login e guarde
o token:

```bash
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"maria@email.com","password":"maria123"}' | sed 's/.*"token":"\([^"]*\)".*/\1/')
```

Consultar se o modal deve aparecer:

```bash
curl -s http://localhost:8080/api/consent/status -H "Authorization: Bearer $TOKEN"
# {"shouldShowModal":true,"policy":{"version":1,"title":"Política de Privacidade","content":"..."}}
```

Aceitar a política (resposta `204`, e repetir a chamada não duplica nada):

```bash
curl -i -X POST http://localhost:8080/api/consent/accept -H "Authorization: Bearer $TOKEN"
```

Conferir que o modal não aparece mais:

```bash
curl -s http://localhost:8080/api/consent/status -H "Authorization: Bearer $TOKEN"
# {"shouldShowModal":false,...}
```

Rotas de administrador exigem o perfil `ADMIN`. Com o token da Maria, a resposta é `403`:

```bash
curl -i http://localhost:8080/api/admin/users -H "Authorization: Bearer $TOKEN"
```

Com o token do administrador (`admin@email.com` / `admin123`):

```bash
curl -s http://localhost:8080/api/admin/users    -H "Authorization: Bearer $ADMIN_TOKEN"
curl -s -X PUT http://localhost:8080/api/admin/settings \
  -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" \
  -d '{"notificationEnabled":false}'
```

## 4. Estrutura e arquitetura

```
privacy-policy-consent/
├── backend/             API Spring Boot
├── frontend/            Interface React
├── docker-compose.yml   PostgreSQL
├── CLAUDE.md            Diretrizes de desenvolvimento
└── README.md
```

### Backend

Camadas clássicas do Spring, organizadas por funcionalidade (pacotes `consent`, `policy`,
`settings`, `user`, `auth`, `admin`):

```
controller  →  service  →  repository  →  banco
```

- **Controller:** recebe a requisição, valida a entrada e devolve a resposta.
- **Service:** concentra a regra de negócio, como a decisão de exibir o modal.
- **Repository:** acesso ao banco com Spring Data.
- **DTOs (`record`):** o que entra e sai pela API. As entidades JPA não são expostas.

### Frontend

Organizado por tipo de arquivo, em `frontend/src`:

| Pasta | Conteúdo |
|---|---|
| `pages/` | Telas: login, início e painel administrativo. |
| `components/` | Peças de interface: modal, grid, botão, campos, selos e ícones. |
| `hooks/` | Acesso aos dados (TanStack Query) e à sessão. |
| `services/` | Chamadas à API (axios) e armazenamento da sessão. |
| `context/` | Estado de autenticação. |
| `types/` | Tipos das respostas da API. |

Leituras usam `useQuery`, escritas usam `useMutation`, e o aceite invalida as consultas do
status e da grid, para a lista do administrador não ficar desatualizada. O modal usa
Headless UI (`Dialog`), que cuida do foco e da acessibilidade, e o estilo é Tailwind. Os
componentes e hooks são funções de seta.

### Decisões de arquitetura

- **Por que não arquitetura hexagonal?** Ela isola o domínio de detalhes externos por meio de
  portas e adaptadores, o que compensa com várias integrações trocáveis ou um domínio
  complexo. Aqui há quatro tabelas, uma regra central e um único banco, então as interfaces e
  os mapeamentos extras só aumentariam o código. A regra fica isolada em `ConsentService`, o
  que já permite trocar a interface ou o login sem alterá-la, e a evolução para hexagonal
  continua possível.
- **Por que não Atomic Design no frontend?** É uma metodologia pensada para design systems
  com muitos componentes reutilizáveis. O frontend tem poucas telas (login, modal e grid
  administrativa), então uma organização simples por tipo de arquivo é mais legível.
- **Por que um modal que não fecha?** O enunciado fala em um "botão de confirmação", então
  o aceite é a única saída: sem `Esc`, sem clique fora e sem botão de fechar.

## 5. Como estender

### Quem publica uma nova versão da política?

Nesta entrega, a publicação é **operacional**: uma nova versão é inserida em
`privacy_policies` (SQL, como no passo a passo de [Testar uma nova versão da
política](#testar-uma-nova-versão-da-política)) e passa a ser a vigente. O sistema então volta
a exibir o modal para todos e marca todos como **Pendente** no painel. Uma tela para o
administrador editar e publicar versões **não foi construída de propósito**, para manter o
escopo no que o enunciado pede. A estrutura já suporta isso: o aceite é gravado por usuário e
por versão, e só uma política pode ser a vigente.

### Próximos passos

- **Editor de termos no painel:** formulário para o administrador criar e publicar uma versão,
  trocando a vigente na mesma transação. Basta um novo endpoint em `admin` que reutilize as
  regras já existentes.
- **Histórico de versões:** listar versões anteriores e, na grid, mostrar a versão que cada
  usuário aceitou (os dados já existem em `privacy_consents`).
- **Outros tipos de aviso:** o modelo `privacy_settings` + `ConsentService` pode ganhar um
  campo de tipo de notificação, reaproveitando o modal e a grid.
- **Refresh token e logout no servidor**, para sessões mais longas e revogáveis.

## 6. Para produção

Pontos deliberadamente simplificados para o teste:

- **`JWT_SECRET`:** o valor padrão é só para desenvolvimento. Defina uma chave longa e
  aleatória por variável de ambiente.
- **Token no `localStorage`:** é simples, mas fica exposto a roubo se houver falha de XSS. Em
  produção, o ideal é um cookie `HttpOnly` com `SameSite` e proteção contra CSRF.
- **Usuários de teste:** o `TestUsersSeeder` existe só para facilitar a avaliação e deve ser
  removido.
- **HTTPS e CORS:** servir tudo sob HTTPS e restringir o CORS ao domínio real.
- **Credenciais do banco:** trocar `consent` / `consent` e não expô-las.

## 7. Fluxo de trabalho

- `main`: versão estável.
- `dev`: integração.
- `feat/*` (e `docs/*`): uma branch por mudança, mesclada na `dev` por pull request.
- Commits no padrão Conventional Commits, em inglês.
