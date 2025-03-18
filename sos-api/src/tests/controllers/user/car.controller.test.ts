import supertest from "supertest";
import fastify from "../../globalTestSetup";


let token = "";

describe("Car Controller Tests", () => {
    beforeAll(async () => {
        const response = await supertest(fastify.server)
            .post("/signup")
            .send({
                first_name: "Haydar",
                last_name: "Ali",
                email: "haydar1.ali@devflovv.com",
                phone_number: "+12344248476",
                password: "Password@123",
            });
        expect(response.status).toBe(201);
        token = response.body.data.token;
    })
    test("POST /user/car - Should create a new car", async () => {
        const response = await supertest(fastify.server)
            .post("/user/car")
            .send({
                "make": "Honda",
                "model": "Civic",
                "year": 2022,
                "color": "Blue",
                "license_plate": "ABC123"
            })
            .set("Authorization", `Bearer ${token}`)
            console.log('response.body :>> ', response.body);
        expect(response.status).toBe(201);
    });
});