import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Patient, Doctor, IPatient } from "@/lib/models";
import { PatientInput, UpdatePatientInput } from "@/lib/validations";

export interface GetPatientsParams {
  page?: number;
  limit?: number;
  search?: string;
  condition?: string;
  doctorId?: string;
  startDate?: string;
  endDate?: string;
}

export interface PatientWithDoctor {
  _id: string;
  name: string;
  age: number;
  gender: string;
  condition: string;
  phone: string;
  admissionDate: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  doctorHospital: string;
  createdAt: string;
}

export class PatientService {
  /**
   * Retrieves patients with multi-criteria filtering:
   * - Full-text search on name & phone
   * - Condition-based filtering
   * - Date-wise filtering on admissionDate
   * - Relational doctor lookup
   * - Server-side pagination
   */
  static async getPatients(params: GetPatientsParams) {
    await connectToDatabase();

    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(50, Number(params.limit) || 10));
    const skip = (page - 1) * limit;

    const matchStage: Record<string, any> = {};

    // 1. Search filter
    if (params.search && params.search.trim()) {
      const searchRegex = new RegExp(params.search.trim(), "i");
      matchStage.$or = [
        { name: searchRegex },
        { phone: searchRegex },
        { condition: searchRegex },
      ];
    }

    // 2. Condition filter
    if (params.condition && params.condition.trim()) {
      matchStage.condition = params.condition.trim();
    }

    // 3. Doctor assignment filter
    if (params.doctorId && mongoose.Types.ObjectId.isValid(params.doctorId)) {
      matchStage.doctorId = new mongoose.Types.ObjectId(params.doctorId);
    }

    // 4. Date-wise filter on admissionDate
    if (params.startDate || params.endDate) {
      matchStage.admissionDate = {};
      if (params.startDate) {
        matchStage.admissionDate.$gte = new Date(params.startDate);
      }
      if (params.endDate) {
        const end = new Date(params.endDate);
        end.setHours(23, 59, 59, 999);
        matchStage.admissionDate.$lte = end;
      }
    }

    const [result] = await Patient.aggregate([
      { $match: matchStage },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          patients: [
            { $sort: { admissionDate: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
              $lookup: {
                from: "doctors",
                localField: "doctorId",
                foreignField: "_id",
                as: "doctor",
              },
            },
            { $unwind: "$doctor" },
            {
              $project: {
                _id: { $toString: "$_id" },
                name: 1,
                age: 1,
                gender: 1,
                condition: 1,
                phone: 1,
                admissionDate: {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$admissionDate",
                  },
                },
                doctorId: { $toString: "$doctorId" },
                doctorName: "$doctor.name",
                doctorSpecialization: "$doctor.specialization",
                doctorHospital: "$doctor.hospital",
                createdAt: {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$createdAt",
                  },
                },
              },
            },
          ],
        },
      },
    ]);

    const totalDocs = result?.metadata?.[0]?.total || 0;
    const totalPages = Math.ceil(totalDocs / limit) || 1;

    return {
      patients: result?.patients || [],
      pagination: {
        totalDocs,
        totalPages,
        page,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Creates a new patient record.
   */
  static async createPatient(data: PatientInput): Promise<IPatient> {
    await connectToDatabase();

    const doctorExists = await Doctor.exists({ _id: data.doctorId });
    if (!doctorExists) {
      throw new Error("Specified attending doctor not found");
    }

    return Patient.create({
      ...data,
      doctorId: new mongoose.Types.ObjectId(data.doctorId),
      admissionDate: data.admissionDate ? new Date(data.admissionDate) : new Date(),
    });
  }

  /**
   * Retrieves single patient by ID.
   */
  static async getPatientById(id: string) {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id)) return null;

    const patient = await Patient.findById(id).populate("doctorId").lean();
    if (!patient) return null;

    const doc = patient.doctorId as any;
    return {
      ...patient,
      _id: patient._id.toString(),
      admissionDate: patient.admissionDate
        ? new Date(patient.admissionDate).toISOString().split("T")[0]
        : "",
      createdAt: patient.createdAt
        ? new Date(patient.createdAt).toISOString()
        : "",
      doctorId: doc?._id?.toString() || "",
      doctorName: doc?.name || "Unassigned",
      doctorSpecialization: doc?.specialization || "",
      doctorHospital: doc?.hospital || "General Hospital",
      doctorPhone: doc?.phone || "N/A",
      doctorEmail: doc?.email || "N/A",
    };
  }

  /**
   * Updates patient details.
   */
  static async updatePatient(id: string, data: UpdatePatientInput) {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid patient ID");
    }

    if (data.doctorId) {
      if (!mongoose.Types.ObjectId.isValid(data.doctorId)) {
        throw new Error("Invalid doctor ID provided");
      }
      const doctorExists = await Doctor.exists({ _id: data.doctorId });
      if (!doctorExists) {
        throw new Error("Selected attending doctor does not exist");
      }
    }

    const updatePayload: any = { ...data };
    if (data.doctorId) {
      updatePayload.doctorId = new mongoose.Types.ObjectId(data.doctorId);
    }
    if (data.admissionDate) {
      updatePayload.admissionDate = new Date(data.admissionDate);
    }

    const updated = await Patient.findByIdAndUpdate(id, updatePayload, {
      returnDocument: "after",
      runValidators: true,
    }).lean();

    if (!updated) {
      throw new Error("Patient not found");
    }

    return {
      ...updated,
      _id: updated._id.toString(),
      doctorId: updated.doctorId.toString(),
    };
  }

  /**
   * Deletes a patient permanently.
   */
  static async deletePatient(id: string) {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid patient ID");
    }

    const deleted = await Patient.findByIdAndDelete(id).lean();
    if (!deleted) {
      throw new Error("Patient not found");
    }

    return deleted;
  }
}
