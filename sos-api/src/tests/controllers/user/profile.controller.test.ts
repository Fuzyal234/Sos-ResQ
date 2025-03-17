import supertest from "supertest";
import fastify from "../../globalTestSetup";


let token = "";

describe("Profile Controller Tests", () => {
    beforeAll(async () => {
        const response = await supertest(fastify.server)
            .post("/signup")
            .send({
                first_name: "Haydar",
                last_name: "Ali",
                email: "haydarprofile.ali@devflovv.com",
                phone_number: "+12344248476",
                password: "Password@123",
            });
        expect(response.status).toBe(201);
        token = response.body.data.token;
    })

    test("GET /user/profile - Should return user profile", async () => {
        const response = await supertest(fastify.server)
            .get("/user/profile")
            .set("Authorization", `Bearer ${token}`)
        expect(response.status).toBe(200);
    });

});