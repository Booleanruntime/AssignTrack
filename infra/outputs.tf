output "app_url" {
  description = "Public URL for the app (nginx serves the React build and proxies /api)."
  value       = "http://${aws_eip.app.public_ip}"
}

output "ec2_public_ip" {
  description = "Elastic IP of the instance."
  value       = aws_eip.app.public_ip
}

output "ssm_connect" {
  description = "Shell into the box without SSH."
  value       = "aws ssm start-session --target ${aws_instance.app.id} --region ${var.region}"
}
