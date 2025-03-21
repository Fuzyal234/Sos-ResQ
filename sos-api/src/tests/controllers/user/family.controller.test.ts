import supertest from "supertest";
import fastify from "../../globalTestSetup";
import { v4 as uuidv4 } from "uuid";
import { Subscription, SosUserSubscription, SosUser } from "../../../models";

let token = "";
let subscriptionId = "";
let sosUserId = "";
let userSubscriptionId = uuidv4();
const timestamp = Date.now();
const testEmail = `haydarfamily.ali.${timestamp}@devflovv.com`;
const inviteEmail = `invite.user.${timestamp}@devflovv.com`;

describe("Family Controller Tests", () => {
    beforeAll(async () => {
        const response = await supertest(fastify.server)
            .post("/signup")
            .send({
                first_name: "Haydar",
                last_name: "Ali",
                email: testEmail,
                phone_number: "+12344248476",
                password: "Password@123",
            });
        expect(response.status).toBe(201);
        token = response.body.data.token;
        sosUserId = response.body.data.user.user_id;
        
        const subscription = await Subscription.create({
            name: "Test Subscription",
            description: "Test subscription for family invite test",
            includes_house: true,
            includes_car: true,
            members_count: 5,
            price: 29.99,
            stripe_price_id: "price_test_family",
            stripe_product_id: "prod_test_family"
        });
        subscriptionId = subscription.dataValues.id;
        
        const start_date = new Date();
        const end_date = new Date(start_date);
        end_date.setMonth(end_date.getMonth() + 1);
        
        const userSubscription = await SosUserSubscription.create({
            sos_user_id: sosUserId,
            subscription_id: subscriptionId,
            start_date,
            end_date,
            status: "active",
            auto_renewal: true
        });
        
        const verifySubscription = await SosUserSubscription.findOne({ 
            where: { id: userSubscription.dataValues.id }
        });
        userSubscriptionId = userSubscription.dataValues.id;
    });
    
    test("POST /user/invite - Should create a new invite", async () => {
        const inviteUserResponse = await supertest(fastify.server)
            .post("/signup")
            .send({
                first_name: "Invited",
                last_name: "User",
                email: inviteEmail,
                phone_number: "+12345678901",
                password: "Password@123",
            });
        expect(inviteUserResponse.status).toBe(201);
        
        const response = await supertest(fastify.server)
            .post("/user/invite")
            .send({
               user_subscription_id: userSubscriptionId,
               email: inviteEmail
            })
            .set("Authorization", `Bearer ${token}`);
        expect(response.status).toBe(200);
    });
});