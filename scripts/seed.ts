import mongoose from "mongoose";
import { User, Doctor, Patient } from "../src/lib/models";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/doctor_tracker";

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
    phone: "+1 (555) 234-5601",
    email: "f.gallagher@njhealth.org",
  },
  {
    name: "Dr. Dev Patel",
    specialization: "Nephrology",
    hospital: "Cedars-Sinai Medical Center",
    phone: "+1 (555) 345-6702",
    email: "d.patel@csmc.edu",
  },
  {
    name: "Dr. Miriam Gold",
    specialization: "Rheumatology",
    hospital: "Brigham and Women's Hospital",
    phone: "+1 (555) 456-7803",
    email: "m.gold@bwh.harvard.edu",
  },
  {
    name: "Dr. Kenji Sato",
    specialization: "Urology",
    hospital: "UCSF Medical Center",
    phone: "+1 (555) 567-8904",
    email: "k.sato@ucsfhealth.org",
  },
  {
    name: "Dr. Rachel Green",
    specialization: "Emergency Medicine",
    hospital: "NewYork-Presbyterian Hospital",
    phone: "+1 (555) 678-9005",
    email: "r.green@nyp.org",
  },
];

const CONDITIONS = [
  "Hypertension",
  "Type 2 Diabetes",
  "Arrhythmia",
  "Migraine",
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
  const pastDays = getRandomInt(1, daysBack);
  date.setDate(date.getDate() - pastDays);
  return date;
}

async function seed() {
  console.log(`Connecting to MongoDB at: ${MONGODB_URI}`);
  await mongoose.connect(MONGODB_URI);

  console.log("Cleaning existing records...");
  await User.deleteMany({});
  await Doctor.deleteMany({});
  await Patient.deleteMany({});

  console.log("Seeding default Administrator...");
  const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || "admin@doctortracker.com";
  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || "Admin123!";

  await User.create({
    name: "Super Administrator",
    email: adminEmail,
    password: adminPassword,
    role: "admin",
  });
  console.log(`Default admin created: ${adminEmail} / ${adminPassword}`);

  console.log("Seeding Doctors...");
  const createdDoctors = await Doctor.insertMany(DOCTORS_DATA);
  console.log(`Successfully created ${createdDoctors.length} doctors.`);

  console.log("Seeding Patients...");
  const patientsToInsert = [];

  for (let i = 0; i < 135; i++) {
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
  console.log(`Successfully created ${createdPatients.length} patients.`);

  console.log("Seeding completed successfully!");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});

