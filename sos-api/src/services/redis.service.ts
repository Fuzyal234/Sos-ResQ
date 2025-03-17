import { Agent } from "../models";
import { agentsRoom } from "../routes/agent/agent.routes";
import { UUID } from "crypto";
import { SosRequestDTO } from "../types/request.dto";

class RedisService {
    private static instance: RedisService;
    private sosQueue: any;
    private connection: any;
    private isConnected: boolean = false;

    private constructor() {
        const { Queue, Worker } = require('bullmq');
        const Redis = require('ioredis');

        // Use localhost for testing environment
        const isTest = process.env.NODE_ENV === 'test';
        const redisHost = isTest ? 'localhost' : (process.env.REDIS_HOST || "redis");

        this.connection = new Redis({
            host: redisHost,
            port: process.env.REDIS_PORT || 6379,
        });

        this.sosQueue = new Queue('sos-queue', { connection: this.connection });

        this.connection.on("connect", () => {
            if (!this.isConnected) {
                console.log("Connected to Redis");
                this.isConnected = true;
            }
        });
        
        this.connection.on("error", (err: Error) => {
            console.error("Redis Error:", err);
            this.isConnected = false;
        });
    }

    public static getInstance(): RedisService {
        if (!RedisService.instance) {
            RedisService.instance = new RedisService();
        }
        return RedisService.instance;
    }

    public async close() {
        if (this.sosQueue) {
            await this.sosQueue.close();
        }
        if (this.connection) {
            await this.connection.quit();
        }
        this.isConnected = false;
    }

    public async addToQueue(sos_request: SosRequestDTO) {
        await this.sosQueue.add('sos_request', sos_request);
    }

    public async getWaiting() {
        const jobs = await this.sosQueue.getWaiting();
        return jobs;
    }

    public async removeJobFromQueue(sos_user_id: UUID) {
        const jobs = await this.sosQueue.getWaiting();
        const job = jobs.find((job: { data: { sos_user_id: UUID } }) => job.data.sos_user_id === sos_user_id);
        if (job) {
            await job.remove();
        }
    }

    /**
     * Notify available agents
     * @param agentId Agent ID
     */
    public async notifyAvailableAgents(sos_user_id: UUID) {
        try {
            const availableAgents = await Agent.findAll({
                where: { status: "available" },
                attributes: ["user_id"]
            });

            const agentSockets = new Map();

            for (const agent of availableAgents) {
                const agentSocket = agentsRoom.get(agent.dataValues.user_id);
                if (agentSocket) {
                    agentSockets.set(agent.user_id, agentSocket);
                }
            }

            for (const agentSocket of agentSockets) {
                agentSocket[1].send(JSON.stringify({ sos_user_id: sos_user_id }));
            }
        } catch (error) {
            console.error("Error notifying available agents:", error);
        }
    }
}

// Export a singleton instance
export default RedisService.getInstance();