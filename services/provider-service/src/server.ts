import { app } from "./app";
import connectToMongo from "./config/mongo";

const PORT = Number(process.env.PORT) || 4010;

async function bootstrap() {
  await connectToMongo();

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Provider Service is running on port ${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start Provider Service", err);
  process.exit(1);
});
