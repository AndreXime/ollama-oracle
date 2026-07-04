# Lumina Tech — Catálogo de Produtos NCS (v2026.02)

**Classificação interna:** Comercial, CS, Produto e Engenharia  
**Owner:** VP Produto (reporta à CTO Marina Duarte)  
**Última revisão de pricing:** fevereiro/2026 (próxima: agosto/2026)

---

## Visão geral

O ecossistema **NCS (Lumina Cloud Services)** oferece componentes modulares para workloads críticos em ambientes regulados. Clientes podem contratar pacotes ou serviços avulsos.

---

## Pacotes comerciais

| Pacote | Componentes | Público-alvo | ARPA médio |
|--------|-------------|--------------|------------|
| **NCS Starter** | NCS Connect (limitado), NCS Identity básico | Startups e PMEs tech | R$ 84 mil/ano |
| **NCS Growth** | Connect + Identity + Meter | Fintechs em escala | R$ 320 mil/ano |
| **NCS Enterprise** | Pacote completo + Shield + Audit + SLA premium | Bancos, saúde, utilities | R$ 890 mil – R$ 2,1M/ano |
| **NCS Custom** | Mix sob medida + professional services | Grupos multi-BU | Negociado |

---

## Produtos individuais

### NCS Connect (Mensageria)
- **Serviço:** NCS-MSG-ROUTER
- **Capacidades:** roteamento multi-tenant, filas duráveis, dead-letter, idempotência nativa
- **Limites Starter:** 500 msg/s; Enterprise: 50.000 msg/s (burst)
- **SLA:** 99,9% (Enterprise: 99,95%)
- **Pricing:** R$ 0,012 por 1.000 mensagens processadas (tier Enterprise com desconto por volume)

### NCS Identity (Autenticação)
- **Serviços:** NCS-AUTH-GATEWAY, NCS-USER-DIRECTORY
- **Capacidades:** OIDC, SAML, MFA TOTP/WebAuthn, JWT RS256, sync LDAP/AD
- **Limites Starter:** 10.000 MAU; Enterprise: ilimitado (fair use)
- **SLA:** 99,95%
- **Pricing:** R$ 0,08 por MAU/mês acima do tier contratado

### NCS Meter (Billing)
- **Serviço:** NCS-BILLING-API
- **Capacidades:** metering de uso, invoices, exportação fiscal, idempotency-key
- **Integração:** NCS Connect, NCS Identity, APIs custom via webhook
- **SLA:** 99,85%
- **Pricing:** 2,5% sobre GMV processado ou fee fixo mensal (Enterprise)

### NCS Shield (Edge & Segurança)
- **Serviço:** NCS-EDGE-INGRESS
- **Capacidades:** WAF, rate limiting, TLS termination, políticas OPA
- **SLA:** 99,95%
- **Pricing:** incluído em Enterprise; avulso a partir de R$ 45 mil/mês

### NCS Insights (Dados)
- **Serviço:** NCS-DATA-PIPELINE
- **Capacidades:** ETL batch, feature store, export analítico
- **SLA:** 99,0%
- **Pricing:** R$ 18 mil/mês base + compute Spark medido

### NCS Audit (Conformidade)
- **Serviço:** NCS-AUDIT-SINK
- **Capacidades:** trilhas imutáveis, retenção 7 anos, export para auditoria
- **SLA:** 99,9%
- **Pricing:** incluído em Enterprise regulado; avulso R$ 22 mil/mês

---

## Add-ons e serviços profissionais

| Add-on | Descrição | Valor indicativo |
|--------|-----------|------------------|
| **Suporte Premium 24x7** | TAM dedicado, Slack Connect, SEV-1 em 15 min | +18% do contrato base |
| **Implementação acelerada** | Squad Lumina por 90 dias | R$ 280 mil (projeto) |
| **Treinamento onsite** | 2 dias, até 20 participantes | R$ 35 mil |
| **Ambiente dedicado (single-tenant)** | Cluster isolado | +R$ 120 mil/ano |

---

## Contratos e termos

- **Prazo mínimo:** 12 meses (Enterprise: 24 ou 36 meses com desconto)
- **Renovação:** automática com aviso de 90 dias
- **Residência de dados:** Brasil (SP, MG) — regiões AWS sa-east-1 e Azure Brazil South
- **NDA e DPA:** templates jurídicos v2026.1; revisão custom para Tier-1 regulado

---

## Contatos comerciais

- **Pipeline enterprise:** Diego Ramos (AE) — `diego.ramos@lumina.internal`
- **Renovações e expansão:** Beatriz Souza (CSM) — `beatriz.souza@lumina.internal`
- **Pricing e descontos > 15%:** aprovação VP Comercial + DAF
