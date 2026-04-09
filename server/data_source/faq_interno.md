# NexusCloud Solutions — FAQ interno (v2026.04)

**Classificação interna:** Colaboradores — NexusCloud  
**Objetivo:** responder dúvidas frequentes com informações curtas e acionáveis.  
**Observação:** quando um item citar portal/sistema interno, prefira sempre o link/caminho oficial divulgado no RHIS/ITSM.

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

### O que é ZTNA/MFA e por que é obrigatório?
- Padrão de acesso remoto corporativo (rede e identidade).
- Reduz risco de comprometimento e mantém trilha de auditoria.

---

## 5) RH e rotina

### Como funciona home office/híbrido?
- A empresa adota **modelo remoto/híbrido** conforme elegibilidade e criticidade de sistemas atendidos.
- Para squads que sustentam **Tier-0/Tier-1**, pode haver requisitos de sobreposição e disponibilidade de plantão.

### Como pedir férias/ausência?
- Use o **RHIS** (fluxo oficial).
- Combine com a liderança e garanta cobertura quando houver on-call.

---

## 6) Quem procurar (atalhos)

### Dúvidas sobre arquitetura e serviços NCS-*?
- Consulte o **mapa de sistemas** (`arquitetura_projetos.json`) e ADRs.
- Se persistir, acione o **owner** do serviço (lista no mapa) ou a liderança do domínio.

### Dúvidas sobre políticas internas (RH/segurança)?
- Consulte primeiro o documento de **Políticas de RH** (v2026.1) e o material de segurança.
- Se precisar, acione Pessoas & Cultura ou Segurança/Conformidade via canais oficiais.

