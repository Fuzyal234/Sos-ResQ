import { UUID } from "crypto";

import Agent from "../models/agent.model";

class AgentService {
    
    async findAvailableAgent(): Promise<Array<UUID> | null> {
        const agents = await Agent.findAll({ where: { status: "available" } });
        return agents.map((agent) => agent.dataValues.user_id);
    }
}

export default new AgentService();