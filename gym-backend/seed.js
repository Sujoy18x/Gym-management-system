require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("./models/Admin");
const Member = require("./models/Member");
const Offer = require("./models/Offer");
const connectDB = require("./config/db");

const seedData = async () => {
  await connectDB();

  // Clear existing data
  await Admin.deleteMany();
  await Member.deleteMany();
  await Offer.deleteMany();

  console.log("🗑️  Cleared existing data...");

  // Create Admin — use insertMany to bypass the pre-save hash hook (password already hashed)
  const passwordHash = await bcrypt.hash("admin123", 10);
  await Admin.collection.insertOne({
    name: "Admin User",
    email: "admin@liftclub.com",
    passwordHash,
    role: "Owner",
    is2FAEnabled: false,
    emailSummaries: true,
    expiryAlerts: true,
    readAlertIds: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  console.log("👤 Admin created — email: admin@liftclub.com | password: admin123");

  // Seed Members
  const members = [
    { name: "Alex Johnson", age: 28, dob: "1995-05-12", gender: "Male", phone: "+1 234-567-8901", plan: "Pro", joinDate: "2023-10-15", expiryDate: "2026-03-31", status: "Active" },
    { name: "Sarah Williams", age: 34, dob: "1989-11-23", gender: "Female", phone: "+1 234-567-8902", plan: "Basic", joinDate: "2023-11-01", expiryDate: "2023-12-01", status: "Expired" },
    { name: "Mike Davis", age: 41, dob: "1982-08-04", gender: "Male", phone: "+1 234-567-8903", plan: "Elite", joinDate: "2023-01-10", expiryDate: "2026-12-01", status: "Active" },
    { name: "Emma Brown", age: 22, dob: "2001-02-14", gender: "Female", phone: "+1 234-567-8904", plan: "Student", joinDate: "2023-05-20", expiryDate: "2023-11-20", status: "Inactive" },
    { name: "Chris Wilson", age: 31, dob: "1992-09-30", gender: "Male", phone: "+1 234-567-8905", plan: "Pro", joinDate: "2023-09-05", expiryDate: "2026-04-02", status: "Active" },
    { name: "Jessica Taylor", age: 26, dob: "1997-12-11", gender: "Female", phone: "+1 234-567-8906", plan: "Elite", joinDate: "2023-12-01", expiryDate: "2026-12-01", status: "Active" },
    { name: "David Martinez", age: 39, dob: "1984-03-22", gender: "Male", phone: "+1 234-567-8907", plan: "Basic", joinDate: "2023-06-15", expiryDate: "2026-12-01", status: "Active" },
    { name: "Sophia Anderson", age: 29, dob: "1994-07-08", gender: "Female", phone: "+1 234-567-8908", plan: "Pro", joinDate: "2023-02-28", expiryDate: "2026-12-01", status: "Active" },
    { name: "James Thomas", age: 45, dob: "1978-10-19", gender: "Male", phone: "+1 234-567-8909", plan: "Basic", joinDate: "2022-10-10", expiryDate: "2023-10-10", status: "Expired" },
    { name: "Olivia Jackson", age: 24, dob: "1999-01-25", gender: "Female", phone: "+1 234-567-8910", plan: "Student", joinDate: "2023-08-12", expiryDate: "2026-12-01", status: "Active" },
    { name: "Daniel White", age: 33, dob: "1990-04-18", gender: "Male", phone: "+1 234-567-8911", plan: "Elite", joinDate: "2023-03-05", expiryDate: "2026-12-01", status: "Active" },
    { name: "Mia Harris", age: 27, dob: "1996-06-02", gender: "Female", phone: "+1 234-567-8912", plan: "Pro", joinDate: "2023-07-22", expiryDate: "2026-04-03", status: "Active" },
    { name: "William Clark", age: 50, dob: "1973-12-05", gender: "Male", phone: "+1 234-567-8913", plan: "Basic", joinDate: "2021-05-15", expiryDate: "2022-05-15", status: "Inactive" },
    { name: "Isabella Lewis", age: 35, dob: "1988-08-30", gender: "Female", phone: "+1 234-567-8914", plan: "Pro", joinDate: "2023-11-20", expiryDate: "2026-12-01", status: "Active" },
    { name: "Ethan Walker", age: 21, dob: "2002-11-14", gender: "Male", phone: "+1 234-567-8915", plan: "Student", joinDate: "2023-09-01", expiryDate: "2026-12-01", status: "Active" },
    { name: "Ava Hall", age: 32, dob: "1991-05-27", gender: "Female", phone: "+1 234-567-8916", plan: "Elite", joinDate: "2023-04-10", expiryDate: "2026-12-01", status: "Active" },
    { name: "Alexander Allen", age: 40, dob: "1983-02-11", gender: "Male", phone: "+1 234-567-8917", plan: "Basic", joinDate: "2022-12-01", expiryDate: "2023-12-01", status: "Expired" },
    { name: "Charlotte Young", age: 25, dob: "1998-09-08", gender: "Female", phone: "+1 234-567-8918", plan: "Pro", joinDate: "2023-10-05", expiryDate: "2026-04-04", status: "Active" },
    { name: "Benjamin King", age: 38, dob: "1985-07-16", gender: "Male", phone: "+1 234-567-8919", plan: "Elite", joinDate: "2023-01-25", expiryDate: "2026-12-01", status: "Active" },
    { name: "Amelia Wright", age: 30, dob: "1993-03-29", gender: "Female", phone: "+1 234-567-8920", plan: "Basic", joinDate: "2023-08-30", expiryDate: "2026-12-01", status: "Active" },
  ].map((m, i) => ({ ...m, image: `https://i.pravatar.cc/150?u=${i + 1}` }));

  await Member.insertMany(members);
  console.log(`✅ ${members.length} members seeded.`);

  // Seed Offers
  const offers = [
    { title: "1 Month Basic", duration: "1 Month", basePrice: 1500, registrationFee: 1000, tag: "Standard" },
    { title: "3 Month Quarterly", duration: "3 Months", basePrice: 3000, registrationFee: 1000, tag: "Standard" },
    { title: "6 Month Half-Year", duration: "6 Months", basePrice: 6000, registrationFee: 0, tag: "No Reg Fee" },
    { title: "1 Year Annual", duration: "1 Year", basePrice: 10000, registrationFee: 0, tag: "No Reg Fee" },
    { title: "Couple Special", duration: "3 Months", basePrice: 5000, registrationFee: 0, tag: "Couple" },
    { title: "Festive Annual", duration: "1 Year", basePrice: 7000, registrationFee: 0, tag: "Festive" },
  ];

  await Offer.insertMany(offers);
  console.log(`✅ ${offers.length} offers seeded.`);

  console.log("\n🎉 Database seeded successfully!");
  process.exit(0);
};

seedData().catch((err) => {
  console.error(err);
  process.exit(1);
});
