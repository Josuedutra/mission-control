# GO_LIVE_CHECKLIST_v1.md — Mission Control

## P0 (obrigatório antes de produção)
- [ ] Workflow fail-closed ativo: não permite `DONE` sem Gate + Evidence + DoD + `audit_link`
- [ ] Campos obrigatórios ativos em todas as tasks: `Type, Product, Domain, Priority, Owner, Gate, SLA class, Risk score, Evidence required`
- [ ] Regras de Gate em runtime:
  - [ ] `SECURITY` -> aprovação Security
  - [ ] `REVOPS` -> aprovação RevOps
  - [ ] `CLAIMS` -> aprovação Research
  - [ ] `PRODUCT` -> aprovação QA
- [ ] Política de override definida (somente Founder + registo obrigatório)
- [ ] Incident flow separado com SLA P0/P1 ativo
- [ ] RACI publicado e comunicado à equipa
- [ ] Rollback obrigatório para mudanças high-risk
- [ ] Redação de PII em logs validada
- [ ] Teste anti cross-tenant executado e aprovado
- [ ] Assinatura + replay protection de webhooks validada
- [ ] Reconciliação pagamentos ↔ DB validada em ambiente real/sandbox controlado
- [ ] Runbook de incidente testado (tabletop)

## P1 (48h após go-live)
- [ ] Dashboard operacional com: throughput, WIP, blockers, lead time, incidentes
- [ ] Alertas de aprovação em atraso
- [ ] Alertas de churn/reconciliação/erros críticos
- [ ] Standup diário ativo (Coordinator)
- [ ] Weekly planning ativo
- [ ] DECISIONS.md com 5+ decisões fundacionais
- [ ] Product playbook reutilizável publicado

## Critérios de Go/No-Go
- **GO**: 100% dos P0 completos
- **NO-GO**: qualquer P0 em aberto
