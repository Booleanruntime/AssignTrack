# just use the default VPC, not worth standing up our own for a single box
data "aws_vpc" "default" {
  default = true
}

resource "aws_security_group" "app" {
  name        = "assigntrack-sg"
  description = "AssignTrack single box (nginx serves frontend and proxies /api to Node 5001)"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "HTTP (nginx serves the React build and proxies /api)"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "SSH (optional; SSM is the primary access path)"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.ssh_ingress_cidr]
  }

  # Node :5001 is never exposed; only nginx (:80) is reachable.

  egress {
    description = "All outbound (npm, GitHub, SSM)"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name    = "assigntrack-sg"
    Project = "AssignTrack"
  }
}
