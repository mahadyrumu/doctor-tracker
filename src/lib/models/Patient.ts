import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPatient extends Document {
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  condition: string;
  phone: string;
  admissionDate: Date;
  doctorId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PatientSchema = new Schema<IPatient>(
  {
    name: {
      type: String,
      required: [true, "Patient name is required"],
      trim: true,
    },
    age: {
      type: Number,
      required: [true, "Patient age is required"],
      min: [0, "Age cannot be negative"],
      max: [130, "Age exceeds valid human limits"],
    },
    gender: {
      type: String,
      required: [true, "Gender is required"],
      enum: ["Male", "Female", "Other"],
    },
    condition: {
      type: String,
      required: [true, "Medical condition is required"],
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      required: [true, "Contact phone is required"],
      trim: true,
    },
    admissionDate: {
      type: Date,
      required: [true, "Admission date is required"],
      default: Date.now,
      index: true,
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: [true, "Assigned doctor reference is required"],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Search, filtering, and foreign key indexes
PatientSchema.index({ name: "text", condition: "text" });
PatientSchema.index({ doctorId: 1, createdAt: -1 });
PatientSchema.index({ condition: 1, admissionDate: -1 });
PatientSchema.index({ admissionDate: -1 });

export const Patient: Model<IPatient> =
  mongoose.models.Patient || mongoose.model<IPatient>("Patient", PatientSchema);

