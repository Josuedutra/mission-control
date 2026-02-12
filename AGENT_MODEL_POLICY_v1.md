# AGENT_MODEL_POLICY_v1.md — Bootstrapped Mode

## Golden Principle
**Default cheap. Escalate only when risk > cost.**

## Model Tiers
- **Large Frontier Model**
- **Balanced Pro Model**
- **Cost-Efficient Model**
- **Reasoning Model** (usar quando lógica profunda for necessária)

## Baseline por Agente (aprovado)
1. **Coordinator (PMO / Jarvis)**
   - Primário: Cost-Efficient
   - Fallback: Balanced Pro
   - Reasoning: low -> medium
   - Objetivo custo: baixo

2. **Developer (Friday)**
   - Primário: Balanced Pro
   - Fallback: Cost-Efficient
   - Escalonamento: Frontier sob demanda
   - Reasoning: medium -> high
   - Objetivo custo: médio

3. **Security / Compliance (Sentinel)**
   - Primário: Balanced Pro
   - Fallback: Cost-Efficient
   - Escalonamento: Frontier para threat modeling e releases críticas
   - Reasoning: medium -> high
   - Objetivo custo: médio

4. **RevOps / Finance (Ledger)**
   - Primário: Cost-Efficient
   - Fallback: Balanced Pro
   - Reasoning: low -> medium
   - Objetivo custo: baixo

5. **Product / QA (Shuri)**
   - Primário: Cost-Efficient
   - Fallback: Balanced Pro
   - Reasoning: low -> medium
   - Objetivo custo: baixo

6. **Documentation / Knowledge (Wong)**
   - Primário: Cost-Efficient
   - Fallback: Cost-Efficient
   - Reasoning: low
   - Objetivo custo: mínimo

7. **Research / Market Intelligence (Fury)**
   - Primário: Balanced Pro
   - Fallback: Cost-Efficient
   - Escalonamento: Frontier para decisões estratégicas
   - Reasoning: medium -> high
   - Objetivo custo: médio

8. **Growth Content (SEO + Copy)**
   - Primário: Cost-Efficient
   - Fallback: Balanced Pro
   - Reasoning: low
   - Objetivo custo: baixo

9. **Lifecycle / Email (Pepper)**
   - Primário: Cost-Efficient
   - Fallback: Cost-Efficient
   - Reasoning: off -> low
   - Objetivo custo: mínimo

10. **Design (Wanda)**
    - Primário: Cost-Efficient
    - Fallback: Balanced Pro
    - Reasoning: low
    - Objetivo custo: baixo

## Dynamic Escalation Rule (formal)
Escalar +1 tier quando a tarefa impactar:
- money flow
- authentication
- tenant isolation
- public claims
- irreversible product decisions

Regras adicionais:
- Incidente P0: escalar imediatamente para tier máximo.
- Incerteza > 7/10: escalar um tier.
- Após conclusão: reverter para baseline.

## Frontier Trigger Examples
- Auth core
- Multi-tenant isolation
- Billing core
- Webhook validation
- Structural migrations
- Threat modeling major release
- Kill/Scale decision

## Cost Guardrails
- 80% tarefas: Cost-Efficient
- 15% tarefas: Balanced Pro
- 5% tarefas: Frontier

## Cost Discipline
- Evitar heartbeats frequentes para todos os agentes em paralelo.
- Manter agentes variáveis on-demand fora de fase ativa.
- Evitar loops automáticos sem change detection.
- Consolidar revisões estratégicas em blocos semanais.
