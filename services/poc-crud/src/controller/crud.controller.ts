import { CrudService } from "../services/crud.service";

const crudService = new CrudService();

export class CrudController {
  listContacts = async (req: any, res: any) => {
    const result = await crudService.listContacts();

    res.status(200).json({
      success: true,
      data: result,
    });
  };

  createContact = async (req: any, res: any) => {
    const { name, email } = req.body;

    try {
      const result = await crudService.create({ name, email });

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Error while creating a new Contact",
      });
    }
  };

  updateContact = async (req: any, res: any) => {
    const { id } = req.params;
    const { name, email } = req.body;

    const result = await crudService.update({ id, name, email });

    res.status(200).json({
      success: true,
      data: result,
    });
  };

  deleteContact = async (req: any, res: any) => {
    const { id } = req.params;

    const result = await crudService.delete(id);

    res.status(200).json({
      success: true,
      data: result,
    });
  };
}
