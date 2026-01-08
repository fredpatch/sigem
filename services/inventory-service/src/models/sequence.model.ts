// src/modules/inventory/models/Sequence.ts
import mongoose from "mongoose";

const SequenceSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // prefix (e.g., "EAR")
  seq: { type: Number, required: true, default: 0 },
});

export const Sequence = mongoose.model("Sequence", SequenceSchema);
