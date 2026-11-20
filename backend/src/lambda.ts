import { handle } from "hono/aws-lambda";
import { app } from "./app.js";

// Entry point for AWS Lambda (API Gateway / Function URL). Not used by the Node server.
export const handler = handle(app);
