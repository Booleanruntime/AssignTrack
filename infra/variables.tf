variable "region" {
  description = "AWS region."
  type        = string
  default     = "ap-southeast-2"
}

variable "instance_type" {
  description = "EC2 instance type. t3.micro is Free-Tier eligible (750 hrs/mo)."
  type        = string
  default     = "t3.micro"
}

variable "root_volume_size" {
  description = "Root EBS volume size in GB (Free Tier allows up to 30GB)."
  type        = number
  default     = 20
}

# GitHub

variable "github_owner" {
  description = "GitHub org/user that owns the repo."
  type        = string
}

variable "github_repo" {
  description = "Repository name."
  type        = string
}

variable "github_pat" {
  description = "GitHub PAT with repo + manage_runners scope. Used to self-register the EC2 runner at boot and to clone the repo."
  type        = string
  sensitive   = true
}

# Backend runtime config

variable "prod_env" {
  description = "Full body of the backend production .env (MONGO_URI, JWT_SECRET, PORT=5001, ...). Written to the box at boot."
  type        = string
  sensitive   = true
}

# SSH

variable "ssh_ingress_cidr" {
  description = "CIDR allowed to reach port 22. Default open; tighten to your IP/32. SSM Session Manager is the primary access path and needs no inbound rule."
  type        = string
  default     = "0.0.0.0/0"
}

variable "key_name" {
  description = "Optional existing EC2 key pair name for SSH. Leave empty to rely on SSM only."
  type        = string
  default     = ""
}
