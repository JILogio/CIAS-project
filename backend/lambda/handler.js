const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

// Configurar con los parámetros usando AWS
const REGION = process.env.AWS_REGION || "us-east-1";
const SNS_TOPIC_ARN = process.env.SNS_TOPIC_ARN;   // requerido
const LOG_BUCKET = process.env.LOG_BUCKET;         // requerido

const sns = new SNSClient({ region: REGION });
const s3 = new S3Client({ region: REGION });

function buildMessage(incident) {
  const sev = (incident.severity || "").toUpperCase();
  const isCritical = (incident.severity || "").toLowerCase() === "high";

  const subject = isCritical ? "CIAS - ALERTA CRÍTICA" : `CIAS - Incidencia ${sev || "N/A"}`;
  const body =
    `Sistema: CIAS
    Severidad: ${incident.severity}
    Servicio: ${incident.service}
    Título: ${incident.title}
    Descripción: ${incident.description}
    Reportado por: ${incident.reportedBy}
    Fecha: ${incident.createdAt}`;

  return { subject, body, isCritical };
}

async function publishToSNS(subject, message) {
  if (!SNS_TOPIC_ARN) throw new Error("Missing env var SNS_TOPIC_ARN");

  await sns.send(new PublishCommand({
    TopicArn: SNS_TOPIC_ARN,
    Subject: subject,
    Message: message
  }));
}

async function writeLogToS3(incident, extra) {
  if (!LOG_BUCKET) throw new Error("Missing env var LOG_BUCKET");

  const date = new Date().toISOString();
  const sev = (incident.severity || "unknown").toLowerCase();
  const key = `incidents/${sev}/${incident.id || "no-id"}-${Date.now()}.json`;

  const payload = {
    ...incident,
    processedAt: date,
    result: extra
  };

  await s3.send(new PutObjectCommand({
    Bucket: LOG_BUCKET,
    Key: key,
    Body: JSON.stringify(payload, null, 2),
    ContentType: "application/json"
  }));

  return { bucket: LOG_BUCKET, key };
}

exports.handler = async (event) => {
  const incident = event?.incident;
  if (!incident) {
    console.warn("No incident in event:", JSON.stringify(event));
    return { ok: false, error: "NO_INCIDENT" };
  }

  const { subject, body, isCritical } = buildMessage(incident);

  // Publica SIEMPRE (simple para la práctica). Si quieres, lo limitamos a 'high'.
  await publishToSNS(subject, body);

  const logInfo = await writeLogToS3(incident, { notified: true, critical: isCritical });

  return { ok: true, notified: true, log: logInfo };
};
