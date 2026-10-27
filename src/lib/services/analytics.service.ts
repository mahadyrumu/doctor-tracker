import { connectToDatabase } from "@/lib/db/mongodb";
import { Doctor, Patient } from "@/lib/models";

export interface AnalyticsData {
  totalDoctors: number;
  totalPatients: number;
  avgPatientsPerDoctor: number;
  patientsPerDoctor: Array<{
    doctorId: string;
    doctorName: string;
    specialization: string;
    patientCount: number;
  }>;
  conditionBreakdown: Array<{
    condition: string;
    count: number;
  }>;
  admissionsTrend: Array<{
    date: string;
    admissions: number;
  }>;
  recentAdmissions: Array<{
    _id: string;
    name: string;
    age: number;
    gender: string;
    condition: string;
    admissionDate: string;
    doctorName: string;
  }>;
}

export class AnalyticsService {
  /**
   * Computes comprehensive analytics using a single MongoDB $facet aggregation pipeline.
   * This executes as a single database roundtrip rather than multiple in-memory operations.
   */
  static async getDashboardMetrics(): Promise<AnalyticsData> {
    await connectToDatabase();

    const [doctorCount, [aggregationResult]] = await Promise.all([
      Doctor.countDocuments(),
      Patient.aggregate([
        {
          $facet: {
            totalPatients: [{ $count: "count" }],

            patientsPerDoctor: [
              {
                $group: {
                  _id: "$doctorId",
                  patientCount: { $sum: 1 },
                },
              },
              {
                $lookup: {
                  from: "doctors",
                  localField: "_id",
                  foreignField: "_id",
                  as: "doctor",
                },
              },
              { $unwind: "$doctor" },
              {
                $project: {
                  _id: 0,
                  doctorId: { $toString: "$_id" },
                  doctorName: "$doctor.name",
                  specialization: "$doctor.specialization",
                  patientCount: 1,
                },
              },
              { $sort: { patientCount: -1 } },
              { $limit: 10 },
            ],

            conditionBreakdown: [
              {
                $group: {
                  _id: "$condition",
                  count: { $sum: 1 },
                },
              },
              {
                $project: {
                  _id: 0,
                  condition: "$_id",
                  count: 1,
                },
              },
              { $sort: { count: -1 } },
              { $limit: 8 },
            ],

            admissionsTrend: [
              {
                $group: {
                  _id: {
                    $dateToString: {
                      format: "%Y-%m-%d",
                      date: "$admissionDate",
                    },
                  },
                  admissions: { $sum: 1 },
                },
              },
              {
                $project: {
                  _id: 0,
                  date: "$_id",
                  admissions: 1,
                },
              },
              { $sort: { date: 1 } },
              { $limit: 30 },
            ],

            recentAdmissions: [
              { $sort: { admissionDate: -1 } },
              { $limit: 6 },
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
                  admissionDate: {
                    $dateToString: {
                      format: "%Y-%m-%d",
                      date: "$admissionDate",
                    },
                  },
                  doctorName: "$doctor.name",
                },
              },
            ],
          },
        },
      ]),
    ]);

    const totalPatients = aggregationResult?.totalPatients?.[0]?.count || 0;
    const avgPatientsPerDoctor =
      doctorCount > 0 ? Number((totalPatients / doctorCount).toFixed(1)) : 0;

    return {
      totalDoctors: doctorCount,
      totalPatients,
      avgPatientsPerDoctor,
      patientsPerDoctor: aggregationResult?.patientsPerDoctor || [],
      conditionBreakdown: aggregationResult?.conditionBreakdown || [],
      admissionsTrend: aggregationResult?.admissionsTrend || [],
      recentAdmissions: aggregationResult?.recentAdmissions || [],
    };
  }
}
