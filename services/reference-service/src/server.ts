import { app } from "./app";
import connectToMongo from "./config/mongo";


const PORT = Number(process.env.PORT) || 4006;

async function bootstrap() {
    await connectToMongo();

    app.listen(PORT, () => {
        console.log(`Reference Service is running on port ${PORT}`);
    }
    );
}

bootstrap().catch((err) => {
    console.error("Failed to start Reference Service", err);
    process.exit(1);
})