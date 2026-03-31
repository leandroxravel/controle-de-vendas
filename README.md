# Vendas Control - Gestão de Vendas de Veículos (Cloudflare + Firebase Edition)

Bem-vindo ao sistema de controle corporativo de vendas. Este software foi atualizado para uma arquitetura baseada em **Next.js (App Router)** com **React Server Components**, **Tailwind CSS** e **Firebase Firestore** como banco de dados NoSQL, totalmente hospedável no **Cloudflare Pages**.

## Requisitos
- **Node.js**: v18+

## Como Rodar Localmente

### 1. Instalar as Dependências do Projeto
No terminal, certifique-se de estar na pasta do projeto e rode:
```bash
npm install
```

### 2. Configurar o Firebase
Crie um projeto no Firebase (https://console.firebase.google.com/) e habilite o **Firestore Database**.
Crie um arquivo `.env` ou `.env.local` na raiz do projeto com as suas credenciais:

```env
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSy..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="seu-projeto.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="seu-projeto"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="seu-projeto.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789"
NEXT_PUBLIC_FIREBASE_APP_ID="1:1234:web:xxyyzz"
NEXTAUTH_SECRET="sua-chave-secreta-jwt-aqui"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Criar Usuário Inicial (Seed Manual)
Como trocamos para NoSQL (Firestore), o seed manual pode ser feito diretamente no painel do Firestore ou via uma rota temporária. Crie um documento na coleção `users` com as credenciais iniciais para poder fazer login.
Estrutura recomendada:
- `email`: "admin@admin.com"
- `name`: "Administrador"
- `roleName`: "Administrador"
- `status`: true
- `passwordHash`: (Hash bcrypt gerado de "admin123" ou a senha que preferir - você pode usar ferramentas online de bcryptjs para gerar: `$2a$10$e.wS5i6bSGHgH2.2Z71QjOzFqWwH3hL07qLh5uOWqD9B8wXzqyvXy`)

### 4. Rodar a Aplicação Localmente
```bash
npm run dev
```
Acesse `http://localhost:3000`.

---

## ☁️ Como Fazer o Deploy no Cloudflare Pages

Já instalamos e configuramos o `@cloudflare/next-on-pages`.
Siga este passo a passo:

### 1. Autenticar no Wrangler (CLI do Cloudflare)
```bash
npx wrangler login
```

### 2. Adicionar Variáveis de Ambiente no Cloudflare
Acesse o Dashboard da Cloudflare (Workers & Pages), crie um novo projeto Pages baseado no seu código (ou interligado com o GitHub).
Nas opções de **Settings -> Environment variables**, insira TODAS as chaves de configuração do `.env` (credenciais do Firebase e chaves do NextAuth).

### 3. Deploy Local / Manual com CLI
Você pode gerar o build localmente e publicar:
```bash
npx @cloudflare/next-on-pages
npx wrangler pages deploy .vercel/output/static
```

*OBS:* Lembre-se que certas regras de segurança do Firebase precisam ser configuradas no console web do Firestore para garantir que ninguem acesse a coleção `users` diretamente via client-side sem autorização.
