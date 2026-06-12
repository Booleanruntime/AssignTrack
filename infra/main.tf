terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # bucket / dynamodb_table / region get passed in at init time (see infra.yml)
  backend "s3" {
    key     = "infra/terraform.tfstate"
    encrypt = true
  }
}

provider "aws" {
  region = var.region
}
