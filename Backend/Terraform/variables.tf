variable "region" {
  type    = string
  default = "us-east-1"
}

variable "project_name" {
  type    = string
  default = "cias"
}

# Email para suscripción SNS
variable "alert_email" {
  type = string
}

# Nombre tabla
variable "dynamodb_table_name" {
  type    = string
  default = "CIAS_Incidents"
}

variable "labrole_arn" {
  type        = string
  description = "ARN del rol existente LabRole"
}
