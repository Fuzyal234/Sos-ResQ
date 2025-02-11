import Fastify from "fastify";
import supertest from "supertest";
import { successResponse, errorResponse } from "../../../helper/responses";
import { getAllAgents, getAgentById, createAgent, updateAgent } from "../../../services/admin/agent.service";
import adminRoutes from "../../../routes/admin/admin.route";
import { CreateAgentDTO } from "../../../types/agent.dto";
import { CreateUserDTO } from "../../../types/user";

// Mock the services
jest.mock("../../../services/admin/agent.service", () => ({
    getAllAgents: jest.fn(),
    getAgentById: jest.fn(),
    createAgent: jest.fn(),
    updateAgent: jest.fn(),
}));

const app = Fastify();
beforeAll(async () => {
    app.register(adminRoutes); // Register routes for testing
    await app.ready();
});
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYjFhMmMzZDQtZTVmNi03ODkwLTEyMzQtNTY3ODlhYmNkZWYwIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzM5Mjk2MzczLCJleHAiOjE3MzkyOTk5NzN9.uhL7MdeUQ-TOq4r6t96Uh6eGbWWDLxlUsW2lXY1_j74";
describe("Agent Controller Tests", () => {
    /**
     * Test: Get all agents
     */
    test("GET /admin/agents - Should return a list of agents", async () => {
        (getAllAgents as jest.Mock).mockResolvedValue([
            { id: "1", user: { first_name: "John", last_name: "Doe", email: "john@example.com" , phone_number: "02244248476"} },
        ]);

        const response = (await supertest(app.server).get("/admin/agents").set("Authorization", `Bearer ${token}`));
        expect(response.status).toBe(200);
        expect(response.body).toEqual(
            successResponse("Agents fetched successfully!", [
                { id: "1", user: { first_name: "John", last_name: "Doe", email: "john@example.com" , phone_number: "02244248476"} },
            ], 200)
        );
    });

    /**
     * Test: Get a single agent by ID
     */
    test("GET /admin/agents/:id - Should return a single agent", async () => {
        (getAgentById as jest.Mock).mockResolvedValue({
            id: "1",
            user: { first_name: "John", last_name: "Doe", email: "john@example.com" },
        });

        const response = (await supertest(app.server).get("/admin/agents/1").set("Authorization", `Bearer ${token}`));
        expect(response.status).toBe(200);
        expect(response.body).toEqual(
            successResponse("Agent fetched successfully!", {
                id: "1",
                user: { first_name: "John", last_name: "Doe", email: "john@example.com" },
            }, 200)
        );
    });

    test("GET /admin/agents/:id - Should return 404 if agent is not found", async () => {
        (getAgentById as jest.Mock).mockResolvedValue(null);

        const response = (await supertest(app.server).get("/admin/agents/201ca2c1-e633-4b26-bb21-2659609883ba").set("Authorization", `Bearer ${token}`));
        expect(response.status).toBe(404);
        expect(response.body).toEqual(errorResponse("Agent not found.", 404));
    });

    /**
     * Test: Create a new agent
     */
    test("POST /admin/agents - Should create an agent successfully", async () => {
        const mockAgent: CreateAgentDTO = {
            first_name: "Jane",
            last_name: "Doe",
            email: "jane@example.com",
            phone_number: "123456789",
            password: "password123",
            date_of_birth: "1990-01-01",
        };

        (createAgent as jest.Mock).mockResolvedValue({
            id: "2",
            user: mockAgent,
        });

        const response = (await supertest(app.server).post("/admin/agents").send(mockAgent).set("Authorization", `Bearer ${token}`));
        expect(response.status).toBe(201);
        expect(response.body).toEqual(
            successResponse("Agent created successfully!", { id: "2", user: mockAgent }, 201)
        );
    });

    test("POST /admin/agents - Should handle creation errors", async () => {
        (createAgent as jest.Mock).mockRejectedValue(new Error("Database error"));

        const response = await supertest(app.server).post("/admin/agents").send({
            first_name: "Jane",
            last_name: "Doe",
            email: "jane@example.com",
            phone_number: "123456789",
        }).set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(500);
        expect(response.body).toEqual(errorResponse("Internal server error.", 500));
    });

    /**
     * Test: Update an agent
     */
    test("PUT /admin/agents/:id - Should update an agent successfully", async () => {
        const updateData: CreateAgentDTO = {
            phone_number: "987654321",
            first_name: "John",
            last_name: "Doe",
            email: "john@example.com",
            password: "password123",
            date_of_birth: "1990-01-01",
        };

        (updateAgent as jest.Mock).mockResolvedValue({
            id: "1",
            user: { first_name: "John", last_name: "Doe", email: "john@example.com", phone_number: "987654321" },
        });

        const response = (await supertest(app.server).put("/admin/agents/1").send(updateData).set("Authorization", `Bearer ${token}`));
        expect(response.status).toBe(200);
        expect(response.body).toEqual(
            successResponse("Agent updated successfully!", {
                id: "1",
                user: { first_name: "John", last_name: "Doe", email: "john@example.com", phone_number: "987654321" },
            }, 200)
        );
    });

    test("PUT /admin/agents/:id - Should handle update errors", async () => {
        (updateAgent as jest.Mock).mockRejectedValue(new Error("Update failed"));

        const response = await supertest(app.server).put("/admin/agents/1").send({ phone_number: "987654321" }).set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(500);
        expect(response.body).toEqual(errorResponse("Internal server error.", 500));
    });
});
