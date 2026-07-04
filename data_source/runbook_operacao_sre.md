# Lumina Tech — Runbook de Operação SRE (v2026.04)

**Classificação interna:** Engenharia, SRE, Suporte L2  
**Owner:** Ana Paula Freitas (EM Plataforma)  
**On-call:** PagerDuty → escala `#sre-oncall`

---

## 1. Severidades (SEV)

| SEV | Critério | Exemplo | IC | Comunicação cliente |
|-----|----------|---------|-----|---------------------|
| **SEV-1** | Indisponibilidade total Tier-0 ou > 25% clientes | MSG-Router down | On-call domínio + EM | Status page 30 min |
| **SEV-2** | Degradação significativa ou Tier-1 parcial | Latência p99 3x | On-call + owner | Status page 1h |
| **SEV-3** | Impacto limitado ou workaround | Dashboard stale | Owner squad | Opcional |
| **SEV-4** | Cosmético / baixo impacto | Log noise | Backlog | Não |

---

## 2. Fluxo de incidente

```
Detectar (alerta/usuário)
  → Abrir ITSM + PagerDuty ack (15 min SEV-1)
  → Designar IC (Incident Commander)
  → War room Slack #incident-YYYYMMDD
  → Mitigar → Monitorar → Resolver
  → Post-mortem (5 dias úteis SEV-1/2)
```

---

## 3. Runbook: NCS-MSG-ROUTER indisponível

### Sintomas
- Alerta `NatsConsumerLagHigh`
- gRPC `Unavailable` em `v1.Router/Dispatch`
- Clientes reportando filas paradas

### Diagnóstico
1. `kubectl -n ncs-prod get pods -l app=msg-router`
2. Grafana dashboard `NCS/MsgRouter` → lag, CPU, memory
3. Logs: `kubectl logs -l app=msg-router --tail=200`

### Mitigação
1. Restart rolling: `kubectl rollout restart deployment/msg-router -n ncs-prod`
2. Se OOM: scale HPA manual `kubectl scale deployment/msg-router --replicas=N`
3. Se Redis dedupe down: escalar para squad Identity/Redis

### Escalation
- **15 min** sem melhora: acionar Ricardo Vale (Staff)
- **30 min** SEV-1: acionar Marina Duarte (CTO)

---

## 4. Runbook: NCS-AUTH-GATEWAY / login corporativo

### Sintomas
- SSO falha; VPN ZTNA não conecta
- HTTP 503 em `/v1/token`

### Diagnóstico
1. `curl -s https://auth.internal.lumina/healthz`
2. Redis session cluster status
3. NCS-USER-DIRECTORY sync lag

### Mitigação
1. Verificar certificados (cert-manager)
2. Failover Redis (runbook Redis Cluster)
3. Modo degradado: MFA bypass **apenas** com aprovação CISO (break-glass)

---

## 5. Runbook: NCS-BILLING-API atraso de agregação

### Sintomas
- Job NCS-DATA-PIPELINE atrasado
- Invoices não geradas no prazo

### Mitigação
1. Verificar status job: `POST https://pipeline.internal.lumina/jobs/status`
2. Coordenar com squad Data (Larissa Nunes)
3. Billing: modo reconciliação manual (runbook FIN-REC-01)
4. Comunicar CS para clientes Tier-1 afetados

---

## 6. Change management

| Tier serviço | Janela deploy | Aprovação |
|--------------|---------------|-----------|
| Tier-0 | Ter–Qui 10h–16h BRT | EM + on-call |
| Tier-1 | Ter–Qui 10h–18h | EM |
| Tier-2/3 | Seg–Sex | Tech Lead |

**Blackout:** ver `calendario_corporativo_2026.md`

---

## 7. Observabilidade (links)

- **Grafana:** `https://grafana.lumina.internal`
- **Logs:** `https://logs.lumina.internal` (Loki)
- **Traces:** `https://tempo.lumina.internal`
- **Status page:** `https://status.lumina.cloud`

---

## 8. Contatos de escalonamento

| Papel | Nome | Slack |
|-------|------|-------|
| Staff Plataforma | Ricardo Vale | @ricardo.vale |
| EM Plataforma | Ana Paula Freitas | @ana.freitas |
| Senior SRE | Juliana Costa | @juliana.costa |
| CISO | Paulo Henrique Nogueira | @paulo.nogueira |
| CTO | Marina Duarte | @marina.duarte |
