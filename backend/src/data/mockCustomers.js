const mockCustomers = [];

const names = [
  "Aarav Sharma",
  "Ritika Singh",
  "Kabir Khan",
  "Sana Verma",
  "Rohan Das",
  "Priya Nair",
  "Meera Iyer",
  "Arjun Patel",
  "Divya Gupta",
  "Vikram Reddy",
];

const companies = [
  "Nimbus Labs",
  "BluePeak Finance",
  "Orbit Retail",
  "ZenCargo",
  "Skyline Tech",
  "Velocity Corp",
  "Summit Solutions",
  "Nexus Digital",
  "Prime Services",
  "GlobalTech Inc",
];

const tags = ["hot", "warm", "cold"];

for (let i = 0; i < 100; i++) {
  mockCustomers.push({
    _id: i + 1,
    name: names[Math.floor(Math.random() * names.length)] + " " + i,
    phone: `+9198765${String(10000 + i).padStart(5, "0")}`,
    email: `user${i}@test.com`,
    company: companies[Math.floor(Math.random() * companies.length)],
    tags: [tags[Math.floor(Math.random() * tags.length)]],
    notes: "",
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

export default mockCustomers;
