# Tournament Migration Parity (HTML -> React/TypeScript)

## Goal
Portar a logica completa do `backup/index.html` para a stack atual (`React + TypeScript + Supabase`) sem simplificacoes funcionais.

## Source of Truth
- Arquivo legado: `backup/index.html` (4.326 linhas)
- Nucleo identificado:
  - Estado/configuracao: `createInitialState`, `normalize*`, `sync*`
  - Cadastro: categorias, classes, participantes, entradas
  - Geracao: grupos, round-robin, mata-mata, avancos
  - Agenda: slots, quadras, restricoes semi/final, alocacao
  - Partidas: placares, fechamento, recomputacao
  - Classificacao: `calcTabelaGrupo`, tabelas por grupo
  - Operacoes: reset parcial/total, exportacoes, backup/restore
  - Wizard: etapas, validacoes e guia de setup
  - Cloud: sync Supabase para torneios e inscricoes

## Migration Strategy
1. **Core Engine (TS puro, sem UI)**
   - Portar funcoes de geracao/classificacao/mata-mata/agenda mantendo regras 1:1.
   - Arquivo: `src/tournament-engine/core.ts`.
2. **State Adapter (TS)**
   - Converter shape legado de `data` para tipos estaveis da engine.
   - Arquivo: `src/tournament-engine/state-adapter.ts`.
3. **Supabase Adapter**
   - Unificar leitura/escrita de `tournaments`, `tournament_members`, `tournament_registrations`.
   - Arquivo: `src/tournament-engine/repository.ts`.
4. **UI por dominio (React)**
   - Organizacao (wizard + config + categorias)
   - Inscricoes
   - Agenda
   - Partidas
   - Classificacao
   - Operacoes e exportacoes
5. **Parity Checklist**
   - Validar cada funcao/macrofluxo contra comportamento do HTML antigo.

## Work In Progress (this commit)
- Core algorithms migrados para TS:
  - `buildRoundRobin`
  - `splitIntoGroups`
  - `buildKnockout`
  - `recomputeKnockout`
  - `calcTabelaGrupo`
  - `gerarClasseData`
  - utilitarios de normalizacao e configuracao
- Tournament page React/TS com edicao de placar em grupos e mata-mata:
  - recomputacao imediata de classificacao e avanco de chave
  - persistencia em `tournaments.data`
- Agenda migrada para TS (`src/tournament-engine/agenda.ts`):
  - configuracao de dias/quadras/duracao
  - restricoes de semifinal/final por dia e por quadra
  - geracao e alocacao de partidas em slots
  - validacao e resumo do wizard
- Organizacao no React:
  - wizard funcional de setup (etapas e validacoes)
  - editor completo de categorias/classes/participantes (CRUD)
  - cadastro de atletas um a um com telefone/grupo por classe
  - importacao por lista (linhas com `;`, incluindo criacao automatica de categoria/classe)
  - configuracao de classe (formato, tipo, grupos, classificados, modo de duplas)
  - geracao de classe no fluxo React/TS
  - geracao em lote de campeonatos com validacao de agenda
  - operacoes de reset (apenas sorteio/partidas e reset total com confirmacao)
  - painel completo de agenda
  - resumo e preview de agenda por slot
- Exportacoes/operacoes migradas:
  - exportacao de lista de quadras (HTML para impressao)
  - exportacao visual da chave em PNG (classe ativa)
  - exportacao visual da chave mata-mata em PNG
  - backup/restore em JSON
  - envio de resumo estruturado para WhatsApp
  - salvamento unificado de toda configuracao (categorias + agenda)
- Autoinscricao por link migrada:
  - geracao/copia de link por classe para o proprio atleta se inscrever
  - nova rota `/inscricao/:tournamentId` para solicitar inscricao
  - painel no organizador para aprovar/rejeitar solicitacoes pendentes
  - filtros por status e aprovacao/rejeicao em lote das solicitacoes
- Navegacao de eventos corrigida para fluxo SPA (`navigate`) sem reload de hash.
- Botao de fallback "Modo completo" removido da pagina principal de torneio.
- Evolucao da tela de eventos (`/eventos`) iniciada:
  - cards mais ricos com papel (organizador/participante), visibilidade e status textual
  - KPIs de torneios (total, organizando, participando, inscricoes abertas, em andamento, concluidos)
  - filtros de busca, status, visibilidade e ordenacao

## Non-Regression Rules
- Nao remover etapas do wizard.
- Nao remover modos de configuracao (`grupos`, `mata_mata`, `sorteioDuplas`, etc).
- Nao remover regras de agenda e restricao de quadras por fase.
- Nao remover operacoes de reset/export sem equivalentes.
- Nao trocar regras de classificacao/criterio de desempate.
