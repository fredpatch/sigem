import { Router } from "express";
import { CrudController } from "../controller/crud.controller";

const router = Router();

const crud = new CrudController();

router.get("/", crud.listContacts);
router.post("/", crud.createContact);
router.patch("/:id", crud.updateContact);
router.delete("/:id", crud.deleteContact);

export { router };
