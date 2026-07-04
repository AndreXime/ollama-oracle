# Lumina Tech — TI & Acessos (guia prático) (v2026.04)

**Classificação interna:** Colaboradores — Lumina Tech  
**Escopo:** contas, SSO, dispositivos, softwares, VPN/ZTNA/MFA, acesso a sistemas e suporte.  

---

## 1) Como abrir chamado (regra de ouro)

- Use o **ITSM interno** e escolha a categoria correta (**Acesso**, **Incidente**, **Solicitação**, **Hardware/Software**).
- Sempre inclua: **squad/área**, **urgência**, **prazo**, **impacto**, **prints/logs** (sem PII) e **passos para reproduzir** (se aplicável).

---

## 2) Conta, senha e SSO

### Esqueci a senha / estou sem acesso ao SSO
- Use o fluxo de **recuperação de conta** no portal corporativo.
- Se você perdeu o segundo fator (TOTP), abra **chamado ITSM** em **Identidade/SSO**.

### Troquei celular e perdi o MFA (TOTP)
- Abra ITSM com assunto **“MFA/TOTP — troca de dispositivo”**.
- Informe: e-mail corporativo, data/hora aproximada da perda e um canal alternativo para confirmação (conforme política de segurança).

### O que é o `lumina.internal`?
- Domínio interno (intranet/serviços corporativos da **Lumina Tech**). Recursos críticos exigem autenticação via **NCS-AUTH-GATEWAY**.

---

## 3) VPN / ZTNA / acesso remoto

### Preciso usar VPN/ZTNA?
- Sim, para acessar recursos internos e qualquer atividade que envolva dados sensíveis.
- O padrão corporativo exige **certificado de máquina + MFA**.

### Minha VPN cai ou fica lenta
- Verifique:
  - rede local e cabo/wi-fi,
  - horário (picos no início do expediente),
  - se o cliente está atualizado.
- Se persistir, abra ITSM com:
  - provedor de internet,
  - cidade,
  - logs do cliente (se permitido),
  - horário dos eventos.

---

## 4) Acesso a sistemas (staging/prod) e mínimo privilégio

### Como pedir acesso a um sistema
- Abra ITSM em **Acesso** com assunto: **“Acesso — <sistema> — <ambiente> — <perfil>”**.
- Informe:
  - **motivo** (o que você precisa fazer),
  - **prazo** (acesso temporário preferencial),
  - **perfil** (read-only / operador / admin),
  - **gestor direto** (aprovação),
  - **squad**.

### Preciso acessar produção para “ver algo rápido”
- Evite. Prefira:
  - dashboards (métricas),
  - traces,
  - logs com mascaramento,
  - replicar em staging,
  - acionar o **owner/on-call** do serviço.

### O que muda para Tier-0/Tier-1
- Acesso e mudanças são mais rigorosos:
  - preferir **JIT** (just-in-time),
  - auditoria obrigatória,
  - registro no ITSM.

---

## 5) Dispositivos e segurança (endpoint)

### Posso usar notebook pessoal?
- Apenas se aprovado por Segurança/TI e com controles mínimos (criptografia, EDR, updates).
- Regra prática: atividades com dados sensíveis devem ocorrer em **dispositivo corporativo**.

### Meu notebook corporativo está com problema
- ITSM → **Hardware**.
- Inclua:
  - modelo,
  - número de patrimônio (se houver),
  - sintomas,
  - fotos/erro,
  - urgência (bloqueia trabalho?).

---

## 6) Softwares e licenças

### Como solicitar uma ferramenta/licença (ex.: IDE, design, BI)
- ITSM → **Software/Licença**.
- Informe:
  - ferramenta,
  - justificativa,
  - time/área,
  - custo estimado (se souber),
  - centro de custo (se aplicável),
  - prazo.

### Posso instalar qualquer coisa?
- Não. Use software aprovado e siga a política de segurança.

---

## 7) E-mail, calendário e reuniões

### Não consigo enviar e-mail / convite falha
- Teste webmail e cliente local.
- Abra ITSM em **Colaboração** com:
  - mensagem de erro,
  - destinatário (sem expor dados sensíveis),
  - horário.

---

## 8) SLAs de atendimento TI (abril/2026)

| Prioridade | Exemplos | SLA primeira resposta | SLA resolução alvo |
|------------|----------|----------------------|-------------------|
| **P1 — Crítico** | Sem SSO, VPN down, produção bloqueada | **30 min** | **4h** |
| **P2 — Alto** | Notebook quebrado, acesso urgente Tier-1 | **2h** | **1 dia útil** |
| **P3 — Médio** | Software, licença, acesso staging | **4h** | **3 dias úteis** |
| **P4 — Baixo** | Dúvidas, melhorias | **1 dia útil** | **5 dias úteis** |

Plantão TI identidade: `#ti-plantao` no Slack (horário comercial estendido 8h–20h BRT).

---

## 9) Sistemas internos (referência rápida)

| Sistema | URL interna | Uso |
|---------|-------------|-----|
| **RHIS** | `https://rhis.lumina.internal` | Férias, holerite, performance, benefícios |
| **ITSM** | `https://itsm.lumina.internal` | Chamados, incidentes, acessos |
| **NCS-EXPENSE-PORTAL** | `https://expense.internal.lumina` | Reembolsos, certificações |
| **Confluence** | `https://wiki.lumina.internal` | Documentação, ADRs |
| **GitHub Enterprise** | `https://github.lumina.internal` | Código (org `lumina`) |
| **Grafana** | `https://grafana.lumina.internal` | Métricas e dashboards |
| **Status Page** | `https://status.lumina.cloud` | Comunicação externa de incidentes |

