import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const sns = new SNSClient({});
const SNS_TOPIC_ARN = process.env.SNS_TOPIC_ARN;

export const handler = async (event) => {
  // Records vienen del stream
  for (const record of event.Records ?? []) {
    // Solo nos interesan INSERT o MODIFY
    if (!["INSERT", "MODIFY"].includes(record.eventName)) continue;

    // NEW_IMAGE trae el item actualizado (en formato DynamoDB)
    const img = record.dynamodb?.NewImage;
    if (!img) continue;

    // Helper para leer strings desde NewImage
    const S = (k) => img?.[k]?.S;
    const severity = (S("severity") || "").toLowerCase();
    const status = (S("status") || "").toLowerCase();

    // Regla de negocio: notificar solo si es high y open
    if (severity !== "high") continue;
    if (status && status !== "open") continue;

    const incidentId = S("incidentId") || "N/A";
    const service = S("service") || "N/A";
    const title = S("title") || "N/A";
    const description = S("description") || "N/A";
    const reportedBy = S("reportedBy") || "N/A";
    const createdAt = S("createdAt") || "N/A";

    const subject = `ALERTA CRÍTICA: ${service}`;
    const message =
      `ALERTA CRÍTICA (CIAS)
      Incidencia: ${incidentId}
      Servicio: ${service}
      Título: ${title}
      Descripción: ${description}
      Reportado por: ${reportedBy}
      Estado: ${status || "open"}
      Fecha: ${createdAt}`;

    if (SNS_TOPIC_ARN) {
      await sns.send(new PublishCommand({
        TopicArn: SNS_TOPIC_ARN,
        Subject: subject,
        Message: message
      }));
    }
  }

  return { ok: true };
};
