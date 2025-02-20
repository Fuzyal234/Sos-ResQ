
import { Agent } from "../models";
import { agentsRoom } from "../routes/agent/agent.routes";
import { UUID } from "crypto";
import { userSockets } from "../routes/user/user.routes";
import { agentSockets } from "../routes/agent/agent.routes";

class SocketService {
    
    /**
     * Notify available agents
     * @param agentId Agent ID
     */
    public async notifyAvailableAgents(sos_user_id: UUID) {
        try {
            const availableAgents = await Agent.findAll({
                where: { status: "available" },
                attributes: ["id"]
            });

            const agentSockets = new Map();

            for (const agent of availableAgents) {
                const agentSocket = agentsRoom.get(agent.dataValues.id);
                if (agentSocket) {
                    agentSockets.set(agent.id, agentSocket);
                }
            }

            for (const agentSocket of agentSockets) {
                agentSocket[1].send(JSON.stringify({ sos_user_id: sos_user_id }));
            }
        } catch (error) {
            console.error("Error notifying available agents:", error);
        }
    }

    /**
     * Assign request to agent
     * @param userId User ID
     * @param agentId Agent ID
     */
    public async assignRequestToAgent(userId: UUID, agentId: UUID) {
        const userSocket = userSockets.get(userId);
        const agentSocket = agentSockets.get(agentId);
        
        if (userSocket && agentSocket) {
            userSocket.send(JSON.stringify({ type: 'assigned', agentId }));
            agentSocket.send(JSON.stringify({ type: 'assigned', userId }));

            Agent.update({ status: 'busy' }, { where: { user_id: agentId } });

            userSocket.on('message', (msg: Buffer) => {
                const textMessage = msg.toString('utf-8');
                agentSocket.send(textMessage);
            });

            agentSocket.on('message', (msg: Buffer) => {
                const textMessage = msg.toString('utf-8');
                userSocket.send(textMessage);
            });
        }
    }
}

export default new SocketService();