output "invoke_url" {
  value = aws_apigatewayv2_stage.prod.invoke_url
}

output "dynamodb_table" {
  value = aws_dynamodb_table.incidents.name
}

output "sns_topic_arn" {
  value = aws_sns_topic.alerts.arn
}
