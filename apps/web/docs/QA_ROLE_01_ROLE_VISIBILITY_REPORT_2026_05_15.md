# QA-ROLE-01 - Role Visibility Report

Data: 2026-05-15

Sprint: `QA-ROLE-01 - Teste manual por papel`

## Objetivo

Validar se a separacao recente entre Player App, Competition OS e Management OS funciona por papel real, sem expor operacao errada para jogador, aluno, professor, recepcao, financeiro, organizador e gestor.

## Fontes Usadas

- `EXECUTION_QUEUE.md`
- `CURRENT_PRODUCT_STATE.md`
- `ROLE_VISIBILITY_MATRIX.md`
- `PLAYER_APP_V2_IMPLEMENTATION_SPEC.md`
- `COMPETITION_OS_V2_IMPLEMENTATION_SPEC.md`
- `MANAGEMENT_OS_V2_IMPLEMENTATION_SPEC.md`
- `SCREEN_RESPONSIBILITIES.md`
- `COMPONENT_GRAMMAR.md`
- codigo de rotas, shells, navegacao, permissoes e workspaces

## Evidencias

Screenshots e textos extraidos no browser:

- `web/docs/screenshots/qa-role-2026-05-15/`
- `qa-role-summary.json`
- `qa-role-gestao-final-summary.json`

Perfis testados:

| Papel testado | Usuario seed | Desktop | Mobile |
|---|---|---:|---:|
| Jogador puro | `jogador001@demo.atp.local` | sim | sim |
| Professor | `prof.renato@demo.atp.local` | sim | sim |
| Recepcao | `recepcao.dourados@demo.atp.local` | sim | sim |
| Financeiro | `financeiro.prime@demo.atp.local` | sim | sim |
| Organizador | `organizador.circuito@demo.atp.local` | sim | sim |
| Gestor | `gerente.dourados@demo.atp.local` | sim | sim |

## Resultado Por Papel

| Papel | Resultado | Evidencia | Risco |
|---|---|---|---|
| Jogador puro | Nao ve item `Gestao` na navegacao global. Ao acessar `/gestao` por URL recebe estado vazio de jogador. | `desktop-jogador-gestao-final2.png`, `mobile-jogador-gestao-final.png` | Medio: no desktop o shell ainda usa linguagem de central operacional antes do estado vazio. |
| Aluno | Coberto indiretamente pelo jogador com compromissos proprios. Nao houve exposicao de CRM, Cantina, Equipe ou financeiro de terceiros. | `desktop-jogador-inicio.png`, `mobile-jogador-inicio.png` | Baixo. Ainda precisa rodada futura com aluno mensalista ativo especifico. |
| Professor | Ve entrada de gestao e contexto de professor com `Aulas`, `Turmas` e `Alunos`. Nao ve Financeiro/Cantina/Equipe. | `desktop-professor-gestao-final.png`, `mobile-professor-gestao-final.png` | Alto: ainda aparecem sinais de setup/base incompleta como `Definir regras` e `Cadastrar cliente`, que nao pertencem ao modo professor. |
| Recepcao | Ve Agenda, Academia e Clientes basico; nao ve Financeiro/Cantina/Equipe. | `desktop-recepcao-gestao-final.png`, `mobile-recepcao-gestao-final.png` | Medio: tambem recebe setup estrutural como `Definir regras` e `Cadastrar professor`, que deve ser revisado por papel. |
| Financeiro | Usuario seed entra como operacao de recepcao porque o schema ainda nao tem papel financeiro dedicado. | `desktop-financeiro-gestao-final2.png`, `mobile-financeiro-gestao-final.png` | Alto: nao e possivel validar experiencia financeira granular sem papel/permissao dedicado. |
| Organizador | Competition OS abre `Organizando` com torneios gerenciados. | `desktop-organizador-eventos.png`, `mobile-organizador-eventos.png` | Medio: seed de organizador tambem tem acesso de local/manager, entao falta um usuario organizador puro para validar ausencia de Management OS. |
| Gestor | Ve Management OS completo conforme plano/papel, incluindo Agenda, Academia, Clientes, Financeiro e Cantina. | `desktop-gestor-gestao-final2.png`, `mobile-gestor-gestao-final.png` | Baixo. Densidade ainda sera avaliada em `QA-DESIGN-01`. |

## Achados

### P0 - Nenhum bloqueador critico novo

Nao foi encontrado bug P0 que impeça login, carregamento das rotas principais ou acesso basico por papel.

### P1 - MGMT-ROLE-QA-01 - Vazamento de setup por papel

Professor e recepcao ainda recebem tarefas de base operacional no hub de gestao:

- professor: `Definir regras`, `Cadastrar cliente`, mensagem `Base incompleta`;
- recepcao: `Definir regras`, `Cadastrar professor`, mensagem `Base incompleta`.

Impacto:

- professor volta a ver comandos de gestor/secretaria;
- recepcao pode receber setup profundo que a matriz diz nao pertencer ao papel;
- a primeira leitura volta a parecer cockpit misturado.

Direcao esperada:

- setup estrutural (`Definir regras`, `Cadastrar professor`, ajustes profundos) deve aparecer apenas para `owner`/`manager`;
- professor deve receber somente rotina propria: aulas, turmas, alunos, chamada, faltas, observacoes e reposicoes ligadas ao professor;
- recepcao deve receber operacao de atendimento: reservas, espera, aulas do dia, cadastro rapido permitido e clientes basicos.

### P1 - ROLE-FINANCE-01 - Papel financeiro dedicado ausente

Status posterior: resolvido em 2026-05-15 por `ROLE-FINANCE-01`.

No momento da rodada, o schema de `place_staff.role` aceitava `manager`, `coach` e `frontdesk`. O usuario de teste `financeiro.prime@demo.atp.local` entrava como recepcao, nao como financeiro dedicado.

Impacto:

- nao existe validacao real de uma pessoa que so ve recebiveis, despesas, lembretes e baixa de pagamentos;
- para liberar financeiro completo hoje ainda e necessario `owner`/`manager`, o que amplia permissao demais.

Direcao esperada:

- criar papel/permissao financeira dedicada ou matriz granular;
- seedar usuario financeiro real;
- garantir que Financeiro nao herde Agenda/Academia como frente principal, exceto links contextuais necessarios.

### P1 - QA-SEED-ROLE-01 - Seeds nao separam todos os papeis puros

Status posterior: resolvido em 2026-05-15 por `QA-SEED-ROLE-01`.

O organizador testado tambem possui acesso operacional a local. Isso e util para usuario multi-papel, mas nao valida o caso "organizador sem local".

Impacto:

- QA por papel fica parcialmente contaminada por perfis multi-papel;
- fica mais dificil comprovar que Organizador sem local nao ve Management OS.

Direcao esperada:

- manter usuarios multi-papel para testes reais;
- adicionar perfis seed puros: organizador sem local, aluno mensalista, financeiro dedicado quando o schema permitir e professor sem local.

Correcao aplicada:

- criado `qa.jogador.puro@demo.atp.local` sem vinculos operacionais;
- removido `organizador.circuito@demo.atp.local` de `place_staff`, preservando seu entitlement `competition_organizer` e staff de torneio/liga;
- mantidos perfis de aluno mensalista, professor vinculado, coach solo, recepcao, financeiro e gestor completo documentados no README do seed;
- `10_verify_seed_integrity.sql` passou a validar que esses papeis nao voltam a se misturar.

### P2 - MGMT-ROLE-QA-02 - Estado sem acesso ainda herda linguagem de gestao no desktop

Status posterior: resolvido em 2026-05-15 por `MGMT-ROLE-QA-02`.

Jogador puro acessando `/gestao` por URL nao ve item de Gestao na navegacao e recebe bloqueio correto. Porem o desktop ainda mostra shell/lateral com `Gestao esportiva` e `Operacao` antes do estado vazio.

Impacto:

- nao quebra seguranca nem permissao;
- cria friccao visual e sugere que o jogador entrou em uma area profissional.

Direcao esperada:

- para usuario sem acesso, renderizar estado vazio em shell neutro/player ou reduzir a linguagem operacional do wrapper.

Correcao aplicada:

- rota de gestao sem `hasManagement` passa a ser tratada como superficie `player` na navegacao global;
- `ManagementShell` aceita `mode` para renderizar o estado sem acesso em visual neutro;
- `/gestao` sem acesso mostra `Modo jogador` e `Area profissional indisponivel`.

## Conclusao

`QA-ROLE-01` cumpriu a validacao por papel e gerou evidencias desktop/mobile. A separacao principal esta funcionando: jogador nao recebe menu de gestao, professor nao recebe financeiro/cantina/equipe, recepcao nao recebe financeiro completo e gestor recebe o cockpit completo.

O principal ajuste antes de continuar muito longe e corrigir o vazamento de setup por papel no Management OS. Isso deve entrar na queue antes da auditoria visual ampla, porque afeta clareza operacional e limites de papel.
