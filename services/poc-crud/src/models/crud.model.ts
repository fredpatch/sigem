import mongoose from "mongoose";

const crudSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
});

export const CrudModel = mongoose.model("Crud", crudSchema);
