import { FastifyInstance } from "fastify";
import { agentAuthMiddleware } from "../../middlewares/auth";
import { UUID } from "crypto";
import { agentSockets } from "../user/user.routes";
import { Agent } from "../../models";
import { WebSocket } from "ws";
import socketService from "../../services/socket.service";
import requestService from "../../services/user/request.service";

export default async function agentRoutes(fastify: FastifyInstance) {

    fastify.get('/ws/notification', { websocket: true, preHandler: agentAuthMiddleware }, async (connection, req) => {
        const agentId = req.user as UUID;
        agentsRoom.set(agentId, connection);

        try {
            await Agent.update({ status: 'available' }, { where: { id: agentId } });
            requestService.processQueuedRequests(agentId);
        } catch (error) {
            console.error("Error updating agent status to available:", error);
        }

        connection.on('close', async () => {
            agentSockets.delete(agentId);
            try {
                await Agent.update({ status: 'offline' }, { where: { id: agentId } });
            } catch (error) {
                console.error("Error updating agent status to offline:", error);
            }
        });
    });

    fastify.get('/ws/agent/chat', { websocket: true, preHandler: agentAuthMiddleware }, (connection, req) => {
        const agentId = req.user as UUID;
        const sos_user_id = req.headers['sos_user_id'] as UUID;

        agentSockets.set(agentId, connection);
        socketService.assignRequestToAgent(sos_user_id, agentId);
        
        connection.on('close', () => {
            agentSockets.delete(agentId);
            Agent.update({ status: 'offline' }, { where: { user_id: agentId } });
        });
    });
}

const agentsRoom = new Map<UUID, WebSocket>();
export { agentsRoom, agentSockets };
