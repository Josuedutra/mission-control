# GATE_ENFORCEMENT_POLICY_v1.0.md

## Objetivo
Formalizar a política de gates para operação SaaS B2B com separação de poderes, auditabilidade e controlo de risco.

## Mapa de Aprovadores (oficial)
- **Security Gate** -> **Sentinel**
- **RevOps Gate** -> **Ledger**
- **Claims Gate** -> **Fury**
- **Product Gate** -> **Shuri**
- **Override** -> **Founder** (única autoridade)

## Princípios Vinculativos
1. Nenhuma tarefa vai para `DONE` sem gates obrigatórios aprovados.
2. Aprovador de gate não pode ser o executor da mesma tarefa.
3. Logs de aprovação são imutáveis (append-only).
4. Overrides nunca são silenciosos.

## Ordem de Gates (quando múltiplos)
1. `Product`
2. `Claims` (se aplicável)
3. `RevOps` (se houver impacto monetário)
4. `Security` (sempre o último gate antes de `DONE`)

## Regras de Override (Founder)
Quando houver override, é obrigatório registar:
- `override_reason`
- `accepted_risk`
- `review_deadline`
- `followup_ticket_id` (P0 automático)

Ações automáticas em override:
1. Criar ticket P0 de follow-up
2. Criar entrada em `RISK_REGISTER.md`
3. Marcar tarefa original com `override_used=true`

## Modelo de Aprovação (auditoria)
Cada aprovação deve conter:
- `task_id`
- `gate_type`
- `approved_by`
- `timestamp_utc`
- `evidence_link`
- `notes` (opcional)

## Fail-Closed Runtime Rules
- Sem gate obrigatório -> bloqueia transição para `DONE`
- Gate pendente -> bloqueia transição para `DONE`
- `evidence_link` vazio (quando exigido) -> bloqueia `REVIEW`/`DONE`
- `approver == executor` -> aprovação inválida

## Exceções
- Incidente P0 permite execução emergencial imediata,
  mas exige validação retroativa de gates e postmortem.

## Critério de Conformidade
Uma tarefa só é considerada conforme se tiver:
- Gate(s) obrigatórios aprovados
- Evidência anexada
- Referência documental
- Sem conflito de autoridade
