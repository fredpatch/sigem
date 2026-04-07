import { CrudModel } from "../models/crud.model";

export class CrudService {
  async create(input: { name: string; email: string }) {
    if (!input.name || !input.email) {
      throw new Error("Name and email are required");
    }

    const newContact = await CrudModel.create(input);

    return newContact;
  }

  async listContacts() {
    const contacts = await CrudModel.find();

    return contacts;
  }

  async update(input: { id: string; name: string; email: string }) {
    const { id, name, email } = input;

    const exists = await CrudModel.findById(id);
    if (!exists) {
      return { success: false, message: "Contact not found" };
    }

    const updatedContact = await CrudModel.findByIdAndUpdate(
      id,
      {
        name: name ?? exists.name,
        email: email ?? exists.email,
      },
      { new: true },
    );

    return updatedContact;
  }

  async delete(id: string) {
    const exists = await CrudModel.findById(id);
    if (!exists) {
      return { success: false, message: "Contact not found" };
    }

    await CrudModel.findByIdAndDelete(id);

    return { success: true, message: "Contact deleted successfully" };
  }
}
