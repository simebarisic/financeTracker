# Kubernetes - Finance Tracker

Isti uzorak kao u moj-kompic projektu: Kustomize (ugrađen u `kubectl`), lokalni
k3d klaster (k3s u Dockeru) s Traefikom i cert-managerom, te CI koji na svakom
PR-u digne privremeni klaster i testira deploy.

```
k8s/
├── base/                  zajedničko (Deployment/Service/..., bez namespacea i hostova)
│   ├── postgres.yaml      StatefulSet + headless Service + PVC
│   ├── backup.yaml        CronJob: dnevni pg_dump u zaseban PVC
└── overlays/
    ├── local/             k3d + Traefik + cert-manager (Ingress, TLS, secret.env)
    └── ci/                GitHub Actions (bez Ingressa, testni secreti)
```

## Pokretanje

Preduvjeti: Docker Desktop + `brew install k3d kubectl`.

```bash
./scripts/k8s-local.sh up        # klaster + cert-manager + build + deploy
./scripts/k8s-local.sh status
./scripts/k8s-local.sh deploy    # nakon promjene koda: rebuild + rollout
./scripts/k8s-local.sh trust-ca  # macOS vjeruje lokalnom CA -> HTTPS bez upozorenja
./scripts/k8s-local.sh stop      # pauza (podaci ostaju); "up" nastavlja
./scripts/k8s-local.sh down      # briše klaster i podatke
```

Adrese:

- https://finance.localtest.me

Svaki projekt ima svoj k3d klaster (`finance-tracker`), a svi koriste portove
80/443 - istovremeno radi samo jedan. Skripta te upozori ako je drugi upaljen
(`k3d cluster stop <ime>`).

Baza (Postgres StatefulSet) ima vlastiti PVC, a CronJob `postgres-backup` svaki dan
u 03:00 radi `pg_dump` u zaseban PVC (`./scripts/k8s-local.sh backup` za ručni backup).

## Specifično za ovaj projekt

- Frontend nginx radi `proxy_pass` na `http://backend:8080` - backend Service se zato zove `backend`.
- Login: korisnik `admin`, lozinka je `APP_ADMIN_PASSWORD` iz `k8s/overlays/local/secret.env`
  (skripta je generira nasumično pri prvom `up`).
- Flyway migracije se izvrše pri startu backenda (startupProbe daje do 5 min).

## CI

`.github/workflows/k8s.yml`: validira manifeste (kubeconform), builda image(e),
digne efemerni k3d klaster na runneru, deploya `overlays/ci` i napravi smoke test.
