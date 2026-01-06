const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");

const incidentsRoutes = require("./routes/incidents.routes");
const { notFound, errorHandler } = require("./middlewares/error.middleware");

const app = express();

app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "CIAS API", ts: new Date().toISOString() });
});

app.use("/api/incidents", incidentsRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
