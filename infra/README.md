# AssignTrack — Infrastructure (Terraform)

Infrastructure-as-code for AssignTrack. A **single EC2 box** runs the whole app:
nginx is the edge reverse proxy — `/` → the React build served by PM2 on `:3000`,
`/api` → the Node backend on `:5001`. Both tiers run as PM2-managed processes.
The box also hosts the GitHub Actions **self-hosted runner** that ships updates.

```
GitHub push to main ─▶ self-hosted runner (on EC2) ─▶ rebuild + restart in place
Internet ─▶ EC2 :80 (nginx) ─┬─ /        → PM2 'serve' static :3000 (/var/www/assigntrack)
                             └─ /api/...  → Node backend :5001 ─▶ MongoDB Atlas
```

## Layout

| Path | Purpose |
|---|---|
| `bootstrap/` | One-time stack that creates the S3 state bucket + DynamoDB lock table. |
| `main.tf` | AWS provider + S3 remote backend (partial config). |
| `network.tf` | Default VPC + security group (80 public, 22 optional). |
| `ec2.tf` | Ubuntu AMI, IAM role + SSM instance profile, instance, Elastic IP. |
| `user_data.sh.tpl` | Boot script: swap → Node/PM2 → backend (PM2) → frontend build + PM2 serve → nginx → runner. |
| `outputs.tf` | App URL, public IP, SSM connect command. |

## One-time setup

### 1. Create the remote-state backend

```bash
cd infra/bootstrap
terraform init
terraform apply -var="bucket_name=<globally-unique-name>"
# note the two outputs:
#   state_bucket  -> GitHub secret TF_STATE_BUCKET
#   lock_table    -> GitHub secret TF_LOCK_TABLE
```

### 2. Add GitHub repo secrets

`Settings → Secrets and variables → Actions`:

| Secret | Value |
|---|---|
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | IAM user keys Terraform uses. |
| `GH_PAT` | GitHub PAT with `repo` + `manage_runners` scope (runner registration + clone). |
| `PROD` | Backend `.env` body — `MONGO_URI`, `JWT_SECRET`, `PORT=5001`. |
| `TF_STATE_BUCKET` / `TF_LOCK_TABLE` | The two outputs from step 1. |

### 3. Provision the stack

Run the **Infra (Terraform)** workflow (`Actions → Infra (Terraform) → Run workflow`)
with `action = apply`. On success the `app_url` output is the live site, and the
self-hosted runner registers itself within a minute or two.

### 4. Ship updates

Push to `main` → the **Deploy** workflow runs on the self-hosted runner, re-tests
the backend (deploy gate), restarts PM2, rebuilds the frontend, and republishes it.

### Tear down

Run **Infra (Terraform)** with `action = destroy`. (It runs on a GitHub-hosted
runner, never self-hosted, so destroy can't kill the runner mid-job.)

## Local runs (optional)

```bash
cp terraform.tfvars.example terraform.tfvars   # fill in real values; never commit
terraform init \
  -backend-config="bucket=<TF_STATE_BUCKET>" \
  -backend-config="dynamodb_table=<TF_LOCK_TABLE>" \
  -backend-config="region=ap-southeast-2"
terraform apply
```

## Decommissioning the old box

The previous **manually-created** instance (`i-08c78e1a2b7e89fd4`) is not managed
by this Terraform. Once the new stack is verified live, stop/terminate it from the
EC2 console so you aren't paying for two instances.
