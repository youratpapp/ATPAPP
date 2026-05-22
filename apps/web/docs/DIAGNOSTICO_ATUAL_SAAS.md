# Diagnostico Atual SaaS

Status: diagnostico honesto baseado no estado atual do app
Data: 2026-05-22

## Resumo executivo

O app tem uma base funcional relevante: reservas, academia, CRM, financeiro parcial, POS, equipe, torneios, ligas, agenda pessoal e rotas publicas. O problema principal nao e falta absoluta de funcoes. O problema e arquitetura de trabalho: varias funcoes existem, mas aparecem como menus/tabs empilhados, sem hierarquia empresarial, sem pagina 360 clara, sem separacao suficiente entre web SaaS e mobile operacional.

## 1. Problemas de arquitetura de informacao

### Menu de trabalho ainda reflete modulos atuais

Onde ocorre:
Sidebar e bottom nav de Trabalho.

Impacto:
O usuario ve uma lista de areas, mas nao entende o fluxo SaaS completo.

Persona afetada:
Todos os papeis de trabalho.

Gravidade:
Alta.

Sugestao:
Reorganizar por dominios SaaS: Operacao, Agenda/Recursos, Pessoas, Academia, Financeiro, Competicoes, Loja, Comunicacao, Relatorios, Administracao.

### Reservas e calendario competem

Onde ocorre:
Modulo reservas e calendario.

Impacto:
Reserva deveria ser acao no calendario, nao um submenu isolado cheio de subabas.

Persona afetada:
Recepcao, gestor.

Gravidade:
Alta.

Sugestao:
Calendario central clicavel; reserva abre em drawer; espera e remarcacao aparecem no contexto do slot/reserva.

### Aulas mistura rotinas diferentes

Onde ocorre:
Modulo aulas/academia.

Impacto:
Turmas, alunos, professores, pendencias, agenda e ajustes ficam perto demais sem responsabilidade clara.

Persona afetada:
Professor, gestor, recepcao.

Gravidade:
Alta.

Sugestao:
Separar Academia como dominio: Aulas, Turmas, Matriculas, Reposicoes, Evolucao. Professores tambem em Pessoas/Equipe.

### Clientes ainda mistura lead, aluno, socio e contato

Onde ocorre:
Modulo Pessoas/Clientes.

Impacto:
Recepcao nao sabe se esta tratando oportunidade, aluno ativo, socio ou contato historico.

Persona afetada:
Recepcao, gestor.

Gravidade:
Alta.

Sugestao:
Criar Pessoas com Leads, Clientes ativos, Alunos, Socios e Pessoa 360.

### Competicoes mistura descoberta e organizacao

Onde ocorre:
Player Competir e Trabalho Competicoes.

Impacto:
Jogador ve pistas de organizacao; organizador pode cair em descoberta.

Persona afetada:
Jogador, organizador.

Gravidade:
Alta.

Sugestao:
Player Competir apenas descoberta/participacao. Trabalho Competicoes para operacao.

### Configuracao ainda aparece perto da rotina

Onde ocorre:
Reservas, aulas, equipe, settings.

Impacto:
Setup raro compete com trabalho do dia.

Persona afetada:
Recepcao, professor, gestor.

Gravidade:
Media/Alta.

Sugestao:
Mover setup para Administracao/Configuracoes e detalhes de dominio.

## 2. Problemas de fluxo

### Falta ciclo completo em reserva

Problema:
Criar, pagar, editar, cancelar, remarcar, avisar e registrar historico ainda nao formam um fluxo continuo.

Impacto:
Recepcao depende de interpretacao e WhatsApp manual.

Gravidade:
Alta.

Sugestao:
Slot clicavel + drawer + modal pagamento + WhatsApp templates + historico.

### Professor nao precisa necessariamente de chamada

Problema:
Chamada/presenca aparece como obrigacao conceitual, mas no tenis pode nao fazer sentido.

Impacto:
Professor sente que o sistema exige burocracia desnecessaria.

Gravidade:
Alta.

Sugestao:
Configuracao "exigir chamada" padrao desligado. Priorizar aulas do dia, faltas avisadas, reposicoes e observacoes.

### Pendencias sem destino claro

Problema:
Numeros de pendencias aparecem, mas nem sempre abrem uma lista compreensivel.

Impacto:
Usuario perde confianca.

Gravidade:
Alta.

Sugestao:
Toda metrica acionavel precisa abrir a fila correspondente com filtro aplicado.

### Faltam telas de sucesso/proximo passo

Problema:
Acoes concluem, mas nem sempre indicam o proximo passo natural.

Impacto:
Fluxo parece interrompido.

Gravidade:
Media.

Sugestao:
Sucesso com CTAs: ver agenda, abrir cliente, enviar WhatsApp, gerar pagamento.

## 3. Problemas de persona

### Todos ainda compartilham estruturas parecidas

Impacto:
Professor, recepcao, financeiro, caixa e gestor veem complexidade parecida demais.

Gravidade:
Alta.

Sugestao:
Trabalho Hoje e mobile por papel; web por dominios com acesso contextual.

### Recepcao nao tem cockpit proprio suficiente

Impacto:
Pessoa que atende sob pressao precisa de agenda, busca e acoes rapidas.

Sugestao:
Recepcao deve iniciar em Agenda/Hoje com busca de cliente e nova reserva.

### Financeiro ainda nao parece dominio empresarial

Impacto:
Produto nao transmite controle completo de receitas, despesas, vencidos e relatorios.

Sugestao:
Financeiro deve ter navegacao propria, recebiveis, pagos, vencidos, despesas, planos, comissoes e relatorios.

### Gestor ve operacao, mas nao necessariamente decisao

Impacto:
Falta visao de prioridade: maior problema primeiro.

Sugestao:
Painel executivo com alertas e caminhos para resolver.

## 4. Problemas web/mobile

### Web parece adaptacao de app

Onde ocorre:
Aulas, reservas e alguns workspaces.

Impacto:
Falta densidade e estrutura de SaaS profissional.

Gravidade:
Alta.

Sugestao:
Web com tabelas/listas robustas, detalhes laterais, filtros persistentes e relatorios.

### Mobile tenta carregar coisa demais

Impacto:
Menus longos e funcoes de configuracao em contexto mobile.

Sugestao:
Mobile Trabalho deve ser operacional por papel, nao mini-SaaS.

## 5. Problemas de completude SaaS

### Falta Pessoa/Aluno 360

Impacto:
Historico, pagamentos, aulas, reservas e interacoes ficam dispersos.

Gravidade:
Alta.

Sugestao:
Criar detalhe 360.

### Falta comunicacao padronizada

Impacto:
WhatsApp e avisos sao essenciais, mas ainda pouco estruturados.

Gravidade:
Alta.

Sugestao:
Templates por evento operacional e historico.

### Falta relatorio empresarial

Impacto:
SaaS sem relatorio parece ferramenta operacional, nao gestao.

Gravidade:
Media/Alta.

Sugestao:
Relatorios por ocupacao, receita, alunos, professores, financeiro e competicoes.

### Falta auditoria/historico forte

Impacto:
Operacoes grandes precisam rastrear alteracoes.

Gravidade:
Media.

Sugestao:
Historico por entidade primeiro, auditoria depois.

## Areas mais desorganizadas hoje

1. Agenda/Reservas/Calendario.
2. Academia/Aulas/Alunos/Professores.
3. Pessoas/Clientes/Leads/Socios.
4. Financeiro empresarial.
5. Competicoes no limite entre jogador e organizador.
6. Mobile Trabalho.

## Diagnostico final

O caminho correto nao e mexer em um menu por vez. O caminho e implantar uma arquitetura SaaS web por dominios, mantendo o app jogador simples e criando mobile trabalho como camada operacional. A base atual tem funcoes suficientes para iniciar essa transformacao sem reescrever backend, mas sera preciso criar novas composicoes de pagina, novos detalhes 360 e alguns complementos tecnicos pontuais.

