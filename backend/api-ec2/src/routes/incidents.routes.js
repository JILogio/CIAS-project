const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { invokeProcessIncident } = require("../services/lambdaClient");

const router = express.Router();

/**
 * En memoria solo para demo local.
 * En AWS real, podrías reemplazar esto por DynamoDB/RDS.
 */
const INCIDENTS = [];

function validateIncident(body) {
  const required = ["title", "description", "severity", "service", "reportedBy"];
  for (const k of required) {
    if (!body?.[k] || typeof body[k] !== "string" || body[k].trim().length === 0) {
      return `Campo requerido inválido: ${k}`;
    }
  }

  const sev = body.severity.toLowerCase();
  if (!["low", "medium", "high"].includes(sev)) {
    return "severity debe ser: low | medium | high";
  }

  return null;
}

router.post("/", async (req, res, next) => {
  try {
    const error = validateIncident(req.body);
    if (error) {
      return res.status(400).json({ ok: false, error: "BAD_REQUEST", message: error });
    }

    const now = new Date().toISOString();
    const incident = {
      id: uuidv4(),
      title: req.body.title.trim(),
      description: req.body.description.trim(),
      severity: req.body.severity.toLowerCase(),
      service: req.body.service.trim(),
      reportedBy: req.body.reportedBy.trim(),
      createdAt: now
    };

    INCIDENTS.push(incident);

    // Dispara el procesamiento en Lambda (async)
    await invokeProcessIncident(incident);

    res.status(201).json({
      ok: true,
      message: "Incident received. Processing started.",
      incident
    });
  } catch (err) {
    next(err);
  }
});

router.get("/", (req, res) => {
  res.json({ ok: true, count: INCIDENTS.length, items: INCIDENTS });
});

module.exports = router;
