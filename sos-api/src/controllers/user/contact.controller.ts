import { FastifyReply, FastifyRequest } from "fastify";
import { CreateContactDTO, UpdateContactDTO } from "../../types/user";
import { UUID } from "crypto";
import { errorResponse, successResponse } from "../../helper/responses";
import contactService from "../../services/contact.service";

class ContactController {
    async create(request: FastifyRequest, reply: FastifyReply) {
        const contacts = request.body as CreateContactDTO[];
        const sos_user_id = request.user as UUID;

        // Assign sos_user_id to each contact
        const contactsWithUserId = contacts.map(contact => ({
            ...contact,
            sos_user_id
        }));

        try {
            console.log('contactsWithUserId :>> ', contactsWithUserId);
            const newContacts = await contactService.createContacts(contactsWithUserId);
            return reply.status(201).send(successResponse("Contacts created successfully!", newContacts, 201));
        } catch (error) {
            console.error("Error creating contacts:", error);
            if (error instanceof Error) {
                return reply.status(500).send(errorResponse(error.message, 500));
            } else {
                return reply.status(500).send(errorResponse("Internal server error", 500));
            }
        }
    }

    async index(request: FastifyRequest, reply: FastifyReply) {
        const sos_user_id = request.user as UUID;
        try {
            const contacts = await contactService.getContactsBySosUserId(sos_user_id);

            if (!contacts || contacts.length === 0) {
                return reply.status(404).send(errorResponse("No contacts found", 404));
            }

            return reply.status(200).send(successResponse("Contacts fetched successfully!", contacts, 200));
        } catch (error) {
            console.error("Error fetching contacts:", error);

            if (error instanceof Error && error.name === "SequelizeDatabaseError") {
                return reply.status(500).send(errorResponse("Database error occurred", 500));
            }

            return reply.status(500).send(errorResponse("An unexpected error occurred", 500));
        }
    }

    async update(request: FastifyRequest, reply: FastifyReply) {
        const contacts = request.body as UpdateContactDTO[];

        try {
            const updatedContacts = await contactService.updateContacts(contacts);
            return reply.status(200).send(successResponse("Contact updated successfully!", updatedContacts, 200));
        } catch (error) {
            console.error("Error updating contact:", error);
            return reply.status(500).send(errorResponse("Internal server error.", 500));
        }
    }

}

export default new ContactController();