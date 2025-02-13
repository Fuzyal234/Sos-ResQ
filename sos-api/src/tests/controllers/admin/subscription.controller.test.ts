import Fastify from "fastify";
import supertest from "supertest";
import { successResponse, errorResponse } from "../../../helper/responses";
import SubscriptionService from "../../../services/admin/subscription.service";
import adminRoutes from "../../../routes/admin/admin.route";
import { CreateSubscriptionDTO } from "../../../types/subscription.dto";

jest.mock("../../../services/admin/subscription.service", () => ({
    getAllSubscriptions: jest.fn(),
    createSubscription: jest.fn(),
    getSubscriptionById: jest.fn(),
    updateSubscription: jest.fn(),
}));

const app = Fastify();
beforeAll(async () => {
    app.register(adminRoutes);
    await app.ready();
});

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYjFhMmMzZDQtZTVmNi03ODkwLTEyMzQtNTY3ODlhYmNkZWYwIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzM5NDcwODUyLCJleHAiOjE3Mzk0NzQ0NTJ9.ol_bhsFkX_UqPOfLgtsOAr9keoZvPlS2YdNjHx7y2XU"; // Example token

describe("Subscription Controller Tests", () => {
    /**
     * Test: Get all subscriptions
     */
    test("GET /admin/subscriptions - Should return a list of subscriptions", async () => {
        (SubscriptionService.getAllSubscriptions as jest.Mock).mockResolvedValue([
            { id: "1", name: "Basic Plan", price: 9.99, duration: "1 month" },
        ]);

        const response = await supertest(app.server)
            .get("/admin/subscriptions")
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(
            successResponse("Subscriptions fetched successfully!", [
                { id: "1", name: "Basic Plan", price: 9.99, duration: "1 month" },
            ], 200)
        );
    });

    test("GET /admin/subscriptions - Should return 404 if no subscriptions found", async () => {
        (SubscriptionService.getAllSubscriptions as jest.Mock).mockResolvedValue([]);

        const response = await supertest(app.server)
            .get("/admin/subscriptions")
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(404);
        expect(response.body).toEqual(errorResponse("Subscriptions not found.", 404));
    });

    /**
     * Test: Get a single subscription by ID
     */
    test("GET /admin/subscriptions/:id - Should return a single subscription", async () => {
        (SubscriptionService.getSubscriptionById as jest.Mock).mockResolvedValue({
            id: "1",
            name: "Basic Plan",
            price: 9.99,
            duration: "1 month",
        });

        const response = await supertest(app.server)
            .get("/admin/subscriptions/1")
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(
            successResponse("Subscription fetched successfully!", {
                id: "1",
                name: "Basic Plan",
                price: 9.99,
                duration: "1 month",
            }, 200)
        );
    });

    test("GET /admin/subscriptions/:id - Should return 404 if subscription is not found", async () => {
        (SubscriptionService.getSubscriptionById as jest.Mock).mockResolvedValue(null);

        const response = await supertest(app.server)
            .get("/admin/subscriptions/unknown-id")
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(404);
        expect(response.body).toEqual(errorResponse("Subscription not found.", 404));
    });

    /**
     * Test: Create a new subscription
     */
    test("POST /admin/subscriptions - Should create a subscription successfully", async () => {
        const mockSubscription: CreateSubscriptionDTO = {
            name: "Premium Plan",
            price: 19.99,
            tier: "2",
            includes_house: true,
            includes_car: true,
        };

        (SubscriptionService.createSubscription as jest.Mock).mockResolvedValue({
            id: "2",
            ...mockSubscription,
        });

        const response = await supertest(app.server)
            .post("/admin/subscriptions")
            .send(mockSubscription)
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(201);
        expect(response.body).toEqual(
            successResponse("Subscription created successfully!", { id: "2", ...mockSubscription }, 201)
        );
    });

    test("POST /admin/subscriptions - Should handle creation errors", async () => {
        (SubscriptionService.createSubscription as jest.Mock).mockRejectedValue(new Error("Database error"));

        const response = await supertest(app.server)
            .post("/admin/subscriptions")
            .send({ name: "Premium Plan", price: 19.99 })
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(500);
        expect(response.body).toEqual(errorResponse("Internal server error.", 500));
    });

    /**
     * Test: Update a subscription
     */
    test("PUT /admin/subscriptions/:id - Should update a subscription successfully", async () => {
        const updateData: CreateSubscriptionDTO = {
            name: "Updated Plan",
            tier: "3",
            price: 29.99,
            includes_house: true,
            includes_car: true,
        };

        (SubscriptionService.updateSubscription as jest.Mock).mockResolvedValue({
            id: "1",
            ...updateData,
        });

        const response = await supertest(app.server)
            .put("/admin/subscriptions/1")
            .send(updateData)
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(
            successResponse("Subscription updated successfully!", { id: "1", ...updateData }, 200)
        );
    });

    test("PUT /admin/subscriptions/:id - Should handle update errors", async () => {
        (SubscriptionService.updateSubscription as jest.Mock).mockRejectedValue(new Error("Update failed"));

        const response = await supertest(app.server)
            .put("/admin/subscriptions/1")
            .send({ name: "Updated Plan" })
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(500);
        expect(response.body).toEqual(errorResponse("Internal server error.", 500));
    });
});
