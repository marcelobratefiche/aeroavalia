# AeroAvalia — Sistema de Avaliação de Passageiros

Site em Next.js 15 (App Router) + NextAuth (Google) + Prisma/PostgreSQL, com
painel administrativo protegido. Todo o texto voltado ao usuário está em
português (Brasil).

## O que já está pronto no código

- Avaliação por estrelas (1–5), cartão estilo "cartão de embarque", com
  botão "Enviar avaliação" que só aparece após escolher uma nota.
- Após enviar a nota, botão opcional "Enviar feedback" abre um modal para
  comentário livre.
- Login obrigatório com Google **apenas para obter o nome de exibição** —
  o e-mail nunca é salvo nem exibido em nenhuma tela ou registro de
  avaliação (ele só passa, momentaneamente, pelo token do servidor para
  checar se quem entrou é um administrador).
- Cada envio é salvo no Postgres com: nome, nota, feedback (opcional),
  data/hora e um ID único.
- Painel `/admin`, protegido por middleware + verificação de e-mail em
  cada rota de API, lista as avaliações em formato compacto
  ("Nome — ★★★★★"), com paginação, e abre o detalhe completo ao clicar.
- Loading screen com avião voando, usada nos momentos reais de espera
  (enviando avaliação, carregando o painel), não em toda navegação.
- Proteção simples contra clique duplo (bloqueio de 30s por conta Google
  no backend, além de desabilitar o botão no front).
- Responsivo (mobile, tablet, desktop).

## O que você precisa configurar (não está e não pode estar no código)

### 1. Banco de dados PostgreSQL
Crie um banco gratuito em um destes provedores (qualquer um funciona bem
com Vercel):
- Neon (neon.tech) — recomendado, plano gratuito generoso
- Vercel Postgres
- Supabase

Copie a connection string para `DATABASE_URL` (e `DIRECT_URL`, se o
provedor separar URL com pooling da URL direta — a Neon fornece as duas).

### 2. Credenciais do Google OAuth
1. Acesse o Google Cloud Console → APIs & Services → Credentials.
2. Crie um projeto (ou use um existente) → **Create Credentials → OAuth
   client ID** → tipo **Web application**.
3. Em **Authorized redirect URIs**, adicione:
   `https://SEU-DOMINIO-FINAL/api/auth/callback/google`
   (troque pelo domínio real depois do deploy; para testar localmente
   adicione também `http://localhost:3000/api/auth/callback/google`).
4. Copie o **Client ID** e **Client Secret** para `AUTH_GOOGLE_ID` e
   `AUTH_GOOGLE_SECRET`.
5. Na tela "OAuth consent screen", os escopos usados são apenas
   `openid`, `email` e `profile` — o mínimo necessário (o e-mail é usado
   só para identificar administradores, nunca salvo em avaliações).

### 3. Segredo do NextAuth
Rode `npx auth secret` (ou gere qualquer string aleatória longa) e
coloque em `AUTH_SECRET`.

### 4. Lista de administradores
Em `ADMIN_EMAILS`, coloque os e-mails do(s) Google que devem poder abrir
`/admin`, separados por vírgula. Só essas contas conseguem acessar o
painel — qualquer outra pessoa que descubra a URL `/admin` recebe uma
tela de acesso negado.

Copie `.env.example` para `.env.local` (desenvolvimento local) e
preencha tudo isso.

## Deploy (recomendado: Vercel)

1. Suba este projeto para um repositório no GitHub.
2. Em vercel.com, "Add New Project" → importe o repositório.
3. Em **Environment Variables**, adicione todas as variáveis do
   `.env.example` com os valores reais.
4. Deploy. O Vercel roda `npm install` → `postinstall` (gera o Prisma
   Client) → `npm run build` (que também roda `prisma generate`).
5. Depois do primeiro deploy, rode a migração do schema no banco:
   ```
   # localmente, apontando DATABASE_URL/DIRECT_URL para o banco de produção
   npx prisma db push
   ```
6. Volte ao Google Cloud Console e confirme que o redirect URI usa o
   domínio real gerado pela Vercel (ou seu domínio customizado).

## Rodando localmente

```
npm install
cp .env.example .env.local   # preencha com valores reais
npx prisma db push           # cria as tabelas no banco configurado
npm run dev
```

Abra http://localhost:3000.

## Gerando o QR code (depois do deploy)

```
npm run qr -- https://sua-url-real-de-producao
```

Isso cria `qr-aeroavalia.png` na raiz do projeto, apontando para a URL
real do site. Rode este comando você mesmo (ou me envie a URL final
aqui no chat e eu gero o arquivo para você).

## Onde os dados ficam armazenados

Tabela `Submission` no seu banco PostgreSQL (schema em
`prisma/schema.prisma`): `id`, `displayName`, `googleSub` (identificador
técnico do Google, nunca exibido, usado só para evitar envios
duplicados), `rating`, `feedback`, `createdAt`. Nenhum e-mail de
passageiro é armazenado.

## Checklist de testes antes de considerar pronto

- [ ] Selecionar cada nota de 1 a 5 estrelas
- [ ] Enviar avaliação sem feedback
- [ ] Enviar avaliação e depois adicionar feedback
- [ ] Confirmar que os dados aparecem no banco (`npx prisma studio`)
- [ ] Abrir `/admin` deslogado → deve pedir login
- [ ] Abrir `/admin` logado com conta fora de `ADMIN_EMAILS` → acesso negado
- [ ] Abrir `/admin` logado com conta em `ADMIN_EMAILS` → lista aparece
- [ ] Clicar em uma avaliação → ver detalhe completo
- [ ] Testar em largura de tela mobile
- [ ] Conferir textos em português em todas as telas
- [ ] Gerar o QR code com a URL final e escanear com o celular
