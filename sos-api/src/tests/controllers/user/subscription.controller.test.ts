import supertest from "supertest";
import fastify from "../../globalTestSetup";

let token = "";
let subscription_id = "";

describe("Subscription Controller Tests", () => {
    beforeAll(async () => {
        const response = await supertest(fastify.server)
            .post("/signup")
            .send({
                first_name: "Haydar",
                last_name: "Ali",
                email: "haydarsubscription.ali@devflovv.com",
                phone_number: "+12344248476",
                password: "Password@123",
            });
        expect(response.status).toBe(201);
        token = response.body.data.token;
    })

    test("GET /user/subscriptions - Should get all subscriptions", async () => {
        const response = await supertest(fastify.server)
            .get("/user/subscriptions")
            .set("Authorization", `Bearer ${token}`);
            subscription_id = response.body.data[0].id
        expect(response.status).toBe(200);
    });

    test("POST /user/subscribe - Should handle exception of profile not complete", async () => {
        const response = await supertest(fastify.server)
            .post(`/user/subscribe`)
            .send({
                subscription_id : subscription_id,
                auto_renewal: true
            })
            .set("Authorization", `Bearer ${token}`);
        expect(response.status).toBe(400);
        
    });
});