import "dotenv/config";
import express from "express";
import { router } from "./routes/crud.routes";
import { connectToMongoDB } from "./config/mongo";

const getApp = async () => {
  await connectToMongoDB();

  const app = express();

  app.use(express.json());

  app.use("/v1/contacts", router);

  const PORT = 4500;

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

getApp();
