import supertest from "supertest";
import dotenv from "dotenv";
import fastify from "../../globalTestSetup";
let token = "";
describe("User auth Controller Tests", () => {
    test("POST /signup - Should create a new user", async () => {
        const response = await supertest(fastify.server)
            .post("/signup")
            .send({
                first_name: "Haydar",
                last_name: "Ali",
                email: "haydar.ali@devflovv.com",
                phone_number: "+12344248476",
                password: "Password@123",
            });
        expect(response.status).toBe(201);
    });
});

