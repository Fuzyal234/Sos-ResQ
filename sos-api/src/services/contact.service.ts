import { SosUser } from "../models";
import Contact from "../models/contact.model";
import { CreateContactDTO, UpdateContactDTO } from "../types/user";

class ContactService {

    async createContacts(contacts: CreateContactDTO[]) {
        try {
            const newContacts = await Contact.bulkCreate(contacts);
            if(newContacts){
                const sos_user = await SosUser.findByPk(contacts[0].sos_user_id);
                if(sos_user){
                    await sos_user.update({ contact_added: true });
                }
            }
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
    async updateContacts(contacts: UpdateContactDTO[]) {
        const transaction = await Contact.sequelize?.transaction();
        let updatedContacts = [];
        try {
          for (const contact of contacts) {
            const { id, ...updateData } = contact;
            const [count, [updatedContact]] = (await Contact.update(updateData, { where: { id }, returning: true, transaction }));
            updatedContacts.push(updatedContact);
          }
      
          await transaction?.commit();
          return updatedContacts;
        } catch (error) {
          await transaction?.rollback();
          console.error("Error updating contacts:", error);
          throw error;
        }
      }
      

}

export default new ContactService();