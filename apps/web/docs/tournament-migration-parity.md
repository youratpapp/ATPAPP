# Tournament Migration Parity (HTML -> React/TypeScript)

## Goal
Portar a lógica completa do `backup/index.html` para a stack atual (`React + TypeScript + Supabase`) sem simplificações funcionais.

## Source of Truth
- Arquivo legado: `backup/index.html` (4.326 linhas)
- Núcleo identificado:
  - Estado/configuração: `createInitialState`, `normalize*`, `sync*`
  - Cadastro: categorias, classes, participantes, entradas
  - Geração: grupos, round-robin, mata-mata, avanços
  - Agenda: slots, quadras, restrições semi/final, alocação
  - Partidas: placares, fechamento, recomputação
  - Classificação: `calcTabelaGrupo`, tabelas por grupo
  - Operações: reset parcial/total, exportações, backup/restore
  - Wizard: etapas, validações e guia de setup
  - Cloud: sync Supabase para torneios e inscrições

## Migration Strategy
1. **Core Engine (TS puro, sem UI)**
   - Portar funções de geração/classificação/mata-mata/agenda mantendo regras 1:1.
   - Arquivo: `src/tournament-engine/core.ts`.
2. **State Adapter (TS)**
   - Converter shape legado de `data` para tipos estáveis da engine.
   - Arquivo: `src/tournament-engine/state-adapter.ts`.
3. **Supabase Adapter**
   - Unificar leitura/escrita de `tournaments`, `tournament_members`, `tournament_registrations`.
   - Arquivo: `src/tournament-engine/repository.ts`.
4. **UI por domínio (React)**
   - Organização (wizard + config + categorias)
   - Inscrições
   - Agenda
   - Partidas
   - Classificação
   - Operações e exportações
5. **Parity Checklist**
   - Validar cada função/macrofluxo contra comportamento do HTML antigo.

## Work In Progress (this commit)
- Core algorithms migrados para TS:
  - `buildRoundRobin`
  - `splitIntoGroups`
  - `buildKnockout`
  - `recomputeKnockout`
  - `calcTabelaGrupo`
  - `gerarClasseData`
  - utilitários de normalização e configuração

## Non-Regression Rules
- Não remover etapas do wizard.
- Não remover modos de configuração (`grupos`, `mata_mata`, `sorteioDuplas`, etc).
- Não remover regras de agenda e restrição de quadras por fase.
- Não remover operações de reset/export sem equivalentes.
- Não trocar regras de classificação/critério de desempate.
