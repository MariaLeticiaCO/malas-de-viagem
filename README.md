# 🧳 Malas de Viagem

App simples de lista de viagem em grupo.

- Cada pessoa entra só com o **nome**, escolhe a **cor da mala** e cai direto na sua lista.
- Uma única tela com as malas de todos. Clique numa mala para ver a lista.
- **Mala geral**: itens que todo mundo precisa — qualquer pessoa adiciona e marca.
- Listas em checkbox, separadas por áreas (Roupas, Banho & Cama, Alimentos, Eletrônicos & Eletrodomésticos, Limpeza…), com sugestões rápidas.
- Todos veem a mala de todos; só o dono edita a sua.
- **Roteiro (mapa do tesouro)**: a aba abre com um pergaminho se desenrolando. Um **dono do rolê** (com coroa na mala) monta e edita as paradas por dia e horário; todos veem e avaliam cada parada de 1 a 5 estrelas.
- **App no celular (PWA)**: em `/instalar`, qualquer pessoa instala grátis no Android ou iPhone.

## Stack
Next.js (App Router) · React · TypeScript · Tailwind CSS · Motion · SWR · Upstash Redis (Vercel Marketplace)

## Banco de dados
Na Vercel, conecte um banco **Upstash Redis** ao projeto (Storage → Create → Upstash Redis).
O app lê `KV_REST_API_URL`/`KV_REST_API_TOKEN` (ou `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN`).
Sem essas variáveis (ex.: localmente) ele usa memória e os dados somem ao reiniciar.

## Rodar localmente
```bash
npm install
npm run dev
```
