import supertest from "supertest";
import fastify from "../../globalTestSetup";

let token = "";

describe("House Controller Tests", () => {
    beforeAll(async () => {
        const response = await supertest(fastify.server)
            .post("/signup")
            .send({
                first_name: "Haydar",
                last_name: "Ali",
                email: "haydarhouse.ali@devflovv.com",
                phone_number: "+12344248476",
                password: "Password@123",
            });
        expect(response.status).toBe(201);
        token = response.body.data.token;
    })
    test("POST /user/house - Should create a new house", async () => {
        const response = await supertest(fastify.server)
            .post("/user/house")
            .send({
                address: "123 Main St",
                city: "New York",
                state: "NY",
                zip_code: "10001",
            })
            .set("Authorization", `Bearer ${token}`);
        expect(response.status).toBe(201);
    });
});