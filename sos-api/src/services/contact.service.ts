import Contact from "../models/contact.model";
import { CreateContactDTO } from "../types/user";

class ContactService {

    async createContacts(contacts: CreateContactDTO[]) {
        try {
            const newContacts = await Contact.bulkCreate(contacts);
            return newContacts;
        } catch (error) {
            console.error("Error creating contacts:", error);
            throw error;
        }
    }


    async getContactsBySosUserId(sos_user_id: string) {
        try {
            if (!sos_user_id) {
                throw new Error("Invalid user ID");
            }

            const contacts = await Contact.findAll({ where: { sos_user_id } });

            return contacts;
        } catch (error) {
            console.error("Error getting contacts:", error);
            throw error;
        }
    }

    async updateContact(contact: CreateContactDTO, id: string) {
        try {
            const updatedContact = await Contact.update(contact, { where: { id } });
            return updatedContact;
        } catch (error) {
            console.error("Error updating contact:", error);
            throw error;
        }
    }

}

export default new ContactService();