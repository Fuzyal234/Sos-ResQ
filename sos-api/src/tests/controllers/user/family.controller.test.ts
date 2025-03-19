import supertest from "supertest";
import fastify from "../../globalTestSetup";

let token = "";

describe("Family Controller Tests", () => {
    beforeAll(async () => {
        const response = await supertest(fastify.server)
            .post("/signup")
            .send({
                first_name: "Haydar",
                last_name: "Ali",
                email: "haydarfamily.ali@devflovv.com",
                phone_number: "+12344248476",
                password: "Password@123",
            });
        expect(response.status).toBe(201);
        token = response.body.data.token;
    })
    test("POST /user/invite - Should create a new invite", async () => {
        const response = await supertest(fastify.server)
            .post("/user/invite")
            .send({
               user_subscription_id: "1"
            })
            .set("Authorization", `Bearer ${token}`);
        expect(response.status).toBe(201);
    });
});