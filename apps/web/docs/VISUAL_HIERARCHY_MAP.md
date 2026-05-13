# Visual Hierarchy Map

Fonte principal: `product-architecture-ux-audit.md`.

Data: 2026-05-13

## Ordem de leitura ideal

1. Contexto atual.
2. Status.
3. Proxima acao.
4. Fila operacional.
5. Lista principal.
6. Detalhes.
7. Relatorios/configuracoes.

Se a tela apresenta configuracao ou relatorio antes da proxima acao operacional, ela tende a parecer pesada.

## Hierarquia de componentes

### Header contextual

Deve responder:

- onde estou;
- qual recorte esta ativo;
- qual e o status;
- qual acao principal posso fazer.

Exemplo: torneio com classe ativa antes do resumo.

### Metric strip

Uso:

- 3 a 5 indicadores maximos;
- numeros curtos;
- labels claras;
- sempre coerente com o filtro ativo.

Nao usar para esconder a fila de trabalho.

Implementacao atual:

- usar `MetricStrip` para indicadores curtos, com `value`, `label`, detalhe opcional e acao opcional.
- se houver acao, o item pode virar botao; se for apenas leitura, fica como bloco informativo.

### Operational queue

Uso:

- pendencias reais;
- ordem por prioridade;
- acao primaria clara;
- contexto minimo.

Deve aparecer antes de listas longas.

### Entity row/card

Uso:

- leitura rapida de entidade;
- status sempre no mesmo lugar;
- acao primaria destacada;
- acoes secundarias agrupadas.

### Drawer

Uso:

- historico;
- dados completos;
- comentarios;
- detalhes financeiros;
- acoes secundarias.

Implementacao atual:

- usar `EntityDrawer` quando o detalhe ou historico deixa a linha principal alta demais.
- CRM do local ja usa drawer para historico de interacoes do contato.

### Wizard

Uso:

- criacao com dependencias;
- configuracao com etapas;
- fluxos em que ordem importa.

### Publishing kit

Uso:

- link publico;
- WhatsApp;
- CSV;
- PNG;
- widget;
- texto pronto para divulgacao.

Deve aparecer como bloco transversal de publicacao, sem misturar com configuracao ou operacao diaria.

### Action bar

Uso:

- agrupar CTAs de um mesmo contexto;
- manter uma acao primaria clara;
- alinhar acoes secundarias sem criar botoes soltos.

Implementacao atual:

- usar `ActionBar` em grupos de botoes recorrentes, preservando classes de contexto quando houver ajuste visual especifico.
- no mobile, a action bar pode quebrar em colunas/linhas conforme a tela, mas nao deve misturar acoes de responsabilidades diferentes.

## Botoes

### Primario

Uma acao dominante por bloco.

Exemplos:

- Confirmar
- Resolver
- Registrar pagamento
- Publicar
- Entrar no jogo

### Secundario

Acoes uteis, mas nao centrais.

Exemplos:

- Copiar link
- WhatsApp
- Editar
- Ver detalhes

### Perigoso/desfazer

Deve ser claro e nao competir com confirmacao.

Exemplos:

- Desfazer presenca
- Cancelar reserva

## Mobile

- Cards devem caber em leitura vertical curta.
- Evitar duas colunas de informacao densa.
- Acoes secundarias devem virar menu/action sheet.
- Texto de status deve ser curto.
- Se a tela exige muita comparacao, criar filtro ou subvisao.

## Desktop

- Usar grids para comparacao e contexto.
- Evitar largura cheia sem motivo.
- Coluna secundaria pode mostrar resumo, nao outro fluxo completo.
- Acoes em linha devem manter alinhamento consistente.
