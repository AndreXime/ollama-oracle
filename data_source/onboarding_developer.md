# Lumina Tech — Onboarding Técnico (Engenharia de Software)

**Público:** novos desenvolvedores (CLT/PJ) alocados a squads de produto ou plataforma  
**Versão:** 2026.05 | **Owner documental:** Office of the CTO + Platform SRE

---

## 1. Acesso e ambientes

1.1. Solicite via ITSM o perfil **`ncs-dev-base`**, que concede leitura aos repositórios `github.com/lumina/*`, acesso VPN ZTNA e MFA alinhados ao **NCS-AUTH-GATEWAY** (tokens JWT com TTL curto — nunca commite *refresh* ou *kubeconfig* com credenciais de longa duração).

1.2. Namespaces **Kubernetes** padrão: `ncs-staging` (desenvolvimento integrado), `ncs-prod` (somente CD aprovado). Políticas de rede e *secrets* injetados via *External Secrets*; segredos de CI usam **OIDC** para **AWS**/**Azure**, não PATs de usuário.

---

## 2. Makefile interno (`Makefile` na raiz do *mono-repo* `ncs-platform`)

Comandos oficiais (GNU Make 4.x). Execute na raiz do clone após `direnv allow` (opcional).

| Alvo | Descrição |
|------|-----------|
| `make ncs-deps` | Instala *toolchain* pinada (Node 22, Go 1.22, `buf`, `kubectl` compatível com EKS 1.29). |
| `make ncs-lint` | Executa ESLint, golangci-lint e *buf lint* em serviços **NCS-*** conforme `CODEOWNERS`. |
| `make ncs-test` | Testes unitários + contratos gRPC (`buf breaking` contra *baseline* `proto/ncs/v1`). |
| `make ncs-chroma-migrate` | **Somente plataforma dados:** aplica migrações locais do ambiente de *embedding* interno de documentação (não confundir com cluster Chroma de produção do cliente — uso interno de engenharia). |
| `make ncs-docker-build SERVICE=msg-router` | Build multi-arquitetura da imagem OCI do serviço indicado (ex.: **NCS-MSG-ROUTER**). |
| `make ncs-k8s-diff ENV=staging` | *Dry-run* `kubectl diff` contra manifestos renderizados por Kustomize em `deploy/overlays/staging`. |

**Proibido:** criar alvos *ad-hoc* no `Makefile` raiz sem ADR; use `Makefile.local` ignorado pelo Git para atalhos pessoais.

---

## 3. Padrões de *commit* — **Conventional Commits** (obrigatório)

Formato: `<tipo>(escopo opcional)!: descrição imperativa em inglês ou português (mínimo 10 caracteres)`

Tipos permitidos no hook `commitlint`: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`.

Exemplos válidos alinhados aos nossos sistemas:

- `fix(msg-router): add exponential backoff to redis timeout loop` *(INC-2026-402)*
- `feat(billing-api): enforce idempotency key on Usage.RecordEvent`
- `ci: pin buf version in ncs-pipeline workflow`

*Breaking change:* sufixo `!` ou *footer* `BREAKING CHANGE:`. *Merge commits* para `main` devem passar por *squash* com mensagem conforme acima.

---

## 4. CI/CD — GitHub Actions (`.github/workflows/ncs-pipeline.yml`)

4.1. **Gatilhos:** *pull request* para `main` e *push* em `release/*`. *Required checks*: `lint`, `test`, `contract-grpc`, `sast-gitleaks`.

4.2. **Estágios principais:**  
- **Build matricial:** Node e Go com cache de dependências; artefatos OCI publicados no registry interno `registry.internal.lumina/ncs/<serviço>:<git-sha>`.  
- **Deploy staging:** automático em merge se *label* `deploy:staging` presente; *rollout* Kubernetes com estratégia *RollingUpdate*, *readiness* contra `/healthz` (ex.: **NCS-AUTH-GATEWAY**, **NCS-BILLING-API**).  
- **Deploy produção:** manual (`workflow_dispatch`) com aprovação de dois revisores (EM + *on-call* Tier-0 para serviços **Tier-0** como **NCS-MSG-ROUTER** e **NCS-EDGE-INGRESS**).

4.3. **Segredos:** apenas via *environments* `staging` e `production` com *protection rules*; rotação trimestral auditada no **NCS-AUDIT-SINK**.

4.4. **Pós-deploy:** *smoke tests* chamando gRPC `billing.v1.Health/Check` e rota REST de *expense* em modo sintético (conta de serviço sem PII real).

---

## 5. Leituras obrigatórias (primeiros 14 dias)

- Políticas de RH: home office, plano de carreira **Y-shape**, reembolso AWS/Azure (**NCS-EXPENSE-PORTAL** / fluxo RH-TEC-14).  
- Mapa de sistemas (`arquitetura_projetos.json`) e **post-mortems** no ITSM interno (IDs **INC-2026-***) — compreender criticidade **Tier-0** e dependências (ex.: *pipeline* de dados → **NCS-BILLING-API**).

**Dúvidas:** canal Slack `#ncs-engineering-onboarding` (SSO obrigatório).
