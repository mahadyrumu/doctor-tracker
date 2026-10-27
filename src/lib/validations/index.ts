import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address").trim().toLowerCase(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const doctorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").trim(),
  specialization: z
    .string()
    .min(2, "Specialization must be at least 2 characters")
    .trim(),
  hospital: z
    .string()
    .min(2, "Hospital must be at least 2 characters")
    .trim(),
  phone: z
    .string()
    .min(7, "Phone number must be at least 7 digits")
    .trim(),
  email: z.string().email("Invalid email address").trim().toLowerCase(),
});

export const patientSchema = z.object({
  name: z.string().min(2, "Patient name must be at least 2 characters").trim(),
  age: z
    .number({ message: "Age must be a valid number" })
    .min(0, "Age cannot be negative")
    .max(130, "Age exceeds valid human limits"),
  gender: z.enum(["Male", "Female", "Other"], {
    message: "Gender must be Male, Female, or Other",
  }),
  condition: z
    .string()
    .min(2, "Condition must be at least 2 characters")
    .trim(),
  phone: z
    .string()
    .min(7, "Phone number must be at least 7 digits")
    .trim(),
  admissionDate: z.string().or(z.date()).optional(),
  doctorId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Doctor ID format"),
});

export const updatePatientSchema = patientSchema.partial();

export type LoginInput = z.infer<typeof loginSchema>;
export type DoctorInput = z.infer<typeof doctorSchema>;
export type PatientInput = z.infer<typeof patientSchema>;
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;
