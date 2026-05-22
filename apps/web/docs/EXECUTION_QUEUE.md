# Execution Queue

Status: queue de implementacao ativa definida
Data: 2026-05-22

## Situacao atual

A queue completa de implantacao esta definida em `SAAS_IMPLEMENTATION_QUEUE_COMPLETA.md`.

Regra:
Executar em ordem, sem pedir autorizacao entre sprints. Se houver bloqueio tecnico nao previsto, corrigir o menor necessario, validar e continuar.

## Queue ativa agora

### DOC-00 - Validar base SaaS

Objetivo:
Revisar os documentos ativos e confirmar que a direcao de produto esta correta.

Arquivos:
- `SAAS_MASTER_BLUEPRINT_COMPLETO.md`
- `SAAS_EMPRESARIAL_ORGANIZACAO_MANUAL.md`
- `APP_FUNCOES_EXISTENTES_MAPA.md`
- `PERSONAS_OPERACIONAIS_E_FUNCOES.md`
- `MATRIZ_PERSONAS_FUNCOES.md`
- `EXPANSAO_FUNCIONAL_SAAS.md`
- `NOVA_ARQUITETURA_NAVEGACAO_SAAS.md`
- `FLUXOS_TRABALHO_POR_PERSONA.md`
- `DIAGNOSTICO_ATUAL_SAAS.md`
- `PLANO_REORGANIZACAO_SAAS_FASES.md`

Criterio de aceite:
O produto alvo esta claro, separado entre SaaS web, mobile trabalho e Player App.

### DOC-01 - Revisar decisoes fechadas do blueprint

Objetivo:
Revisar as decisoes ja fechadas no `SAAS_MASTER_BLUEPRINT_COMPLETO.md` antes da primeira sprint de implementacao.

Decisoes fechadas:
- Menu de relacionamento: `Clientes`.
- Entidade conceitual interna: `Pessoa`.
- Menu de calendario: `Agenda`.
- Player App: menu `Rotina`, titulo `Minha rotina`.
- Seletor de unidade/local entra na primeira fase web.
- Implementar web SaaS antes do mobile trabalho.
- Pagamento provisorio: modal padrao com botao `Pagar`/`Marcar como pago` que converte como pago via stub.
- WhatsApp: abrir template profissional e registrar interacao simples quando houver estrutura.
- Cliente 360: cadastro progressivo, apenas nome + telefone/e-mail + tipo inicial como minimo.
- Relatorios MVP: cards e listas filtradas primeiro; dashboards avancados depois.

Criterio de aceite:
Nao restar duvida de nomenclatura, dominio e primeira fase pratica.

### DOC-02 - Validar templates e Cliente 360

Objetivo:
Revisar a secao 16 do blueprint antes da implementacao para confirmar que os templates e o Cliente 360 estao no tom correto.

Criterio de aceite:
Cadastro nao fica pesado, WhatsApp cobre os pontos operacionais principais e relatorios nao roubam foco dos fluxos centrais.

## Proxima queue candidata, apos validacao

### FASE-01 - Shell SaaS web e navegacao por dominios

Objetivo:
Criar a estrutura web de Trabalho como SaaS profissional, com topbar, unidade ativa, sidebar por dominios e rotas antigas preservadas.

Nao iniciar antes de:
- validar Fase 0;
- definir labels finais de dominio;
- confirmar o tratamento de multiunidade/local ativo;
- confirmar quais dados entram no `Cliente 360` da primeira entrega.

## Regra

Nao usar queues antigas em `Legado/`.

## Queue operacional

Ver `SAAS_IMPLEMENTATION_QUEUE_COMPLETA.md`.
