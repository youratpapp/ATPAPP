# Tenis Monorepo

Estrutura profissional para evoluir o sistema em Web + Mobile com base compartilhada.

## Estrutura

- `apps/web`: React + TypeScript + Vite
- `apps/mobile`: Expo + React Native + TypeScript
- `packages/shared`: tipos e regras de negocio compartilhadas
- `index.html`: legado (mantido durante migracao)

## Comandos (na raiz)

- `npm run dev:web`: roda frontend web
- `npm run build:web`: build de producao web
- `npm run dev:mobile`: inicia Expo
- `npm run android`: abre no Android
- `npm run ios`: abre no iOS (macOS)
- `npm run web:mobile`: roda versao web do app Expo
- `npm run typecheck`: valida shared + build web

## Deploy no GitHub Pages

Ja existe workflow pronto em `.github/workflows/deploy-pages.yml`.

1. Suba o projeto em um repositorio GitHub com branch `main`.
2. No GitHub: `Settings > Pages > Build and deployment > Source` selecione `GitHub Actions`.
3. A cada push na `main`, o deploy roda automatico.

Base path:
- repositorio normal (`usuario/repositorio`): publica em `https://usuario.github.io/repositorio/`
- repositorio `usuario.github.io`: publica em `https://usuario.github.io/`

## Supabase (obrigatorio)

No painel do Supabase, configure em `Authentication > URL Configuration`:

- Site URL:
  - `https://usuario.github.io/repositorio/` (ou sua URL final)
- Redirect URLs:
  - `https://usuario.github.io/repositorio/*`
  - `https://usuario.github.io/repositorio/legacy/index.html*`

Se usar dominio customizado, adicione tambem as URLs do dominio.
