# COMP-PUBLIC-DNA-01 Report

Data: 2026-05-17

## Escopo

Sprint focada em fechar a limpeza da pagina publica de torneio, separando leitura publica de operacao do organizador e removendo duplicidade no filtro de classe.

## Entrega

- `Evento`, `Inscritos`, `Jogos`, `Classificacao` e `Chat` funcionam como abas reais.
- `Classificacao` permanece visivel somente quando existe tabela de grupos publicada.
- `Categorias` nao aparece como aba publica independente.
- O filtro de classe aparece apenas nas abas que precisam do recorte.
- O filtro de classe nao duplica controles:
  - ate 6 classes: chips horizontais;
  - mais de 6 classes: select unico.
- Podio/encerramento fica em `Evento` apenas apos torneio finalizado.
- Exportacao de chave aparece quando existe chaveamento.

## Impacto UX

- Jogador/visitante nao cai em cockpit de organizador.
- Torneios com muitas classes continuam navegaveis.
- Mobile reduz densidade e evita seletor duplicado.
- Organizacao continua acessivel no workspace proprio.

## Validacao

- `git diff --check -- web/src/pages/TournamentPage.tsx`
- `npm.cmd run lint`
- `npm.cmd run build`
