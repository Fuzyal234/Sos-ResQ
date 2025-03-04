import { UUID } from "crypto";

interface CreateCarDTO {
    sos_user_id: UUID;
    make: string;
    model: string;
    year: number;
    color: string;
    license_plate: string;
}

export { CreateCarDTO };