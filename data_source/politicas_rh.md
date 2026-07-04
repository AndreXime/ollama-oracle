# Lumina Tech — Políticas de RH, Carreira e Segurança da Informação (v2026.1)

**Classificação interna:** Confidencial — Colaboradores CLT e PJ Lumina Tech  
**Responsável normativo:** Diretoria de Pessoas & Cultura + CISO (Diretoria de Segurança e Conformidade)  
**Vigência:** 01/01/2026, com revisão trimestral obrigatória.

---

## 1. Trabalho remoto e modelo híbrido (Home Office)

1.1. A Lumina Tech adota **home office estruturado** para funções elegíveis conforme matriz de criticidade do sistema ao qual o colaborador está alocado (referência cruzada: mapa de sistemas corporativo — serviços **NCS-***). Equipes que sustentam componentes classificados como **Tier-0** ou **Tier-1** devem manter **janela de sobreposição mínima de quatro horas** com o fuso `America/Sao_Paulo`, salvo exceção aprovada pelo gerente de engenharia e registrada no ITSM interno.

1.2. O acesso a ambientes de produção a partir de rede doméstica exige **VPN corporativa ZTNA** com certificado de máquina + **MFA TOTP** (política alinhada ao *baseline* do **NCS-AUTH-GATEWAY**, que emite **JWT** com **TTL** de 15 minutos para sessões interativas e *refresh* controlado via cookie *httpOnly* em domínios `*.lumina.internal`). É vedado armazenar *secrets* de cluster **Kubernetes** (`kubeconfig` com credenciais de longa duração) em repositórios pessoais.

1.3. Colaboradores em home office devem aderir ao **Programa de Postura Ergonômica Lumina** (avaliação anual) e cumprir os requisitos de **registro de ponto eletrônico** integrado ao RHIS. Ausências não justificadas em *stand-ups* críticos de incidente (severidade SEV-1/SEV-2) podem acarretar revisão de elegibilidade ao remoto pleno.

---

## 2. Plano de carreira em formato **Y** (Y-shape)

2.1. O modelo **Y-shape** institui duas verticais de senioridade convergentes para papéis de **Staff Engineer** e **Principal Engineer**, precedidas por trilhas paralelas:

- **Haste vertical “IC” (Individual Contributor):** Software Engineer II → Senior Engineer → Staff Engineer. Ênfase em profundidade técnica (ex.: domínio de **gRPC**, contratos **Protocol Buffers**, padrões de **idempotência** em consumidores de fila, observabilidade com *tracing* OpenTelemetry nos serviços **NCS-***).
- **Haste vertical “Liderança técnica leve”:** Tech Lead Associate → Engineering Manager I → Engineering Manager II. Ênfase em orquestração de squads, priorização de *backlog* alinhada à criticidade de serviço (Tier-0 a Tier-3) e gestão de post-mortems (referência: *log* corporativo de incidentes **INC-2026-***).
- **Junção do Y:** A promoção a **Staff** exige comprovação de impacto transversal (mínimo dois domínios de produto) e participação documentada em **revisões de arquitetura** (ADR) que envolvam integrações com o **NCS-BILLING-API** e/ou o **NCS-MSG-ROUTER**, salvo dispensa aprovada pela CTO office.

2.2. Mudanças de trilha (ex.: de IC para EM) seguem calendário de **mobilidade interna** publicado no portal RH, com *slot* de mentoria de 90 dias e *checkpoint* de feedback 360°.

2.3. **Avaliação de desempenho:** dois ciclos anuais (junho e dezembro) com calibração entre pares de gestores. Notas em escala **1–5**; promoções exigem, em geral, **dois ciclos consecutivos ≥ 4** na faixa atual ou evidência excepcional documentada.

2.4. **Licença parental:** complemento empresa além do legal — **120 dias** maternidade, **20 dias** paternidade/co-pai; solicitar no RHIS com **30 dias** de antecedência quando possível.

2.5. **PLR:** elegível para CLT com 12+ meses no ano de apuração; peso **70% meta coletiva / 30% meta individual**; pagamento até **31/mar** do ano seguinte.

---

## 3. Reembolso de certificações **AWS** e **Azure**

3.1. Certificações elegíveis (lista positiva no portal RH, atualizada em fevereiro/2026) incluem, entre outras: **AWS Certified Solutions Architect – Professional**, **AWS Certified Security – Specialty**, **Microsoft Certified: Azure Solutions Architect Expert**, **Microsoft Certified: Azure Security Engineer Associate**.

3.2. O reembolso cobre **taxa de exame na íntegra** uma vez por certificação a cada 24 meses, desde que: (a) o colaborador permaneça vínculo ativo por no mínimo 12 meses após o reembolso; (b) a certificação seja diretamente relacionada à função atual ou ao roadmap aprovado pelo gestor; (c) o comprovante de aprovação seja anexado ao fluxo **RH-TEC-14** no sistema **NCS-EXPENSE-PORTAL** (integração via API interna documentada no mapa de sistemas).

3.3. Tentativas de reprovação não são reembolsáveis após a segunda ocorrência no mesmo exame, salvo **plano de recuperação** assinado pelo gerente e pela área de *Learning & Development*.

3.4. É condição de elegibilidade a **não violação** das políticas de segurança (Seção 4). Colaboradores com advertência formal por vazamento de credencial ou bypass de MFA ficam **suspensos** do benefício por 12 meses.

---

## 4. Segurança da informação e conformidade

4.1. Todos os repositórios de código devem usar **branch protection** com *required status checks* provenientes do pipeline GitHub Actions corporativo (ver guia de onboarding). *Secrets* de CI são injetados via **OIDC** para **AWS** e **Azure** com *roles* de curta duração; é proibido *personal access token* de longa duração em variáveis públicas.

4.2. Dados classificados como **PII** ou **financeiros** devem transitar apenas por serviços que implementem **cifragem em trânsito (TLS 1.2+)** e **mascaramento** em logs. O **NCS-AUDIT-SINK** (ingestão de trilhas de auditoria) deve receber eventos com **idempotência** garantida por chave `(tenant_id, event_id)` para evitar duplicidade em reprocessamentos pós-falha.

4.3. Qualquer incidente com indício de **exfiltração** ou indisponibilidade prolongada de componente **Tier-0** aciona o **Comitê de Crise Lumina** e o protocolo de comunicação com clientes definido pelo *Customer Reliability Engineering*, incluindo template de *status page* e prazos de atualização conforme severidade.

4.4. O descumprimento desta política pode resultar em medidas disciplinares, inclusive rescisão contratual, sem prejuízo das sanções legais cabíveis.

---

**Contato dúvidas:** `rh-politicas@lumina.internal` (canal autenticado via SSO corporativo).
