# Lumina Tech — Post-mortems de Incidentes (2026)

**Classificação interna:** Engenharia, SRE, CS  
**Owner:** Customer Reliability Engineering  
**Formato:** timeline + causa raiz + ações preventivas

---

## INC-2026-402 — Degradação NCS-MSG-ROUTER (SEV-1)

**Data:** 14/02/2026, 03:12 – 07:45 BRT  
**Duração:** 4h 33min  
**Impacto:** ~12% das mensagens atrasadas; 3 clientes Tier-1 afetados (Banco Horizonte Digital, Pagamentos Atlas, Grupo Varejo Norte)  
**Incident Commander:** Ana Paula Freitas  
**Owner técnico:** Ricardo Vale

### Timeline
| Horário | Evento |
|---------|--------|
| 03:12 | Alerta Prometheus: lag de fila NATS > 50k mensagens |
| 03:18 | On-call aciona squad Msg & Queue |
| 03:35 | Identificado memory leak em worker de reprocessamento |
| 04:10 | Mitigação: restart rolling dos pods afetados |
| 05:20 | Lag estabilizado; clientes notificados via status page |
| 07:45 | SEV-1 encerrado; monitoramento reforçado |

### Causa raiz
Loop de reprocessamento em `worker/dispatch.go` sem **backoff exponencial** em timeout Redis; goroutines acumuladas até OOM.

### Ações
- [x] PR com backoff exponencial (merged 15/02)
- [x] Limite de concorrência por worker
- [x] Alerta de memory usage > 80% antes de OOM
- [ ] Chaos test mensal em staging (prazo: jun/2026)

---

## INC-2026-418 — Retry storm NCS-EDGE-INGRESS (SEV-2)

**Data:** 28/03/2026, 11:00 – 14:30 BRT  
**Duração:** 3h 30min  
**Impacto:** Latência p99 +400ms; timeouts intermitentes em APIs públicas  
**Incident Commander:** Juliana Costa  
**Owner técnico:** Gustavo Almeida

### Timeline
| Horário | Evento |
|---------|--------|
| 11:00 | Rotação automática de certificado TLS concluída |
| 11:08 | Spike de 503 e retries de apps móveis cliente |
| 11:25 | Edge CPU 95%; identificado retry storm HTTP/2 |
| 12:40 | Mitigação: rate limit temporário + jitter no SDK cliente |
| 14:30 | Tráfego normalizado |

### Causa raiz
Clientes móveis legados retentavam imediatamente em falha TLS pós-rotação; sem jitter, amplificação de carga no Envoy.

### Ações
- [x] Documentação de rotação de cert para clientes
- [x] SDK mobile v2.3 com exponential backoff + jitter
- [x] Circuit breaker no edge para tenants com retry agressivo
- [ ] Comunicação proativa 72h antes de rotações futuras

---

## INC-2026-431 — Deadlock NCS-DATA-PIPELINE → atraso billing (SEV-2)

**Data:** 05/04/2026, 02:00 – 18:00 BRT  
**Duração:** 16h (impacto billing downstream)  
**Impacto:** Job de agregação mensal atrasado; reconciliação manual em NCS-BILLING-API; 2 invoices enterprise postergados  
**Incident Commander:** Helena K. Sato  
**Owner técnico:** Larissa Nunes

### Timeline
| Horário | Evento |
|---------|--------|
| 02:00 | Job agregação março/2026 iniciado (cron) |
| 04:30 | Job travado; locks Postgres detectados |
| 06:00 | Escalado para SEV-2; Billing notificado |
| 10:00 | Mitigação: kill job + reordenação de JOIN |
| 18:00 | Agregação concluída; reconciliação Billing iniciada |

### Causa raiz
Deadlock entre transação de agregação e leitura concorrente da réplica analytics; ordem de locks inconsistente em query refatorada em março.

### Ações
- [x] `lock_timeout` e `statement_timeout` no job
- [x] Reordenação de JOIN documentada em ADR-2026-014
- [x] Janela de reconciliação Billing + Data (runbook)
- [ ] Teste de carga com volume 2x em staging (abr/2026)

---

## Lições transversais (Q1 2026)

1. **Tier-0** exige runbooks testados trimestralmente e game days.
2. Comunicação com clientes Tier-1: primeira atualização em **30 min** (SEV-1).
3. Post-mortem obrigatório em **5 dias úteis** após encerramento.
4. Correções de código em serviços Tier-0: deploy em **72h** ou plano de mitigação aprovado pela CTO office.

**Repositório de incidentes:** ITSM → Incidentes → filtro `INC-2026-*`
