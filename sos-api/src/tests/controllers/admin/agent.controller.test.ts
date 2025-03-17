import Fastify from "fastify";
import supertest from "supertest";
import { successResponse, errorResponse } from "../../../helper/responses";
import adminRoutes from "../../../routes/admin/admin.routes";
import authRoutes from "../../../routes/admin/auth.routes";
import userRoutes from "../../../routes/user/auth.routes";
import Ajv from "ajv";
import ajvFormats from "ajv-formats";
import ajvErrors from "ajv-errors";
import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });
import { execSync } from "child_process";
import exp from "constants";
import { date } from "joi";
import sequelizeInit from "../../../config/sequelize";
import { Agent, User } from "../../../models";

// Mock the services
jest.mock("../../../services/admin/agent.service", () => ({
  getAllAgents: jest.fn(),
  getAgentById: jest.fn(),
  createAgent: jest.fn(),
  updateAgent: jest.fn(),
}));

// const fastify = Fastify({ logger: true });
// beforeAll(async () => {
//   try {
//     // Test DB connection
//     await sequelizeInit.authenticate();
//     await sequelizeInit.sync();
//     console.log("✅ Database connection established successfully.");
//   } catch (error) {
//     console.error("❌ Unable to connect to the database:", error);
//     process.exit(1);
//   }

//   fastify.register(adminRoutes);
//   fastify.register(authRoutes);
//   fastify.register(userRoutes);
//   await fastify.ready();
// });

// const ajv = new Ajv({ allErrors: true, strict: false });
// ajvFormats(ajv);
// ajvErrors(ajv);
// fastify.setValidatorCompiler(({ schema }) => ajv.compile(schema));
// fastify.setErrorHandler((error, request, reply) => {
//   if (error.validation) {
//     const errors = error.validation.flatMap((e) => {
//       if (
//         e.keyword === "errorMessage" &&
//         Array.isArray(e.params?.errors)
//       ) {
//         return e.params.errors.map((innerErr) => ({
//           field:
//             innerErr.params?.missingProperty ||
//             innerErr.instancePath.replace("/", ""),
//           message: e.message,
//         }));
//       }

//       return [
//         {
//           field:
//             e.params?.missingProperty ||
//             e.instancePath.replace("/", ""),
//           message: e.message,
//         },
//       ];
//     });

//     return reply.status(400).send({
//       status: 400,
//       message: "Validation error",
//       error: true,
//       errors,
//     });
//   }

//   reply.send(error);
// });
import fastify from "../../globalTestSetup";

let token = "";

describe("Test the root path", () => {
  test("It should response to GET method", async () => {
    const response = await supertest(fastify.server).get("/");
    expect(response.status).toBe(404);
  });
});


describe("Agent Controller Tests", () => {
  beforeAll(async () => {
    const response = await supertest(fastify.server)
      .post("/login/admin")
      .send({
        email: "admin@example.com",
        password: "Admin@123",
      });
    expect(response.status).toBe(200);
    token = response.body.data.token;
  })

  test("POST /admin/agents - Should create a new agent", async () => {
    const response = await supertest(fastify.server)
      .post("/admin/agents")
      .send({
        first_name: "John",
        last_name: "Doe",
        email: "john@example1.com",
        phone_number: "+12344248476",
        date_of_birth: new Date("1990-01-01T00:00:00Z"),
        password: "Password@123",
      })
      .set("Authorization", `Bearer ${token}`);
    console.log('response.body :>> ', response.body);
    expect(response.status).toBe(201);

  });

  test("GET /admin/agents - Should return a list of agents", async () => {
    const response = await supertest(fastify.server)
      .get("/admin/agents")
      .set("Authorization", `Bearer ${token}`);
      console.log('response.body :>> ', response.body);
    expect(response.status).toBe(200);
  })
  // test("GET /admin/agents - Should return a list of agents", async () => {
  //     const response = await supertest(fastify.server)
  //         .get("/admin/agents")
  //         .set("Authorization", `Bearer ${token}`);
  //     expect(response.status).toBe(200);
  //     expect(response.body).toEqual(
  //         successResponse("Agents fetched successfully!", [
  //             { id: "1", user: { first_name: "John", last_name: "Doe", email: "john@example.com" , phone_number: "02244248476"} },
  //         ], 200)
  //     );
  // });
});
describe("User auth Controller Tests", () => {
  test("POST /signup - Should create a new user", async () => {
    const response = await supertest(fastify.server)
      .post("/signup")
      .send({
        first_name: "John",
        last_name: "Doe",
        email: "john@example4.com",
        phone_number: "+12344248476",
        password: "Password@123",
      });
    expect(response.status).toBe(201);
  });
});
afterAll(async () => {
  // await fastify.close();
  // stopDockerContainer(); // 🔥 Stop DB container after tests
});

// describe("Agent Controller Tests", () => {
//     /**
//      * Test: Get all agents
//      */
//     test("GET /admin/agents - Should return a list of agents", async () => {
//         (getAllAgents as jest.Mock).mockResolvedValue([
//             { id: "1", user: { first_name: "John", last_name: "Doe", email: "john@example.com" , phone_number: "02244248476"} },
//         ]);

//         const response = (await supertest(fastify.server).get("/admin/agents").set("Authorization", `Bearer ${token}`));
//         expect(response.status).toBe(200);
//         expect(response.body).toEqual(
//             successResponse("Agents fetched successfully!", [
//                 { id: "1", user: { first_name: "John", last_name: "Doe", email: "john@example.com" , phone_number: "02244248476"} },
//             ], 200)
//         );
//     });

//     /**
//      * Test: Get a single agent by ID
//      */
//     test("GET /admin/agents/:id - Should return a single agent", async () => {
//         (getAgentById as jest.Mock).mockResolvedValue({
//             id: "1",
//             user: { first_name: "John", last_name: "Doe", email: "john@example.com" },
//         });

//         const response = (await supertest(fastify.server).get("/admin/agents/19951552-34ef-4a4b-9963-38b4936a0f0e").set("Authorization", `Bearer ${token}`));
//         expect(response.status).toBe(200);
//         expect(response.body).toEqual(
//             successResponse("Agent fetched successfully!", {
//                 id: "1",
//                 user: { first_name: "John", last_name: "Doe", email: "john@example.com" },
//             }, 200)
//         );
//     });

//     test("GET /admin/agents/:id - Should return 404 if agent is not found", async () => {
//         (getAgentById as jest.Mock).mockResolvedValue(null);

//         const response = (await supertest(fastify.server).get("/admin/agents/201ca2c1-e633-4b26-bb21-2659609883ba").set("Authorization", `Bearer ${token}`));
//         expect(response.status).toBe(404);
//         expect(response.body).toEqual(errorResponse("Agent not found.", 404));
//     });

//     /**
//      * Test: Create a new agent
//      */

//     /**
//      * Test: Update an agent
//      */
//     test("PUT /admin/agents/:id - Should update an agent successfully", async () => {
//         const updateData: CreateAgentDTO = {
//             phone_number: "987654321",
//             first_name: "John",
//             last_name: "Doe",
//             email: "john@example.com",
//             password: "password123",
//             date_of_birth: "1990-01-01",
//         };

//         (updateAgent as jest.Mock).mockResolvedValue({
//             id: "1",
//             user: { first_name: "John", last_name: "Doe", email: "john@example.com", phone_number: "987654321" },
//         });

//         const response = (await supertest(fastify.server).put("/admin/agents/1").send(updateData).set("Authorization", `Bearer ${token}`));
//         expect(response.status).toBe(200);
//         expect(response.body).toEqual(
//             successResponse("Agent updated successfully!", {
//                 id: "1",
//                 user: { first_name: "John", last_name: "Doe", email: "john@example.com", phone_number: "987654321" },
//             }, 200)
//         );
//     });

// });
