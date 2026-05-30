import { Effect, Layer, Logger, LogLevel } from "effect"
import { HttpRouter, HttpServer, HttpServerResponse } from "@effect/platform"
import { NodeHttpServer } from "@effect/platform-node"
import { createServer } from "node:http"

// Define the routes
const router = HttpRouter.empty.pipe(
  HttpRouter.get(
    "/",
    Effect.succeed(HttpServerResponse.text("Hello from Effect Platform Backend!"))
  ),
  HttpRouter.get(
    "/api/status",
    Effect.sync(() => ({ status: "running", uptime: process.uptime() })).pipe(
      Effect.flatMap(HttpServerResponse.json)
    )
  )
)

// Create the server layer listening on port 3000
const ServerLive = NodeHttpServer.layer(createServer, { port: 3000 })

// Serve the router - HttpServer.serve returns a Layer
const HttpLive = HttpServer.serve(router).pipe(
  Layer.provide(ServerLive)
)

// Start the application
Layer.launch(HttpLive).pipe(
  Logger.withMinimumLogLevel(LogLevel.Debug),
  Effect.tapErrorCause(Effect.logError),
  Effect.runFork
)
