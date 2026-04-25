const initSqlJs = require("sql.js");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");

const DB_PATH = process.env.DB_PATH || "./db/fortune_sacco.db";

let db;
let SQL;

const initSQL = async () => {
  if (!SQL) {
    SQL = await initSqlJs();
  }
  return SQL;
};

const getDb = async () => {
  if (!db) {
    const SQL = await initSQL();
    if (fs.existsSync(DB_PATH)) {
      const buf = fs.readFileSync(DB_PATH);
      db = new SQL.Database(buf);
    } else {
      db = new SQL.Database();
    }
    db.run("PRAGMA foreign_keys = ON");
  }
  return db;
};

const saveDb = () => {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }
};

// Helper function to execute queries with prepared statements interface
const execQuery = (query, params = []) => {
  if (!db) throw new Error("Database not initialized");
  try {
    const stmt = db.prepare(query);
    stmt.bind(params);
    const result = [];
    while (stmt.step()) {
      result.push(stmt.getAsObject());
    }
    stmt.free();
    return result;
  } catch (err) {
    console.error("Query error:", err, "Query:", query, "Params:", params);
    throw err;
  }
};

// Helper to get single row
const getOne = (query, params = []) => {
  const results = execQuery(query, params);
  return results.length > 0 ? results[0] : null;
};

// Helper to get all rows
const getAll = (query, params = []) => {
  return execQuery(query, params);
};

// Helper to run insert/update/delete
const runQuery = (query, params = []) => {
  if (!db) throw new Error("Database not initialized");
  try {
    db.run(query, params);
    saveDb();
    return { changes: 1 };
  } catch (err) {
    console.error("Query error:", err, "Query:", query, "Params:", params);
    throw err;
  }
};

// ─── Schema ───────────────────────────────────────────────────────────────────
const SCHEMA = `
  CREATE TABLE IF NOT EXISTS branches (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    county TEXT NOT NULL,
    members INTEGER DEFAULT 0,
    active INTEGER DEFAULT 0,
    premiums REAL DEFAULT 0,
    claims INTEGER DEFAULT 0,
    manager TEXT,
    manager_email TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('System Admin','HR/CEO','Claims Officer','Branch Committee')),
    branch_id TEXT,
    name TEXT NOT NULL,
    avatar TEXT,
    active INTEGER DEFAULT 1,
    last_login TEXT,
    failed_attempts INTEGER DEFAULT 0,
    locked_until TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(branch_id) REFERENCES branches(id)
  );

  CREATE TABLE IF NOT EXISTS policies (
    id TEXT PRIMARY KEY,
    member_id TEXT NOT NULL,
    member TEXT NOT NULL,
    branch_id TEXT NOT NULL,
    cover_type TEXT NOT NULL CHECK(cover_type IN ('Individual','Family','Corporate Group')),
    annual_limit REAL DEFAULT 0,
    outpatient_limit REAL DEFAULT 0,
    inpatient_limit REAL DEFAULT 0,
    maternity_limit REAL DEFAULT 0,
    dental_limit REAL DEFAULT 0,
    optical_limit REAL DEFAULT 0,
    last_expense_limit REAL DEFAULT 0,
    premium REAL DEFAULT 0,
    start_date TEXT NOT NULL,
    expiry_date TEXT NOT NULL,
    status TEXT DEFAULT 'Active' CHECK(status IN ('Active','Expired','Pending','Suspended')),
    utilised REAL DEFAULT 0,
    outpatient_used REAL DEFAULT 0,
    inpatient_used REAL DEFAULT 0,
    maternity_used REAL DEFAULT 0,
    dental_used REAL DEFAULT 0,
    optical_used REAL DEFAULT 0,
    phone TEXT,
    email TEXT,
    dependants INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(branch_id) REFERENCES branches(id)
  );

  CREATE TABLE IF NOT EXISTS claims (
    id TEXT PRIMARY KEY,
    member_id TEXT NOT NULL,
    member TEXT NOT NULL,
    policy_id TEXT NOT NULL,
    branch_id TEXT NOT NULL,
    hospital TEXT NOT NULL,
    hospital_code TEXT,
    category TEXT NOT NULL CHECK(category IN ('Outpatient','Inpatient','Maternity','Dental','Optical')),
    amount REAL NOT NULL,
    approved_amount REAL,
    date TEXT NOT NULL,
    diagnosis TEXT,
    status TEXT DEFAULT 'Pending' CHECK(status IN ('Pending','Approved','Partial','Rejected')),
    docs TEXT DEFAULT '[]',
    review_notes TEXT,
    reviewed_by TEXT,
    reviewed_at TEXT,
    claimant_phone TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(policy_id) REFERENCES policies(id),
    FOREIGN KEY(branch_id) REFERENCES branches(id)
  );

  CREATE TABLE IF NOT EXISTS premiums (
    id TEXT PRIMARY KEY,
    member_id TEXT NOT NULL,
    member TEXT NOT NULL,
    policy_id TEXT NOT NULL,
    branch_id TEXT NOT NULL,
    due REAL NOT NULL,
    paid REAL DEFAULT 0,
    due_date TEXT NOT NULL,
    paid_date TEXT,
    status TEXT DEFAULT 'Pending' CHECK(status IN ('Paid','Missed','Pending')),
    method TEXT,
    receipt_no TEXT,
    days_overdue INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(policy_id) REFERENCES policies(id),
    FOREIGN KEY(branch_id) REFERENCES branches(id)
  );

  CREATE TABLE IF NOT EXISTS hospitals (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    location TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('Private','County','Teaching','Clinic','Specialist','Referral')),
    claim_limit REAL DEFAULT 0,
    claims_month INTEGER DEFAULT 0,
    claims_value REAL DEFAULT 0,
    nhif_accredited INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Active' CHECK(status IN ('Active','Inactive')),
    contact TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    user_email TEXT NOT NULL,
    user_role TEXT,
    branch_name TEXT,
    action TEXT NOT NULL,
    module TEXT,
    ip_address TEXT,
    status TEXT DEFAULT 'Success' CHECK(status IN ('Success','Failed')),
    type TEXT DEFAULT 'general',
    metadata TEXT DEFAULT '{}',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    type TEXT DEFAULT 'info' CHECK(type IN ('success','error','warning','info')),
    title TEXT NOT NULL,
    message TEXT,
    user_id TEXT,
    is_broadcast INTEGER DEFAULT 0,
    is_read INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token TEXT NOT NULL,
    ip_address TEXT,
    login_at TEXT DEFAULT (datetime('now')),
    expires_at TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE INDEX IF NOT EXISTS idx_policies_branch ON policies(branch_id);
  CREATE INDEX IF NOT EXISTS idx_policies_status ON policies(status);
  CREATE INDEX IF NOT EXISTS idx_claims_branch ON claims(branch_id);
  CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);
  CREATE INDEX IF NOT EXISTS idx_premiums_branch ON premiums(branch_id);
  CREATE INDEX IF NOT EXISTS idx_premiums_status ON premiums(status);
  CREATE INDEX IF NOT EXISTS idx_audit_type ON audit_logs(type);
  CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
`;

const initializeDatabase = async () => {
  const database = await getDb();

  // Create tables
  database.exec(SCHEMA);

  // Check if seeded
  const result = database.exec("SELECT COUNT(*) as count FROM branches");
  const branchCount = result.length > 0 ? result[0].values[0][0] : 0;
  
  if (branchCount === 0) {
    console.log("📦 Seeding database with initial data...");
    seedDatabase(database);
    saveDb();
    console.log("✅ Database seeded successfully");
  } else {
    console.log(`✅ Database ready — ${branchCount} branches loaded`);
  }

  return database;
};

const seedDatabase = (database) => {
  const { v4: uuidv4 } = require("uuid");

  const branches = [
    { id: "NBI", name: "Nairobi HQ", county: "Nairobi", members: 2341, active: 2108, premiums: 4820000, claims: 78, manager: "Sarah Kimani", manager_email: "s.kimani@fortunesacco.co.ke" },
    { id: "MSA", name: "Mombasa", county: "Mombasa", members: 1820, active: 1634, premiums: 3150000, claims: 52, manager: "Ahmed Hassan", manager_email: "a.hassan@fortunesacco.co.ke" },
    { id: "KSM", name: "Kisumu", county: "Kisumu", members: 1540, active: 1380, premiums: 2640000, claims: 44, manager: "Grace Otieno", manager_email: "g.otieno@fortunesacco.co.ke" },
    { id: "NKR", name: "Nakuru", county: "Nakuru", members: 1200, active: 1070, premiums: 2100000, claims: 38, manager: "John Mwangi", manager_email: "j.mwangi@fortunesacco.co.ke" },
    { id: "ELD", name: "Eldoret", county: "Uasin Gishu", members: 980, active: 870, premiums: 1680000, claims: 31, manager: "Mercy Kipchoge", manager_email: "m.kipchoge@fortunesacco.co.ke" },
    { id: "THK", name: "Thika", county: "Kiambu", members: 760, active: 680, premiums: 1320000, claims: 24, manager: "Peter Njoroge", manager_email: "p.njoroge@fortunesacco.co.ke" },
    { id: "NYR", name: "Nyeri", county: "Nyeri", members: 640, active: 572, premiums: 1120000, claims: 20, manager: "Ann Wambui", manager_email: "a.wambui@fortunesacco.co.ke" },
    { id: "MRU", name: "Meru", county: "Meru", members: 580, active: 520, premiums: 980000, claims: 18, manager: "David Muriuki", manager_email: "d.muriuki@fortunesacco.co.ke" },
    { id: "KTL", name: "Kitale", county: "Trans Nzoia", members: 520, active: 465, premiums: 870000, claims: 16, manager: "Robert Wafula", manager_email: "r.wafula@fortunesacco.co.ke" },
    { id: "KRC", name: "Kericho", county: "Kericho", members: 490, active: 438, premiums: 820000, claims: 14, manager: "Esther Sang", manager_email: "e.sang@fortunesacco.co.ke" },
    { id: "EMB", name: "Embu", county: "Embu", members: 420, active: 375, premiums: 710000, claims: 12, manager: "James Muthomi", manager_email: "j.muthomi@fortunesacco.co.ke" },
    { id: "MCK", name: "Machakos", county: "Machakos", members: 410, active: 366, premiums: 690000, claims: 11, manager: "Lucy Mutua", manager_email: "l.mutua@fortunesacco.co.ke" },
    { id: "KKM", name: "Kakamega", county: "Kakamega", members: 390, active: 348, premiums: 660000, claims: 11, manager: "Victor Shikuku", manager_email: "v.shikuku@fortunesacco.co.ke" },
    { id: "GRS", name: "Garissa", county: "Garissa", members: 310, active: 277, premiums: 520000, claims: 9, manager: "Fatuma Aden", manager_email: "f.aden@fortunesacco.co.ke" },
    { id: "MLD", name: "Malindi", county: "Kilifi", members: 290, active: 259, premiums: 490000, claims: 8, manager: "Ali Omar", manager_email: "a.omar@fortunesacco.co.ke" },
    { id: "NNK", name: "Nanyuki", county: "Laikipia", members: 270, active: 241, premiums: 460000, claims: 8, manager: "Carol Kimotho", manager_email: "c.kimotho@fortunesacco.co.ke" },
    { id: "BGM", name: "Bungoma", county: "Bungoma", members: 260, active: 232, premiums: 440000, claims: 7, manager: "Moses Wanyama", manager_email: "m.wanyama@fortunesacco.co.ke" },
    { id: "KSI", name: "Kisii", county: "Kisii", members: 250, active: 223, premiums: 420000, claims: 7, manager: "Beatrice Nyamweya", manager_email: "b.nyamweya@fortunesacco.co.ke" },
    { id: "NVS", name: "Naivasha", county: "Nakuru", members: 230, active: 205, premiums: 390000, claims: 6, manager: "Joseph Karanja", manager_email: "j.karanja@fortunesacco.co.ke" },
    { id: "MRG", name: "Muranga", county: "Muranga", members: 210, active: 187, premiums: 360000, claims: 6, manager: "Hannah Wanjiku", manager_email: "h.wanjiku@fortunesacco.co.ke" },
  ];

  branches.forEach(b => {
    database.run(`
      INSERT OR IGNORE INTO branches (id, name, county, members, active, premiums, claims, manager, manager_email)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [b.id, b.name, b.county, b.members, b.active, b.premiums, b.claims, b.manager, b.manager_email]);
  });

  // Seed users with hashed passwords
  const users = [
    { id: "U001", email: "admin@fortunesacco.co.ke", password: "Admin@2024", role: "System Admin", branch_id: "NBI", name: "System Administrator", avatar: "SA" },
    { id: "U002", email: "hr@fortunesacco.co.ke", password: "HR@2024", role: "HR/CEO", branch_id: "NBI", name: "HR Director", avatar: "HD" },
    { id: "U003", email: "claims@fortunesacco.co.ke", password: "Claims@2024", role: "Claims Officer", branch_id: "NBI", name: "Claims Officer", avatar: "CO" },
    { id: "U004", email: "branch@fortunesacco.co.ke", password: "Branch@2024", role: "Branch Committee", branch_id: "NBI", name: "Branch Committee (NBI)", avatar: "BC" },
    { id: "U005", email: "mombasa@fortunesacco.co.ke", password: "Msa@2024", role: "Branch Committee", branch_id: "MSA", name: "Branch Committee (MSA)", avatar: "MC" },
  ];

  users.forEach(u => {
    const hashed = bcrypt.hashSync(u.password, parseInt(process.env.BCRYPT_ROUNDS) || 10);
    database.run(`
      INSERT OR IGNORE INTO users (id, email, password, role, branch_id, name, avatar)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [u.id, u.email, hashed, u.role, u.branch_id, u.name, u.avatar]);
  });

  // Seed hospitals
  const hospitals = [
    { id: uuidv4(), name: "Nairobi Hospital", code: "NH-001", location: "Nairobi", type: "Private", claim_limit: 2000000, claims_month: 78, claims_value: 3200000, nhif_accredited: 1, contact: "020-2845000" },
    { id: uuidv4(), name: "Aga Khan Hospital", code: "AKH-001", location: "Nairobi", type: "Private", claim_limit: 1500000, claims_month: 52, claims_value: 2100000, nhif_accredited: 1, contact: "020-3662000" },
    { id: uuidv4(), name: "MP Shah Hospital", code: "MPS-001", location: "Nairobi", type: "Private", claim_limit: 1200000, claims_month: 44, claims_value: 1800000, nhif_accredited: 1, contact: "020-4291000" },
    { id: uuidv4(), name: "Kenyatta National Hospital", code: "KNH-001", location: "Nairobi", type: "Teaching", claim_limit: 3000000, claims_month: 65, claims_value: 4800000, nhif_accredited: 1, contact: "020-2726300" },
    { id: uuidv4(), name: "Kisumu County Hospital", code: "KCH-001", location: "Kisumu", type: "County", claim_limit: 500000, claims_month: 31, claims_value: 620000, nhif_accredited: 1, contact: "057-2024600" },
    { id: uuidv4(), name: "Eldoret Clinic", code: "EC-001", location: "Eldoret", type: "Clinic", claim_limit: 300000, claims_month: 22, claims_value: 280000, nhif_accredited: 0, contact: "053-2062500" },
    { id: uuidv4(), name: "Coast General Hospital", code: "CGH-001", location: "Mombasa", type: "County", claim_limit: 500000, claims_month: 28, claims_value: 510000, nhif_accredited: 1, contact: "041-2314201" },
    { id: uuidv4(), name: "Mombasa Hospital", code: "MH-001", location: "Mombasa", type: "Private", claim_limit: 1000000, claims_month: 35, claims_value: 920000, nhif_accredited: 1, contact: "041-2312191" },
  ];

  hospitals.forEach(h => {
    database.run(`
      INSERT OR IGNORE INTO hospitals (id, name, code, location, type, claim_limit, claims_month, claims_value, nhif_accredited, contact)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [h.id, h.name, h.code, h.location, h.type, h.claim_limit, h.claims_month, h.claims_value, h.nhif_accredited, h.contact]);
  });

  // Seed policies
  const policies = [
    { id: "POL-2024-0001", member_id: "FS-NBI-0001", member: "John Kamau Mwangi", branch_id: "NBI", cover_type: "Family", annual_limit: 500000, outpatient_limit: 75000, inpatient_limit: 400000, maternity_limit: 80000, dental_limit: 15000, optical_limit: 10000, last_expense_limit: 50000, premium: 4200, start_date: "2024-01-01", expiry_date: "2025-12-31", status: "Active", utilised: 152000, outpatient_used: 22000, inpatient_used: 120000, maternity_used: 10000, dental_used: 0, optical_used: 0, phone: "0712 345 678", email: "j.kamau@email.com", dependants: 3 },
    { id: "POL-2024-0002", member_id: "FS-MSA-0012", member: "Grace Wanjiru Njoroge", branch_id: "MSA", cover_type: "Individual", annual_limit: 250000, outpatient_limit: 40000, inpatient_limit: 200000, maternity_limit: 0, dental_limit: 10000, optical_limit: 8000, last_expense_limit: 30000, premium: 2100, start_date: "2024-03-01", expiry_date: "2025-02-28", status: "Active", utilised: 32000, outpatient_used: 12000, inpatient_used: 20000, maternity_used: 0, dental_used: 0, optical_used: 0, phone: "0722 111 222", email: "g.wanjiru@email.com", dependants: 0 },
    { id: "POL-2024-0003", member_id: "FS-NBI-0088", member: "ABC Enterprises Ltd", branch_id: "NBI", cover_type: "Corporate Group", annual_limit: 2000000, outpatient_limit: 300000, inpatient_limit: 1500000, maternity_limit: 200000, dental_limit: 50000, optical_limit: 30000, last_expense_limit: 100000, premium: 18500, start_date: "2024-04-01", expiry_date: "2025-03-31", status: "Active", utilised: 480000, outpatient_used: 80000, inpatient_used: 380000, maternity_used: 20000, dental_used: 0, optical_used: 0, phone: "0733 999 000", email: "hr@abcenterprises.co.ke", dependants: 12 },
    { id: "POL-2023-0891", member_id: "FS-KSM-0034", member: "Peter Otieno Odhiambo", branch_id: "KSM", cover_type: "Individual", annual_limit: 250000, outpatient_limit: 40000, inpatient_limit: 200000, maternity_limit: 0, dental_limit: 10000, optical_limit: 8000, last_expense_limit: 30000, premium: 2100, start_date: "2023-06-01", expiry_date: "2024-05-31", status: "Expired", utilised: 250000, outpatient_used: 40000, inpatient_used: 200000, maternity_used: 0, dental_used: 10000, optical_used: 0, phone: "0700 456 789", email: "p.otieno@email.com", dependants: 0 },
    { id: "POL-2024-0004", member_id: "FS-MSA-0055", member: "Mary Achieng Ouko", branch_id: "MSA", cover_type: "Family", annual_limit: 500000, outpatient_limit: 75000, inpatient_limit: 400000, maternity_limit: 80000, dental_limit: 15000, optical_limit: 10000, last_expense_limit: 50000, premium: 4200, start_date: "2024-07-01", expiry_date: "2025-06-30", status: "Active", utilised: 68000, outpatient_used: 18000, inpatient_used: 50000, maternity_used: 0, dental_used: 0, optical_used: 0, phone: "0711 222 333", email: "m.achieng@email.com", dependants: 2 },
    { id: "POL-2024-0005", member_id: "FS-ELD-0019", member: "David Kipchoge Rotich", branch_id: "ELD", cover_type: "Individual", annual_limit: 250000, outpatient_limit: 40000, inpatient_limit: 200000, maternity_limit: 0, dental_limit: 10000, optical_limit: 8000, last_expense_limit: 30000, premium: 2100, start_date: "2024-08-01", expiry_date: "2025-07-31", status: "Pending", utilised: 0, outpatient_used: 0, inpatient_used: 0, maternity_used: 0, dental_used: 0, optical_used: 0, phone: "0724 567 890", email: "d.rotich@email.com", dependants: 0 },
  ];

  policies.forEach(p => {
    database.run(`
      INSERT OR IGNORE INTO policies (id, member_id, member, branch_id, cover_type, annual_limit, outpatient_limit, inpatient_limit, maternity_limit, dental_limit, optical_limit, last_expense_limit, premium, start_date, expiry_date, status, utilised, outpatient_used, inpatient_used, maternity_used, dental_used, optical_used, phone, email, dependants)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [p.id, p.member_id, p.member, p.branch_id, p.cover_type, p.annual_limit, p.outpatient_limit, p.inpatient_limit, p.maternity_limit, p.dental_limit, p.optical_limit, p.last_expense_limit, p.premium, p.start_date, p.expiry_date, p.status, p.utilised, p.outpatient_used, p.inpatient_used, p.maternity_used, p.dental_used, p.optical_used, p.phone, p.email, p.dependants]);
  });

  // Seed claims
  const claims = [
    { id: "CLM-2024-0891", member_id: "FS-NBI-0001", member: "John Kamau Mwangi", policy_id: "POL-2024-0001", branch_id: "NBI", hospital: "Nairobi Hospital", hospital_code: "NH-001", category: "Inpatient", amount: 45000, approved_amount: null, date: "2024-12-02", diagnosis: "Appendectomy", status: "Pending", docs: JSON.stringify(["Hospital Bill.pdf", "Discharge Summary.pdf"]), review_notes: "", reviewed_by: null, reviewed_at: null, claimant_phone: "0712 345 678" },
    { id: "CLM-2024-0890", member_id: "FS-MSA-0055", member: "Mary Achieng Ouko", policy_id: "POL-2024-0004", branch_id: "MSA", hospital: "Aga Khan Hospital", hospital_code: "AKH-001", category: "Outpatient", amount: 28500, approved_amount: 28500, date: "2024-11-28", diagnosis: "Malaria Treatment", status: "Approved", docs: JSON.stringify(["Prescription.pdf", "Lab Report.pdf"]), review_notes: "Covered under policy limits", reviewed_by: "Claims Officer", reviewed_at: "2024-11-30T09:00:00Z", claimant_phone: "0711 222 333" },
    { id: "CLM-2024-0889", member_id: "FS-MSA-0012", member: "Grace Wanjiru Njoroge", policy_id: "POL-2024-0002", branch_id: "MSA", hospital: "MP Shah Hospital", hospital_code: "MPS-001", category: "Inpatient", amount: 72000, approved_amount: 50000, date: "2024-11-25", diagnosis: "Surgical Procedure", status: "Partial", docs: JSON.stringify(["Bill.pdf", "Surgery Report.pdf"]), review_notes: "Partial approval — surgery fees covered, consumables excluded", reviewed_by: "Claims Officer", reviewed_at: "2024-11-27T14:30:00Z", claimant_phone: "0722 111 222" },
    { id: "CLM-2024-0888", member_id: "FS-KSM-0034", member: "Peter Otieno Odhiambo", policy_id: "POL-2023-0891", branch_id: "KSM", hospital: "Kisumu County Hospital", hospital_code: "KCH-001", category: "Outpatient", amount: 15000, approved_amount: null, date: "2024-11-20", diagnosis: "Diabetes Consultation", status: "Rejected", docs: JSON.stringify(["Receipt.pdf"]), review_notes: "Policy expired — claim not covered", reviewed_by: "Claims Officer", reviewed_at: "2024-11-22T10:00:00Z", claimant_phone: "0700 456 789" },
    { id: "CLM-2024-0887", member_id: "FS-ELD-0019", member: "David Kipchoge Rotich", policy_id: "POL-2024-0005", branch_id: "ELD", hospital: "Eldoret Clinic", hospital_code: "EC-001", category: "Outpatient", amount: 8400, approved_amount: 8400, date: "2024-11-18", diagnosis: "General Checkup", status: "Approved", docs: JSON.stringify(["Receipt.pdf", "Prescription.pdf"]), review_notes: "Within outpatient limit", reviewed_by: "Claims Officer", reviewed_at: "2024-11-19T11:00:00Z", claimant_phone: "0724 567 890" },
    { id: "CLM-2024-0886", member_id: "FS-NBI-0088", member: "ABC Enterprises Ltd", policy_id: "POL-2024-0003", branch_id: "NBI", hospital: "Kenyatta National Hospital", hospital_code: "KNH-001", category: "Inpatient", amount: 95000, approved_amount: 95000, date: "2024-11-15", diagnosis: "Cardiac Procedure", status: "Approved", docs: JSON.stringify(["Hospital Bill.pdf", "Consultant Report.pdf"]), review_notes: "Covered under corporate policy", reviewed_by: "Claims Officer", reviewed_at: "2024-11-17T08:00:00Z", claimant_phone: "0733 999 000" },
  ];

  claims.forEach(c => {
    database.run(`
      INSERT OR IGNORE INTO claims (id, member_id, member, policy_id, branch_id, hospital, hospital_code, category, amount, approved_amount, date, diagnosis, status, docs, review_notes, reviewed_by, reviewed_at, claimant_phone)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [c.id, c.member_id, c.member, c.policy_id, c.branch_id, c.hospital, c.hospital_code, c.category, c.amount, c.approved_amount, c.date, c.diagnosis, c.status, c.docs, c.review_notes, c.reviewed_by, c.reviewed_at, c.claimant_phone]);
  });

  // Seed premiums
  const premiums = [
    { id: "PRM-001", member_id: "FS-NBI-0001", member: "John Kamau Mwangi", policy_id: "POL-2024-0001", branch_id: "NBI", due: 4200, paid: 4200, due_date: "2024-12-05", paid_date: "2024-12-05", status: "Paid", method: "SACCO Deduction", receipt_no: "RCP-2024-1201", days_overdue: 0 },
    { id: "PRM-002", member_id: "FS-MSA-0012", member: "Grace Wanjiru Njoroge", policy_id: "POL-2024-0002", branch_id: "MSA", due: 2100, paid: 2100, due_date: "2024-12-05", paid_date: "2024-12-05", status: "Paid", method: "SACCO Deduction", receipt_no: "RCP-2024-1202", days_overdue: 0 },
    { id: "PRM-003", member_id: "FS-KSM-0034", member: "Peter Otieno Odhiambo", policy_id: "POL-2023-0891", branch_id: "KSM", due: 2100, paid: 0, due_date: "2024-12-05", paid_date: null, status: "Missed", method: null, receipt_no: null, days_overdue: 32 },
    { id: "PRM-004", member_id: "FS-ELD-0019", member: "David Kipchoge Rotich", policy_id: "POL-2024-0005", branch_id: "ELD", due: 2100, paid: 0, due_date: "2024-12-05", paid_date: null, status: "Pending", method: null, receipt_no: null, days_overdue: 0 },
    { id: "PRM-005", member_id: "FS-NBI-0088", member: "ABC Enterprises Ltd", policy_id: "POL-2024-0003", branch_id: "NBI", due: 18500, paid: 18500, due_date: "2024-12-01", paid_date: "2024-12-01", status: "Paid", method: "Bank Transfer", receipt_no: "RCP-2024-1203", days_overdue: 0 },
    { id: "PRM-006", member_id: "FS-MSA-0055", member: "Mary Achieng Ouko", policy_id: "POL-2024-0004", branch_id: "MSA", due: 4200, paid: 4200, due_date: "2024-12-05", paid_date: "2024-12-05", status: "Paid", method: "SACCO Deduction", receipt_no: "RCP-2024-1204", days_overdue: 0 },
  ];

  premiums.forEach(p => {
    database.run(`
      INSERT OR IGNORE INTO premiums (id, member_id, member, policy_id, branch_id, due, paid, due_date, paid_date, status, method, receipt_no, days_overdue)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [p.id, p.member_id, p.member, p.policy_id, p.branch_id, p.due, p.paid, p.due_date, p.paid_date, p.status, p.method, p.receipt_no, p.days_overdue]);
  });

  // Seed audit logs
  const { v4: uid } = require("uuid");
  const auditLogs = [
    { id: uid(), timestamp: new Date(Date.now() - 600000).toISOString(), user_email: "admin@fortunesacco.co.ke", user_role: "System Admin", branch_name: "Nairobi HQ", action: "Policy POL-2024-0001 Renewed for 2025", module: "Policies", ip_address: "196.201.210.xx", status: "Success", type: "policy" },
    { id: uid(), timestamp: new Date(Date.now() - 1800000).toISOString(), user_email: "hr@fortunesacco.co.ke", user_role: "HR/CEO", branch_name: "Nairobi HQ", action: "Exported Branch Performance Report — All Branches", module: "Reports", ip_address: "196.201.210.yy", status: "Success", type: "finance" },
    { id: uid(), timestamp: new Date(Date.now() - 2400000).toISOString(), user_email: "unknown@gmail.com", user_role: "—", branch_name: "—", action: "Failed Login Attempt (3 tries) — Account locked", module: "Auth", ip_address: "102.89.77.xx", status: "Failed", type: "security" },
    { id: uid(), timestamp: new Date(Date.now() - 3600000).toISOString(), user_email: "claims@fortunesacco.co.ke", user_role: "Claims Officer", branch_name: "Kisumu", action: "Claim CLM-2024-0889 Partial Approval — KES 50,000 of KES 72,000", module: "Claims", ip_address: "196.201.44.xx", status: "Success", type: "claims" },
    { id: uid(), timestamp: new Date(Date.now() - 7200000).toISOString(), user_email: "system@fortunesacco.co.ke", user_role: "System", branch_name: "All Branches", action: "Monthly Premium Auto-Deduction Run — 11,169 members processed", module: "Premiums", ip_address: "Internal", status: "Success", type: "finance" },
  ];

  auditLogs.forEach(a => {
    database.run(`
      INSERT OR IGNORE INTO audit_logs (id, timestamp, user_email, user_role, branch_name, action, module, ip_address, status, type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [a.id, a.timestamp, a.user_email, a.user_role, a.branch_name, a.action, a.module, a.ip_address, a.status, a.type]);
  });
};

module.exports = { getDb, initializeDatabase, saveDb, execQuery, getOne, getAll, runQuery };
