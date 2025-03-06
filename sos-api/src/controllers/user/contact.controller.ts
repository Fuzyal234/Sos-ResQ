import { FastifyReply, FastifyRequest } from "fastify";
import { CreateContactDTO } from "../../types/user";
import { UUID } from "crypto";
import { errorResponse, successResponse } from "../../helper/responses";
import contactService from "../../services/contact.service";

class ContactController {
    async create(request: FastifyRequest, reply: FastifyReply) {
        const contact = request.body as CreateContactDTO;
        const sos_user_id = request.user as UUID;
        contact.sos_user_id = sos_user_id;
        try {

            const newContact = await contactService.createContact(contact);

            return reply.status(201).send(successResponse("Contact created successfully!", newContact, 201));
        }catch (error) {
            console.error("Error creating contact:", error);
            return reply.status(500).send(errorResponse(error.message, 500));
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
    
            if (error.name === "SequelizeDatabaseError") {
                return reply.status(500).send(errorResponse("Database error occurred", 500));
            }
    
            return reply.status(500).send(errorResponse("An unexpected error occurred", 500));
        }
    }

    async update(request: FastifyRequest, reply: FastifyReply) {
        const contact = request.body as CreateContactDTO;
        const id = (request.params as { id: string }).id;
        console.log('id :>> ', id);
        try {
            const updatedContact = await contactService.updateContact(contact, id);
            return reply.status(200).send(successResponse("Contact updated successfully!", updatedContact, 200));
        } catch (error) {
            console.error("Error updating contact:", error);
            return reply.status(500).send(errorResponse("Internal server error.", 500));
        }
    }
    
}

export default new ContactController();