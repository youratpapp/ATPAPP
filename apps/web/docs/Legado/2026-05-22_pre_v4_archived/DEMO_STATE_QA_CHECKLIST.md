# Demo State QA Checklist

Fonte principal: `CURRENT_PRODUCT_STATE.md` e `EXECUTION_QUEUE.md`.

Data: 2026-05-13

## Objetivo

Este arquivo fecha o bloqueio `DATA-01`: toda evolucao visual precisa ser validada contra estados reais de uso, nao apenas tela vazia.

Ele nao substitui testes automatizados. Ele define a massa minima de estados que precisa existir em seed/demo, print ou ambiente manual antes de concluir refinamentos visuais de alta percepcao.

## Viewports obrigatorios

- Mobile estreito: 390px.
- Mobile confortavel: 430px.
- Desktop operacional: 1366px.
- Desktop amplo: 1440px ou maior.

## Estados obrigatorios por tela critica

### Gestao

- Sem local acessivel.
- Um local com base incompleta.
- Um local com operacao em dia.
- Um local com reservas pendentes.
- Varios locais acessiveis.

Critério:

- fila do dia nao deve mostrar card zerado;
- local deve aparecer como row operacional;
- atalhos nao podem virar lista longa no mobile.

### Admin do local / Agenda

- Nenhuma quadra cadastrada.
- Quadras cadastradas sem regras.
- Busca de disponibilidade sem resultado.
- Reserva pendente.
- Reserva confirmada.
- Lista de espera com ao menos um jogador.
- Bloqueio administrativo.

Critério:

- criacao de reserva deve manter composer curto;
- campos raros ficam em avancado;
- acao primaria deve continuar sendo reservar ou resolver pendencia.

### Admin do local / Academia

- Nenhuma turma.
- Turma sem aluno.
- Turma cheia.
- Aluno pendente.
- Aluno ativo inadimplente.
- Aluno com falta avisada.
- Professor sem agenda.

Critério:

- turmas e alunos devem ser rows quando a tarefa for chamada, pagamento ou lembrete;
- setup nao deve competir com operacao diaria.

### Admin do local / Clientes

- CRM vazio.
- Lead novo sem responsavel.
- Lead com follow-up vencido.
- Cliente convertido.
- Recebivel em aberto.

Critério:

- fila/lista aparece antes de formulario quando ja existem contatos;
- novo contato continua acessivel em um toque;
- historico fica em drawer/sheet.

### Admin do local / Cantina

- Sem produto.
- Produto com estoque baixo.
- Produto em estoque.
- Venda avulsa.
- Venda com produto cadastrado.

Critério:

- venda rapida e a rotina principal;
- cadastro de produto e auxiliar;
- catalogo usa rows com preco, estoque e status.

### Competition OS

- Torneio sem classe gerada.
- Torneio com classe ativa e partidas pendentes.
- Minha partida pendente.
- Minha partida finalizada.
- Resultado aguardando confirmacao.
- Liga com rodada sem agenda.
- Liga com partida em disputa.

Critério:

- escopo ativo vem antes dos numeros;
- partida pendente deve ter row/estado operacional;
- proxima acao do jogador nao deve duplicar bloco sem contexto.

### Pagina publica

- Local sem quadras.
- Local com preco inicial.
- Local com turmas.
- Local com eventos.
- Link publico sem WhatsApp.

Critério:

- primeira viewport deve vender reserva/turma/evento;
- CTA interno de gestao nao deve competir com conversao.

## Checklist antes de concluir refinamento visual

- [ ] Estado vazio visto.
- [ ] Estado cheio visto.
- [ ] Estado com pendencia visto.
- [ ] Estado com erro/sem permissao considerado.
- [ ] Mobile 390px revisado.
- [ ] Desktop 1366px revisado.
- [ ] Acao primaria identificada.
- [ ] Acoes secundarias nao competem.
- [ ] Sem card zerado protagonista.
- [ ] Docs vivos atualizados.

## Regra de uso futuro

Se uma tarefa mexer em tela critica e nao houver massa de dados suficiente, registrar no final:

```text
Validacao visual limitada por ausencia de estado: <estado faltante>.
```

Isso evita calibrar o produto apenas pelo estado vazio.
