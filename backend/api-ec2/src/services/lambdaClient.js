const { LambdaClient, InvokeCommand } = require("@aws-sdk/client-lambda");

function getLambdaClient() {
  const region = process.env.AWS_REGION || "us-east-1";
  return new LambdaClient({ region });
}

/**
 * Invoca Lambda de forma asíncrona (Event) para no bloquear la API.
 */
async function invokeProcessIncident(incident) {
  const functionName = process.env.LAMBDA_PROCESS_INCIDENT;
  if (!functionName) {
    const err = new Error("Missing env var LAMBDA_PROCESS_INCIDENT");
    err.statusCode = 500;
    throw err;
  }

  const client = getLambdaClient();
  const cmd = new InvokeCommand({
    FunctionName: functionName,
    InvocationType: "Event", // async
    Payload: Buffer.from(JSON.stringify({ incident }))
  });

  await client.send(cmd);
}

module.exports = { invokeProcessIncident };
