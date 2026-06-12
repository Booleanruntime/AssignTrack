output "state_bucket" {
  description = "Pass this to the main stack's `terraform init -backend-config=\"bucket=...\"` (GitHub secret TF_STATE_BUCKET)."
  value       = aws_s3_bucket.tfstate.id
}

output "lock_table" {
  description = "Pass this to the main stack's `terraform init -backend-config=\"dynamodb_table=...\"` (GitHub secret TF_LOCK_TABLE)."
  value       = aws_dynamodb_table.tflock.name
}
