# PLAYER-UX-03B Booking Flow Report

Data: 2026-05-15

## Objetivo

Corrigir a experiencia de reserva publica de quadra no Player App sem reabrir a arquitetura geral.

## Problemas Tratados

- filtro de reserva com campos encavalados em desktop;
- ordem pouco natural dos campos;
- UF/cidade/local livres demais, sem orientar por dados cadastrados;
- ausencia de filtro de piso;
- cadastro de quadra sem captura do piso;
- confirmacao de reserva parecendo cadastro avulso de nome/contato;
- feedback pouco claro sobre onde o gestor aprova a reserva.

## Solucao Implementada

- filtro reorganizado para `UF > Cidade > Local > Piso > Data > Hora > Duracao`;
- UF e cidade agora sao listas derivadas de locais com quadras ativas;
- local usa autocomplete com nomes cadastrados;
- piso foi exposto no filtro e aplicado aos resultados;
- cadastro de quadra na gestao permite informar piso;
- fluxo publico de reserva mostra a identidade vinculada ao perfil logado;
- telefone so aparece como complemento se o perfil nao tiver contato;
- mensagem de sucesso orienta que a reserva pendente aparece em `Gestao > Agenda > Reservas pendentes`;
- grids de filtro e confirmacao foram ajustados para evitar overflow/desalinhamento.

## Backend E Persistencia

- `createCourtBooking` continua usando RPC `app_create_court_booking`.
- A reserva e gravada em `court_bookings` com `place_id`, `court_id`, `user_id` do usuario logado, horario, nome e telefone.
- A aprovacao permanece na gestao via fila de reservas e `updateCourtBookingStatus`.
- `place_courts.surface` ja existia; a mudanca expôs esse campo na UI de cadastro/filtro.

## Como O Gestor Deve Encontrar

1. Entrar com usuario gestor/recepcao do mesmo local.
2. Abrir `Gestao > Agenda`.
3. Filtrar pela data da reserva, se necessario.
4. Ver a reserva como pendente na lista/fila de reservas.
5. Usar `Confirmar` ou `Cancelar`.

## Validacao

- `npm run lint`: passou.
- `npm run build`: passou.

## Riscos Restantes

- horarios do filtro ainda usam grade padrao; a disponibilidade real e confirmada pela busca/RPC.
- validacao visual automatizada nao foi concluida porque a sessao Playwright local foi redirecionada para login sem sessao QA ativa.
