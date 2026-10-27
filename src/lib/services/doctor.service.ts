import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Doctor, Patient, IDoctor } from "@/lib/models";
import { DoctorInput } from "@/lib/validations";

export interface GetDoctorsParams {
  page?: number;
  limit?: number;
  search?: string;
  specialization?: string;
  startDate?: string;
  endDate?: string;
}

export interface DoctorWithStats {
  _id: string;
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  createdAt: string;
  patientCount: number;
}

export class DoctorService {
  /**
   * Retrieves doctors with pagination, full-text search, date-range, and specialization filters.
   * Performs an efficient aggregation to join real-time patient count per doctor.
   */
  static async getDoctors(params: GetDoctorsParams) {
    await connectToDatabase();

    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(50, Number(params.limit) || 10));
    const skip = (page - 1) * limit;

    const matchStage: Record<string, any> = {};

    // 1. Search filter across name, hospital, specialization
    if (params.search && params.search.trim()) {
      const searchRegex = new RegExp(params.search.trim(), "i");
      matchStage.$or = [
        { name: searchRegex },
        { hospital: searchRegex },
        { specialization: searchRegex },
        { email: searchRegex },
      ];
    }

    // 2. Specialization filter
    if (params.specialization && params.specialization.trim()) {
      matchStage.specialization = params.specialization.trim();
    }

    // 3. Date-wise filter
    if (params.startDate || params.endDate) {
      matchStage.createdAt = {};
      if (params.startDate) {
        matchStage.createdAt.$gte = new Date(params.startDate);
      }
      if (params.endDate) {
        const end = new Date(params.endDate);
        end.setHours(23, 59, 59, 999);
        matchStage.createdAt.$lte = end;
      }
    }

    // Single pipeline with $facet to get total count and paginated items
    const [result] = await Doctor.aggregate([
      { $match: matchStage },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          doctors: [
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
              $lookup: {
                from: "patients",
                localField: "_id",
                foreignField: "doctorId",
                as: "patientsList",
              },
            },
            {
              $project: {
                _id: { $toString: "$_id" },
                name: 1,
                specialization: 1,
                hospital: 1,
                phone: 1,
                email: 1,
                createdAt: {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$createdAt",
                  },
                },
                patientCount: { $size: "$patientsList" },
              },
            },
          ],
        },
      },
    ]);

    const totalDocs = result?.metadata?.[0]?.total || 0;
    const totalPages = Math.ceil(totalDocs / limit) || 1;

    return {
      doctors: result?.doctors || [],
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
   * Creates a new doctor record with required fields and uniqueness checks.
   */
  static async createDoctor(data: DoctorInput): Promise<IDoctor> {
    await connectToDatabase();

    const existing = await Doctor.findOne({ email: data.email.toLowerCase() });
    if (existing) {
      const err = new Error("A doctor with this email address already exists");
      (err as any).code = "DUPLICATE_EMAIL";
      throw err;
    }

    return Doctor.create(data);
  }

  /**
   * Retrieves single doctor with details.
   */
  static async getDoctorById(id: string) {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id)) return null;

    const doctor = await Doctor.findById(id).lean();
    if (!doctor) return null;

    const patientCount = await Patient.countDocuments({
      doctorId: new mongoose.Types.ObjectId(id),
    });

    return {
      ...doctor,
      _id: doctor._id.toString(),
      patientCount,
    };
  }

  /**
   * Retrieves patients assigned to a specific doctor.
   */
  static async getDoctorPatients(
    doctorId: string,
    params: { page?: number; limit?: number; search?: string }
  ) {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      throw new Error("Invalid doctor ID");
    }

    const docObjectId = new mongoose.Types.ObjectId(doctorId);
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(50, Number(params.limit) || 10));
    const skip = (page - 1) * limit;

    const query: Record<string, any> = { doctorId: docObjectId };

    if (params.search && params.search.trim()) {
      const searchRegex = new RegExp(params.search.trim(), "i");
      query.$or = [{ name: searchRegex }, { condition: searchRegex }];
    }

    const [patients, totalDocs] = await Promise.all([
      Patient.find(query)
        .sort({ admissionDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Patient.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalDocs / limit) || 1;

    return {
      patients: patients.map((p) => ({
        ...p,
        _id: p._id.toString(),
        doctorId: p.doctorId.toString(),
        admissionDate: p.admissionDate.toISOString().split("T")[0],
      })),
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
   * Adds a new patient directly under a specific doctor.
   */
  static async addPatientToDoctor(
    doctorId: string,
    patientData: {
      name: string;
      age: number;
      gender: "Male" | "Female" | "Other";
      condition: string;
      phone: string;
      admissionDate?: Date | string;
    }
  ) {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      throw new Error("Invalid doctor ID");
    }

    const doctorExists = await Doctor.exists({ _id: doctorId });
    if (!doctorExists) {
      throw new Error("Doctor not found");
    }

    const patient = await Patient.create({
      ...patientData,
      doctorId: new mongoose.Types.ObjectId(doctorId),
      admissionDate: patientData.admissionDate
        ? new Date(patientData.admissionDate)
        : new Date(),
    });

    return patient;
  }

  /**
   * Deletes a patient from a doctor's patient list.
   */
  static async removePatientFromDoctor(doctorId: string, patientId: string) {
    await connectToDatabase();
    if (
      !mongoose.Types.ObjectId.isValid(doctorId) ||
      !mongoose.Types.ObjectId.isValid(patientId)
    ) {
      throw new Error("Invalid ID provided");
    }

    const deleted = await Patient.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(patientId),
      doctorId: new mongoose.Types.ObjectId(doctorId),
    });

    if (!deleted) {
      throw new Error("Patient not found under this doctor");
    }

    return deleted;
  }
}
