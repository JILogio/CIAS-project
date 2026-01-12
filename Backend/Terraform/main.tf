provider "aws" {
  region = "us-east-1"
  token = ""
  access_key = ""
  secret_key = ""
}

locals {
  api_lambda_name      = "${var.project_name}-incidents-api"
  notifier_lambda_name = "${var.project_name}-incident-notifier"
  topic_name = "${var.project_name}-incidents-alerts"
  gsi_severity = "GSI_Severity_CreatedAt"
}

# ---------------------------
# SNS
# ---------------------------
resource "aws_sns_topic" "alerts" {
  name = local.topic_name
}

resource "aws_sns_topic_subscription" "email" {
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email
  # IMPORTANT: requiere confirmación manual por email
}

# ---------------------------
# DynamoDB + Streams + GSIs
# ---------------------------
resource "aws_dynamodb_table" "incidents" {
  name         = var.dynamodb_table_name

  read_capacity  = 1
  write_capacity = 1

  hash_key  = "incidentId"
  range_key = "createdAt"

  attribute {
    name = "incidentId"
    type = "S"
  }

  attribute {
    name = "createdAt"
    type = "S"
  }

  attribute {
    name = "severity"
    type = "S"
  }

  global_secondary_index {
    name            = local.gsi_severity
    hash_key        = "severity"
    range_key       = "createdAt"
    projection_type = "ALL"
    read_capacity      = 1
    write_capacity     = 1
  }

  stream_enabled   = true
  stream_view_type = "NEW_IMAGE"
}

# ---------------------------
# Empaquetar Lambdas (ZIP)
# ---------------------------
data "archive_file" "lambda_api_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../Lambda/lambda_api"
  output_path = "${path.module}/lambda_api.zip"
}

data "archive_file" "lambda_notifier_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../Lambda/lambda_notifier"
  output_path = "${path.module}/lambda_notifier.zip"
}

# ---------------------------
# Lambda Functions
# ---------------------------
resource "aws_lambda_function" "api" {
  function_name = local.api_lambda_name
  role          = var.labrole_arn
  runtime       = "nodejs20.x"
  handler       = "index.handler"

  filename         = data.archive_file.lambda_api_zip.output_path
  source_code_hash = data.archive_file.lambda_api_zip.output_base64sha256

  environment {
    variables = {
      TABLE_NAME    = aws_dynamodb_table.incidents.name
      GSI_SEVERITY  = local.gsi_severity
    }
  }
}

resource "aws_lambda_function" "notifier" {
  function_name = local.notifier_lambda_name
  role          = var.labrole_arn
  runtime       = "nodejs20.x"
  handler       = "index.handler"

  filename         = data.archive_file.lambda_notifier_zip.output_path
  source_code_hash = data.archive_file.lambda_notifier_zip.output_base64sha256

  environment {
    variables = {
      SNS_TOPIC_ARN = aws_sns_topic.alerts.arn
    }
  }
}

# ---------------------------
# DynamoDB Stream -> Lambda Notifier (trigger)
# ---------------------------
resource "aws_lambda_event_source_mapping" "ddb_stream_to_notifier" {
  event_source_arn  = aws_dynamodb_table.incidents.stream_arn
  function_name     = aws_lambda_function.notifier.arn
  starting_position = "LATEST"
  batch_size        = 1
  enabled           = true
}

# ---------------------------
# API Gateway HTTP API
# ---------------------------
resource "aws_apigatewayv2_api" "http_api" {
  name          = "${var.project_name}-http-api"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_integration" "lambda_api" {
  api_id                 = aws_apigatewayv2_api.http_api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.api.arn
  payload_format_version = "2.0"
}

# Routes
resource "aws_apigatewayv2_route" "post_incidents" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "POST /incidents"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_api.id}"
}

resource "aws_apigatewayv2_route" "get_incidents" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "GET /incidents"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_api.id}"
}

resource "aws_apigatewayv2_route" "patch_incident" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "PATCH /incidents/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_api.id}"
}

resource "aws_apigatewayv2_route" "get_incidents_all" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "GET /incidents/all"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_api.id}"
}

resource "aws_apigatewayv2_route" "get_health" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "GET /health"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_api.id}"
}

resource "aws_apigatewayv2_stage" "prod" {
  api_id      = aws_apigatewayv2_api.http_api.id
  name        = "prod"
  auto_deploy = true
}

# Permitir que API Gateway invoque la Lambda API
resource "aws_lambda_permission" "allow_apigw_invoke" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http_api.execution_arn}/*/*"
}

resource "aws_apigatewayv2_api" "http_api_cors" {
  name          = "${var.project_name}-http-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = [
      "http://localhost:3000",
      "http://localhost:5173"
    ]
    allow_methods = ["GET", "POST", "PATCH", "OPTIONS"]
    allow_headers = ["content-type", "authorization", "x-requested-with"]
    max_age       = 3600
  }
}
