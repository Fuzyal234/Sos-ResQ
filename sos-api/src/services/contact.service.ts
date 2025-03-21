import { SosUser } from '../models';
import Contact from '../models/contact.model';
import { Op } from 'sequelize';
import { CreateContactDTO, UpdateContactDTO } from '../types/user';
import sosUserService from './user/sosUser.service';

class ContactService {
  async createContacts(contacts: CreateContactDTO[]) {
    try {
      const transformedContacts = contacts.map(contact => ({
        ...contact,
        phone: contact.phone,
      }));
      const phoneNumbers = contacts.map(contact => contact.phone);
      const uniquePhoneNumbers = new Set(phoneNumbers);
      if (uniquePhoneNumbers.size !== phoneNumbers.length) {
        throw new Error('Phone numbers cannot be repeating');
      }

      const existingContacts: Contact[] = await Contact.findAll({
        where: {
          sos_user_id: contacts[0].sos_user_id,
          phone: {
            [Op.in]: contacts.map(contact => contact.phone),
          },
        },
      });
      if (existingContacts.length > 0) {
        throw new Error(
          `Contact with phone number ${existingContacts
            .map(contact => contact.get('phone'))
            .join(', ')} already exists`,
        );
      }
      const newContacts = await Contact.bulkCreate(transformedContacts);
      if (newContacts) {
        const sos_user = await SosUser.findByPk(contacts[0].sos_user_id);
        if (sos_user) {
          await sos_user.update({ contact_added: true });
        }
      }
      return newContacts;
    } catch (error) {
      console.error('Error creating contacts:', error);
      throw error;
    }
  }

  async getContactsBySosUserId(sos_user_id: string) {
    try {
      if (!sos_user_id) {
        throw new Error('Invalid user ID');
      }

      const contacts = await Contact.findAll({ where: { sos_user_id } });

      return contacts;
    } catch (error) {
      console.error('Error getting contacts:', error);
      throw error;
    }
  }

  async updateContact(contact: CreateContactDTO, id: string) {
    try {
      const updatedContact = await Contact.update(contact, { where: { id } });
      return updatedContact;
    } catch (error) {
      console.error('Error updating contact:', error);
      throw error;
    }
  }
  async updateContacts(contacts: UpdateContactDTO[]) {
    const transaction = await Contact.sequelize?.transaction();
    let updatedContacts = [];
    try {
      for (const contact of contacts) {
        const { id, ...updateData } = contact;
        const [count, [updatedContact]] = await Contact.update(updateData, {
          where: { id },
          returning: true,
          transaction,
        });
        updatedContacts.push(updatedContact);
      }

      await transaction?.commit();
      return updatedContacts;
    } catch (error) {
      await transaction?.rollback();
      console.error('Error updating contacts:', error);
      throw error;
    }
  }
}

export default new ContactService();
