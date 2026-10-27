import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { User, Doctor, Patient } from "@/lib/models";

const DOCTORS_DATA = [
  {
    name: "Dr. Sarah Jenkins",
    specialization: "Cardiology",
    hospital: "Mayo Clinic",
    phone: "+1 (555) 234-5678",
    email: "s.jenkins@mayoclinic.org",
  },
  {
    name: "Dr. Marcus Vance",
    specialization: "Neurology",
    hospital: "Johns Hopkins Hospital",
    phone: "+1 (555) 345-6789",
    email: "m.vance@jhmi.edu",
  },
  {
    name: "Dr. Elena Rostova",
    specialization: "Pediatrics",
    hospital: "Children's National Hospital",
    phone: "+1 (555) 456-7890",
    email: "e.rostova@childrensnational.org",
  },
  {
    name: "Dr. Arthur Pendelton",
    specialization: "Orthopedics",
    hospital: "Hospital for Special Surgery",
    phone: "+1 (555) 567-8901",
    email: "a.pendelton@hss.edu",
  },
  {
    name: "Dr. Amara Okafor",
    specialization: "Oncology",
    hospital: "Memorial Sloan Kettering",
    phone: "+1 (555) 678-9012",
    email: "a.okafor@mskcc.org",
  },
  {
    name: "Dr. Julian Chen",
    specialization: "Dermatology",
    hospital: "Stanford Health Care",
    phone: "+1 (555) 789-0123",
    email: "j.chen@stanfordhealthcare.org",
  },
  {
    name: "Dr. Beatrice Morales",
    specialization: "Psychiatry",
    hospital: "Massachusetts General Hospital",
    phone: "+1 (555) 890-1234",
    email: "b.morales@mgh.harvard.edu",
  },
  {
    name: "Dr. Tariq Al-Mansoor",
    specialization: "Gastroenterology",
    hospital: "Cleveland Clinic",
    phone: "+1 (555) 901-2345",
    email: "t.almansoor@ccf.org",
  },
  {
    name: "Dr. Claire Dupont",
    specialization: "Endocrinology",
    hospital: "Mount Sinai Hospital",
    phone: "+1 (555) 012-3456",
    email: "c.dupont@mountsinai.org",
  },
  {
    name: "Dr. Robert Sterling",
    specialization: "Ophthalmology",
    hospital: "Wills Eye Hospital",
    phone: "+1 (555) 123-4560",
    email: "r.sterling@willseye.org",
  },
  {
    name: "Dr. Fiona Gallagher",
    specialization: "Pulmonology",
    hospital: "National Jewish Health",
    phone: "+1 (555) 234-5671",
    email: "f.gallagher@njhealth.org",
  },
  {
    name: "Dr. David Kim",
    specialization: "Nephrology",
    hospital: "UCSF Medical Center",
    phone: "+1 (555) 345-6782",
    email: "d.kim@ucsfhealth.org",
  },
  {
    name: "Dr. Maya Patel",
    specialization: "Rheumatology",
    hospital: "Brigham and Women's Hospital",
    phone: "+1 (555) 456-7893",
    email: "m.patel@bwh.harvard.edu",
  },
  {
    name: "Dr. Henrik Lindqvist",
    specialization: "Hematology",
    hospital: "Karolinska University Hospital",
    phone: "+1 (555) 567-8904",
    email: "h.lindqvist@karolinska.se",
  },
  {
    name: "Dr. Grace Hopper",
    specialization: "General Practice",
    hospital: "Bellevue Hospital",
    phone: "+1 (555) 678-9015",
    email: "g.hopper@bellevue.org",
  },
];

const CONDITIONS = [
  "Hypertension",
  "Type 2 Diabetes",
  "Asthma",
  "Coronary Artery Disease",
  "Osteoarthritis",
  "Eczema",
  "Major Depressive Disorder",
  "Crohn's Disease",
  "Hypothyroidism",
  "Glaucoma",
  "COPD",
  "Chronic Kidney Disease",
  "Rheumatoid Arthritis",
];

const FIRST_NAMES = [
  "James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda",
  "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica",
  "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Nancy", "Daniel", "Lisa",
  "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra", "Donald", "Ashley",
  "Steven", "Kimberly", "Paul", "Emily", "Andrew", "Donna", "Joshua", "Michelle",
  "Kenneth", "Dorothy", "Kevin", "Carol", "Brian", "Amanda", "George", "Melissa",
  "Edward", "Deborah", "Ronald", "Stephanie", "Timothy", "Rebecca", "Jason", "Sharon",
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
  "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson",
  "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker",
  "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
];

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomDate(daysBack: number): Date {
  const date = new Date();
  const pastOffset = Math.floor(Math.random() * daysBack * 24 * 60 * 60 * 1000);
  return new Date(date.getTime() - pastOffset);
}

export async function executeSeed() {
  await connectToDatabase();

  await User.deleteMany({});
  await Doctor.deleteMany({});
  await Patient.deleteMany({});

  const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || "admin@doctortracker.com";
  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || "Admin123!";

  await User.create({
    name: "Super Administrator",
    email: adminEmail,
    password: adminPassword,
    role: "admin",
  });

  const createdDoctors = await Doctor.insertMany(DOCTORS_DATA);

  const patientsToInsert = [];
  for (let i = 1; i <= 135; i++) {
    const assignedDoctor = getRandomItem(createdDoctors);
    const firstName = getRandomItem(FIRST_NAMES);
    const lastName = getRandomItem(LAST_NAMES);
    const gender = i % 15 === 0 ? "Other" : i % 2 === 0 ? "Female" : "Male";
    const condition = getRandomItem(CONDITIONS);
    const age = getRandomInt(18, 85);
    const admissionDate = getRandomDate(90);

    patientsToInsert.push({
      name: `${firstName} ${lastName}`,
      age,
      gender,
      condition,
      phone: `+1 (555) ${getRandomInt(100, 999)}-${getRandomInt(1000, 9999)}`,
      admissionDate,
      doctorId: assignedDoctor._id,
      createdAt: admissionDate,
    });
  }

  const createdPatients = await Patient.insertMany(patientsToInsert);

  return {
    doctorsCount: createdDoctors.length,
    patientsCount: createdPatients.length,
    adminEmail,
  };
}

async function handleSeedRequest(req: NextRequest) {
  try {
    await connectToDatabase();
    const userCount = await User.countDocuments();
    const urlSecret = req.nextUrl.searchParams.get("secret");
    const headerSecret = req.headers.get("x-seed-secret");
    const expectedSecret =
      process.env.JWT_SECRET || "doctor_tracker_jwt_secure_secret_production_ready_2026";

    // If database already has users, require valid secret to re-seed
    if (userCount > 0 && urlSecret !== expectedSecret && headerSecret !== expectedSecret) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Database already contains data. Pass '?secret=YOUR_JWT_SECRET' to reset and re-seed.",
        },
        { status: 403 }
      );
    }

    const result = await executeSeed();

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully with deterministic test records.",
      data: result,
    });
  } catch (error: any) {
    console.error("Seed API error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to seed database" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return handleSeedRequest(req);
}

export async function POST(req: NextRequest) {
  return handleSeedRequest(req);
}
