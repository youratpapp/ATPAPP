# Product Architecture

Fonte principal: `product-architecture-ux-audit.md`.

Data: 2026-05-13

## Tese do produto

O app deve evoluir como um sistema operacional esportivo, nao como uma colecao de paginas. A experiencia deve ser guiada por tarefas, contexto, prioridade e filas operacionais.

O usuario nao deve procurar "onde esta a ferramenta". O sistema deve mostrar "qual e a proxima acao certa agora".

## Camadas do produto

### 1. Camada do jogador

Objetivo: permitir que o jogador resolva rapidamente sua vida esportiva.

Inclui:

- proximos compromissos;
- reservas;
- partidas;
- aulas;
- pagamentos;
- convites;
- historico;
- ranking;
- descoberta publica de locais, eventos e jogos.

Regra: mobile-first absoluto. Se o jogador precisa ler demais ou comparar muitos blocos para agir, o fluxo esta errado.

### 2. Camada do clube/academia

Objetivo: operar agenda, alunos, clientes, financeiro, equipe e publicacao sem depender de planilha e WhatsApp solto.

Separar sempre:

- operacao diaria;
- configuracao;
- publicacao;
- relatorios;
- administracao estrutural.

Regra: a primeira tela de gestao deve priorizar pendencias e proximas acoes, nao cadastro e configuracao.

### 3. Camada de competicoes

Objetivo: oferecer torneios, ligas, rankings e partidas com uma linguagem operacional comum.

Conceitos compartilhados:

- participantes;
- classes/categorias;
- partidas;
- agenda;
- resultados;
- ranking/classificacao;
- publicacao;
- chat;
- configuracao.

Regra: torneio e liga podem ter regras diferentes, mas o operador nao deve reaprender a interface.

### 4. Camada publica e publicacao

Objetivo: transformar operacao em distribuicao clara para jogador e canais externos.

Inclui:

- pagina publica de local;
- pagina publica de torneio;
- links de reserva/turma/jogo;
- WhatsApp;
- widget;
- exportacao CSV;
- arte PNG;
- ranking publicavel.

Regra: toda ferramenta publica precisa ter link copiavel, texto pronto para WhatsApp e leitura mobile limpa.

## Fronteiras de dominio

### Places

Responsavel por local, marca, equipe, permissao, quadras, agenda, academia, clientes, financeiro, cantina e relatorios do local.

Risco atual: dominio muito concentrado em `PlacesPage.tsx`.

### Bookings

Responsavel por disponibilidade, reserva, bloqueio, lista de espera, check-in futuro e regras de preco.

Nao deve carregar CRM, cantina ou torneio dentro da mesma tela, exceto como contexto resumido.

### Academy

Responsavel por turmas, alunos, professores, chamada, faltas, reposicoes, pacotes e evolucao.

Nao deve virar uma pagina de financeiro completa. Financeiro aparece como status e acao, com detalhe no modulo financeiro.

### CRM e clientes

Responsavel por leads, socios, contatos, follow-ups, inadimplentes e risco de churn.

Nao deve duplicar toda gestao de aluno ou pagamento. Deve apontar para a proxima acao.

### Finance

Responsavel por recebiveis, despesas, pacotes, creditos, lembretes e relatorios de receita.

Nao deve virar cadastro de cliente nem agenda.

### Competitions

Responsavel por torneios, ligas, partidas, resultados, ranking e publicacao esportiva.

Deve usar uma gramatica comum de competicao.

## Checklist antes de implementar

- Qual persona usa isto?
- Qual acao primaria esta sendo resolvida?
- Isto pertence a operacao diaria, configuracao, publicacao, relatorio ou administracao estrutural?
- Ja existe uma tela ou componente com responsabilidade parecida?
- A mudanca cria duplicidade visual ou funcional?
- O fluxo melhora mobile ou adiciona scroll/cliques?
- O detalhe pode ir para drawer, accordion ou wizard?
- A nova ferramenta fica completa o suficiente para resolver o problema real?

## Decisao arquitetural

Novas funcionalidades devem entrar como modulo, fila, drawer, wizard ou subfluxo. Evitar adicionar novos blocos em paginas monoliticas.
