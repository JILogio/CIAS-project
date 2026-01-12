import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  UpdateCommand
} from "@aws-sdk/lib-dynamodb";
import crypto from "crypto";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const TABLE_NAME = process.env.TABLE_NAME;
const GSI_SEVERITY = process.env.GSI_SEVERITY;

const json = (statusCode, body) => ({
  statusCode,
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body)
});

const safeJsonParse = (s) => {
  try { return JSON.parse(s ?? "{}"); } catch { return null; }
};

export const handler = async (event) => {
  const method = event?.requestContext?.http?.method || event.httpMethod;
  const path = event?.requestContext?.http?.path || event.path || "/";

  // Health
  if (method === "GET" && path.endsWith("/health")) {
    return json(200, { ok: true, service: "CIAS_IncidentsApi" });
  }

  // POST /incidents  -> crear incidente
  if (method === "POST" && path.endsWith("/incidents")) {
    const body = safeJsonParse(event.body);
    if (!body) return json(400, { error: "JSON inválido" });

    const required = ["title", "description", "severity", "service", "reportedBy"];
    const missing = required.filter((k) => !body?.[k]);
    if (missing.length) {
      return json(400, { error: "Faltan campos", missing });
    }

    const now = new Date().toISOString();
    const incidentId = body.incidentId || `INC-${crypto.randomUUID()}`;

    const item = {
      incidentId,
      createdAt: now,
      title: String(body.title),
      description: String(body.description),
      severity: String(body.severity).toLowerCase(), // high/medium/low
      service: String(body.service),
      reportedBy: String(body.reportedBy),
      status: body.status ? String(body.status) : "open",
      updatedAt: now
    };

    await ddb.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: item
    }));

    return json(201, { message: "Incidencia creada", item });
  }

  // GET /incidents/all?limit=50&nextToken=...
  // Devuelve todas las incidencias (Scan) con paginación
  if (method === "GET" && path.endsWith("/incidents/all")) {
    const qs = event.queryStringParameters || {};
    const limit = Math.min(parseInt(qs.limit || "50", 10), 200); // max 200 por seguridad

    // nextToken viene en base64 (opcional)
    let ExclusiveStartKey = undefined;
    if (qs.nextToken) {
      try {
        ExclusiveStartKey = JSON.parse(Buffer.from(qs.nextToken, "base64").toString("utf8"));
      } catch {
        return json(400, { error: "nextToken inválido" });
      }
    }

    const result = await ddb.send(new ScanCommand({
      TableName: TABLE_NAME,
      Limit: limit,
      ExclusiveStartKey
    }));

    const nextToken = result.LastEvaluatedKey
      ? Buffer.from(JSON.stringify(result.LastEvaluatedKey), "utf8").toString("base64")
      : null;

    return json(200, {
      count: result.Count ?? 0,
      items: result.Items ?? [],
      nextToken
   });
  }

  // GET /incidents?severity=high
  if (method === "GET" && path.endsWith("/incidents")) {
    const qs = event.queryStringParameters || {};
    const severity = qs.severity?.toLowerCase();

    if (!severity && !service) {
      return json(400, {
        error: "Debes enviar severity como query param",
        example: [
          "/incidents?severity=high",
        ]
      });
    }

    let params;
    if (severity) {
      params = {
        TableName: TABLE_NAME,
        IndexName: GSI_SEVERITY,
        KeyConditionExpression: "severity = :s",
        ExpressionAttributeValues: { ":s": severity },
        ScanIndexForward: false, // más recientes primero (por createdAt)
        Limit: 50
      };
    }

    const result = await ddb.send(new QueryCommand(params));
    return json(200, { count: result.Count ?? 0, items: result.Items ?? [] });
  }

  // PATCH /incidents/{id} -> update status (open -> closed, etc.)
  if (method === "PATCH" && path.includes("/incidents/")) {
    const id = event?.pathParameters?.id;

    if (!id) return json(400, { error: "Falta path param {id}" });

    const body = safeJsonParse(event.body);
    if (!body) return json(400, { error: "JSON inválido" });

    const newStatus = body.status ? String(body.status) : null;
    const allowed = ["open", "in_progress", "closed"];

    if (!newStatus || !allowed.includes(newStatus)) {
      return json(400, {
        error: "Status inválido",
        allowed,
        example: { status: "closed" }
      });
    }

    // 1) Buscar el registro más reciente de ese incidentId para obtener createdAt
    const q = await ddb.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "incidentId = :id",
      ExpressionAttributeValues: { ":id": id },
      ScanIndexForward: false, // más reciente primero por createdAt
      Limit: 1
    }));

    if (!q.Items || q.Items.length === 0) {
      return json(404, { error: "Incidencia no encontrada", incidentId: id });
    }

    const item = q.Items[0];

    // 2) Actualizar el status del ítem encontrado
    const updatedAt = new Date().toISOString();

    const updated = await ddb.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { incidentId: item.incidentId, createdAt: item.createdAt },
      UpdateExpression: "SET #st = :st, updatedAt = :u",
      ExpressionAttributeNames: { "#st": "status" },
      ExpressionAttributeValues: { ":st": newStatus, ":u": updatedAt },
      ReturnValues: "ALL_NEW"
    }));

    return json(200, {
      message: "Status actualizado",
      item: updated.Attributes
    });
  }

  return json(404, { error: "Ruta no encontrada", method, path });
};
