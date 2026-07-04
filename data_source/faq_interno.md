# Lumina Tech — FAQ interno (v2026.04)

**Classificação interna:** Colaboradores — Lumina Tech  
**Objetivo:** responder dúvidas frequentes com informações curtas e acionáveis.  
**Observação:** quando um item citar portal/sistema interno, prefira sempre o link/caminho oficial divulgado no RHIS/ITSM.

---

## 0) Identidade da empresa

### Qual é o nome da empresa?
- A **Lumina Tech** é a empresa brasileira de software B2B e infraestrutura em nuvem (perfil institucional interno).
- O ecossistema de produtos interno usa o prefixo **NCS-*** (Lumina Cloud Services).
- Dúvidas oficiais de marca/comunicação: canal interno de Comunicação (intranet).

---

## 1) Acesso, contas e permissões

### Como peço acesso a um sistema (ex.: ambiente de staging/prod)?
- Abra uma solicitação no **ITSM interno** com assunto **“Acesso — <sistema> — <ambiente>”**.
- Informe: **motivo**, **prazo**, **perfil desejado** (read-only/operador/admin), **squad** e **gestor direto**.
- Para serviços **Tier-0/Tier-1**, o padrão é **mínimo privilégio** e acesso **temporário** (JIT), com auditoria via trilha corporativa.

### Preciso mesmo de acesso a produção?
- Em geral, **não**. Prefira:
  - logs e métricas (observabilidade),
  - *dashboards*,
  - *replay* em ambiente controlado,
  - suporte do plantonista/owner do serviço.
- Acesso direto a produção é exceção para incidentes/plantão e deve ficar registrado no ITSM.

### O que é “Tier-0/Tier-1/Tier-2/Tier-3”?
- Classificação de criticidade de serviço (impacto e requisitos de operação).
- **Tier-0**: impacto máximo; exige disciplina de mudança, on-call e SLO mais rigoroso.
- **Tier-1**: crítico, mas com tolerância ligeiramente maior.
- **Tier-2/Tier-3**: serviços de suporte/analytics/rotinas internas.

---

## 2) Incidentes e operação

### Como abrir um incidente?
- Use o fluxo do **ITSM interno** e selecione **Incidente**.
- Defina severidade (SEV) e inclua:
  - impacto (quem/quantos clientes),
  - início aproximado,
  - sintomas observados,
  - serviços suspeitos (NCS-*),
  - links de métricas/logs.

### Quem assume como Incident Commander (IC)?
- Para **SEV-1/SEV-2**, o IC normalmente é o **on-call** do domínio afetado ou o **SRE on-call**, conforme escala.
- O IC coordena comunicação e decisões; o **owner técnico** executa mitigação.

### O que é post-mortem e quando fazer?
- Documento de aprendizado após incidente relevante.
- Esperado para **SEV-1** e a maioria dos **SEV-2**.
- Deve conter: linha do tempo, causa raiz, fatores contribuintes, correções e ações preventivas.
- IDs corporativos seguem padrão **INC-2026-***.

---

## 3) Deploy, mudanças e engenharia

### Qual padrão de commit usamos?
- **Conventional Commits** (obrigatório) conforme o guia de onboarding de desenvolvedor.
- Mensagens devem ser claras e alinhadas ao escopo do change.

### Como faço um hotfix?
- Siga o processo de “mudança emergencial” do time de engenharia (registrar no ITSM quando for Tier-0/Tier-1).
- Priorize correções pequenas, reversíveis, com validação mínima (*smoke test*).

### O que é ADR e quando escrever?
- **Architecture Decision Record**: registro de decisão de arquitetura.
- Escreva quando a decisão for:
  - transversal (impacta mais de um serviço),
  - difícil de reverter,
  - com trade-offs relevantes (segurança, custo, performance, confiabilidade).

---

## 4) Segurança e conformidade

### Posso colocar tokens/credenciais em repositório?
- **Não.** Secrets devem ficar em cofre/gestão corporativa e seguir política de rotação.
- Se vazar, trate como incidente e siga o playbook de resposta.
- Scanner **Gitleaks** roda em todo PR; violações bloqueiam merge.

### O que é ZTNA/MFA e por que é obrigatório?
- Padrão de acesso remoto corporativo (rede e identidade).
- Reduz risco de comprometimento e mantém trilha de auditoria.
- Cliente VPN: **LuminaSecure Client 4.2+** (Mac/Windows/Linux).

### Reportar phishing ou e-mail suspeito
- Encaminhe para `security-reports@lumina.internal` e abra ticket ITSM categoria **Segurança**.
- Não clique em links; use o botão **Report Phishing** no Outlook corporativo.

---

## 5) RH e rotina

### Como funciona home office/híbrido?
- A empresa adota **modelo remoto/híbrido** conforme elegibilidade e criticidade de sistemas atendidos.
- Para squads que sustentam **Tier-0/Tier-1**, pode haver requisitos de sobreposição e disponibilidade de plantão.

### Como pedir férias/ausência?
- Use o **RHIS** (fluxo oficial).
- Combine com a liderança e garanta cobertura quando houver on-call.
- **Fracionamento:** até 3 períodos; um deles com mínimo de **14 dias corridos** (CLT).
- **Saldo:** consulte RHIS → Tempo → Férias; alerta automático quando saldo > 20 dias.

### Quando recebo PLR?
- Pagamento previsto até **31 de março** do ano seguinte ao exercício (ex.: PLR 2025 paga em mar/2026).
- Elegibilidade: 12+ meses de vínculo CLT no ano de apuração e metas coletivas atingidas.

### Como funciona avaliação de desempenho?
- **2 ciclos/ano:** revisão de meio de ano (junho) e fechamento anual (dezembro).
- Ferramenta: **RHIS → Performance**; calibração entre gestores em julho e janeiro.

---

## 6) Produtos e clientes

### Quem são nossos principais clientes?
- Ver perfil institucional: Banco Horizonte Digital, Rede Saúde Integrada, Grupo Varejo Norte, Energia Sul Transmissão, Pagamentos Atlas.
- Detalhes comerciais: documento **guia_comercial_clientes.md** (acesso Comercial/CS).

### O que é NCS Connect vs NCS Identity?
- **NCS Connect:** mensageria enterprise (**NCS-MSG-ROUTER**).
- **NCS Identity:** autenticação e SSO (**NCS-AUTH-GATEWAY**, **NCS-USER-DIRECTORY**).
- Catálogo completo: **produtos_ncs_catalogo.md**.

---

## 7) Quem procurar (atalhos)

### Dúvidas sobre arquitetura e serviços NCS-*?
- Consulte o **mapa de sistemas** (`arquitetura_projetos.json`) e ADRs.
- Se persistir, acione o **owner** do serviço (lista no mapa) ou a liderança do domínio.

### Dúvidas sobre políticas internas (RH/segurança)?
- Consulte primeiro o documento de **Políticas de RH** (v2026.1) e o material de segurança.
- Se precisar, acione Pessoas & Cultura ou Segurança/Conformidade via canais oficiais.

### Dúvidas sobre incidentes e post-mortems?
- Runbook SRE: **runbook_operacao_sre.md**.
- Histórico: **post_mortems_incidentes_2026.md** (INC-2026-402, 418, 431).

### Dúvidas sobre ética e conduta?
- **codigo_conduta_etica.md**; canal confidencial: `etica@lumina.internal`.

