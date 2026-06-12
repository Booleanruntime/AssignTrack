variable "region" {
  description = "AWS region (Sydney by default to match the existing setup)."
  type        = string
  default     = "ap-southeast-2"
}

variable "bucket_name" {
  description = "Globally-unique S3 bucket name for Terraform remote state."
  type        = string
}

variable "lock_table_name" {
  description = "DynamoDB table name used for state locking."
  type        = string
  default     = "assigntrack-tflock"
}
