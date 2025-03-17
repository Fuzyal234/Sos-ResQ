import Fastify, { FastifyInstance } from "fastify";
import sequelizeInit from "../config/sequelize";
import adminRoutes from "../routes/admin/admin.routes";
import authRoutes from "../routes/admin/auth.routes";
import userAuthRoutes from "../routes/user/auth.routes";
import userRoutes from "../routes/user/user.routes";
import Ajv from "ajv";
import ajvFormats from "ajv-formats";
import ajvErrors from "ajv-errors";
import redisService from "../services/redis.service";

// Initialize fastify with a default instance
let fastify: FastifyInstance = Fastify({ logger: true });

beforeAll(async () => {
    try {
        // Test DB connection
        await sequelizeInit.authenticate();
        await sequelizeInit.sync();
        console.log("✅ Database connection established successfully.");
    } catch (error) {
        console.error("❌ Unable to connect to the database:", error);
        process.exit(1);
    }
    
    // Register routes
    fastify.register(adminRoutes);
    fastify.register(authRoutes);
    fastify.register(userAuthRoutes);
    fastify.register(userRoutes);
    
    await fastify.ready();
});

afterAll(async () => {
    if (fastify) {
        await fastify.close();
    }
    await redisService.close();
});

const ajv = new Ajv({ allErrors: true, strict: false });
ajvFormats(ajv);
ajvErrors(ajv);

if (fastify) {
    fastify.setValidatorCompiler(({ schema }: { schema: any }) => ajv.compile(schema));
    fastify.setErrorHandler((error: any, request: any, reply: any) => {
        if (error.validation) {
            const errors = error.validation.flatMap((e: any) => {
                if (
                    e.keyword === "errorMessage" &&
                    Array.isArray(e.params?.errors)
                ) {
                    return e.params.errors.map((innerErr: any) => ({
                        field:
                            innerErr.params?.missingProperty ||
                            innerErr.instancePath.replace("/", ""),
                        message: e.message,
                    }));
                }

                return [
                    {
                        field:
                            e.params?.missingProperty ||
                            e.instancePath.replace("/", ""),
                        message: e.message,
                    },
                ];
            });

            return reply.status(400).send({
                status: 400,
                message: "Validation error",
                error: true,
                errors,
            });
        }

        reply.send(error);
    });
}

export default fastify;