interface CreateSosUserRequestDTO {
    sos_user_id: string
    location: string
    status: string
    request_timestamp: Date
}

interface SosRequestDTO {
    id: string
    sos_user_id: string
    agent_id: string
    location: string
    status: string
    request_timestamp: Date
}

export { CreateSosUserRequestDTO, SosRequestDTO };