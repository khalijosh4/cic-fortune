#!/usr/bin/env python3
"""
Fortune Sacco DB Engine
Node.js sends JSON commands via stdin, we respond via stdout.
Protocol: one JSON object per line (NDJSON)
"""
import sys, json, sqlite3, hashlib, uuid, os
from datetime import datetime, date, timedelta

DB_PATH = os.path.join(os.path.dirname(__file__), "fortune_sacco.db")

def get_conn():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn

def rows(cursor): return [dict(r) for r in cursor.fetchall()]
def row(cursor):
    r = cursor.fetchone()
    return dict(r) if r else None

def hp(p): return hashlib.sha256(f"fortune_sacco_cic_2025{p}".encode()).hexdigest()
def gid(): return str(uuid.uuid4())
def now(): return datetime.now().isoformat(sep=" ", timespec="seconds")

conn = get_conn()

# ── SCHEMA ────────────────────────────────────────────────────────────────────
def init_schema():
    conn.executescript("""
    CREATE TABLE IF NOT EXISTS branches (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, county TEXT NOT NULL,
        manager TEXT, phone TEXT, email TEXT, address TEXT,
        created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY, staff_id TEXT UNIQUE NOT NULL,
        full_name TEXT NOT NULL, email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('admin','hr','branch','claims')),
        branch_id TEXT REFERENCES branches(id),
        is_active INTEGER DEFAULT 1, last_login TEXT,
        failed_logins INTEGER DEFAULT 0, locked_until TEXT,
        created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS members (
        id TEXT PRIMARY KEY, member_no TEXT UNIQUE NOT NULL,
        full_name TEXT NOT NULL, id_number TEXT UNIQUE,
        date_of_birth TEXT, gender TEXT, phone TEXT, email TEXT,
        branch_id TEXT NOT NULL REFERENCES branches(id),
        account_no TEXT, account_balance REAL DEFAULT 0,
        status TEXT DEFAULT 'Active', created_by TEXT, created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS policies (
        id TEXT PRIMARY KEY, policy_no TEXT UNIQUE NOT NULL,
        member_id TEXT NOT NULL REFERENCES members(id),
        branch_id TEXT NOT NULL REFERENCES branches(id),
        cover_type TEXT NOT NULL, annual_limit REAL NOT NULL,
        outpatient_limit REAL DEFAULT 0, inpatient_limit REAL DEFAULT 0,
        maternity_limit REAL DEFAULT 0, dental_limit REAL DEFAULT 0,
        optical_limit REAL DEFAULT 0, last_expense_limit REAL DEFAULT 0,
        monthly_premium REAL NOT NULL, start_date TEXT NOT NULL,
        expiry_date TEXT NOT NULL, status TEXT DEFAULT 'Active',
        deduction_day INTEGER DEFAULT 5, notes TEXT,
        created_by TEXT, created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS policy_dependants (
        id TEXT PRIMARY KEY, policy_id TEXT NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
        full_name TEXT NOT NULL, relationship TEXT, dob TEXT, id_number TEXT
    );
    CREATE TABLE IF NOT EXISTS premiums (
        id TEXT PRIMARY KEY, policy_id TEXT NOT NULL REFERENCES policies(id),
        member_id TEXT NOT NULL REFERENCES members(id),
        branch_id TEXT NOT NULL REFERENCES branches(id),
        amount_due REAL NOT NULL, amount_paid REAL DEFAULT 0,
        due_date TEXT NOT NULL, paid_date TEXT, period_month TEXT NOT NULL,
        status TEXT DEFAULT 'Pending', payment_method TEXT DEFAULT 'Account Deduction',
        transaction_ref TEXT, notes TEXT,
        created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS hospitals (
        id TEXT PRIMARY KEY, provider_code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL, type TEXT NOT NULL, county TEXT NOT NULL,
        address TEXT, contact_person TEXT, phone TEXT, email TEXT,
        credit_limit REAL DEFAULT 0, status TEXT DEFAULT 'Active',
        nhif_accredited INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS claims (
        id TEXT PRIMARY KEY, claim_no TEXT UNIQUE NOT NULL,
        policy_id TEXT NOT NULL REFERENCES policies(id),
        member_id TEXT NOT NULL REFERENCES members(id),
        branch_id TEXT NOT NULL REFERENCES branches(id),
        hospital_id TEXT REFERENCES hospitals(id),
        category TEXT NOT NULL, diagnosis TEXT, doctor_name TEXT,
        admission_date TEXT, discharge_date TEXT,
        claim_amount REAL NOT NULL, approved_amount REAL,
        paid_amount REAL DEFAULT 0, date_filed TEXT NOT NULL,
        date_reviewed TEXT, status TEXT DEFAULT 'Pending',
        rejection_reason TEXT, admin_notes TEXT,
        reviewed_by TEXT REFERENCES users(id),
        payment_date TEXT, payment_ref TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS claim_documents (
        id TEXT PRIMARY KEY, claim_id TEXT NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
        filename TEXT NOT NULL, file_type TEXT, file_size INTEGER,
        uploaded_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY, user_id TEXT, user_email TEXT, role TEXT,
        branch_id TEXT, action TEXT NOT NULL, resource TEXT, resource_id TEXT,
        ip_address TEXT, status TEXT DEFAULT 'Success', details TEXT,
        created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY, user_id TEXT, branch_id TEXT,
        type TEXT NOT NULL, title TEXT NOT NULL, message TEXT,
        is_read INTEGER DEFAULT 0, priority TEXT DEFAULT 'normal',
        created_at TEXT DEFAULT (datetime('now'))
    );
    """)
    conn.commit()

# ── SEED DATA ─────────────────────────────────────────────────────────────────
def seed():
    if conn.execute("SELECT COUNT(*) FROM branches").fetchone()[0] > 0:
        return

    branches = [
        ("NBI","Nairobi HQ","Nairobi","Sarah Kimani","+254 20 123 4567","nairobi@fortunesacco.co.ke"),
        ("MSA","Mombasa","Mombasa","Ahmed Hassan","+254 41 123 4567","mombasa@fortunesacco.co.ke"),
        ("KSM","Kisumu","Kisumu","Grace Otieno","+254 57 123 4567","kisumu@fortunesacco.co.ke"),
        ("NKR","Nakuru","Nakuru","John Mwangi","+254 51 123 4567","nakuru@fortunesacco.co.ke"),
        ("ELD","Eldoret","Uasin Gishu","Mercy Kipchoge","+254 53 123 4567","eldoret@fortunesacco.co.ke"),
        ("THK","Thika","Kiambu","Peter Njoroge","+254 67 123 4567","thika@fortunesacco.co.ke"),
        ("NYR","Nyeri","Nyeri","Ann Wambui","+254 61 123 4567","nyeri@fortunesacco.co.ke"),
        ("MRU","Meru","Meru","David Muriuki","+254 64 123 4567","meru@fortunesacco.co.ke"),
        ("KTL","Kitale","Trans Nzoia","Robert Wafula","+254 54 123 4567","kitale@fortunesacco.co.ke"),
        ("KRC","Kericho","Kericho","Esther Sang","+254 52 123 4567","kericho@fortunesacco.co.ke"),
        ("EMB","Embu","Embu","James Muthomi","+254 68 123 4567","embu@fortunesacco.co.ke"),
        ("MCK","Machakos","Machakos","Lucy Mutua","+254 44 123 4567","machakos@fortunesacco.co.ke"),
        ("KKM","Kakamega","Kakamega","Victor Shikuku","+254 56 123 4567","kakamega@fortunesacco.co.ke"),
        ("GRS","Garissa","Garissa","Fatuma Aden","+254 46 123 4567","garissa@fortunesacco.co.ke"),
        ("MLD","Malindi","Kilifi","Ali Omar","+254 42 123 4567","malindi@fortunesacco.co.ke"),
        ("NNK","Nanyuki","Laikipia","Carol Kimotho","+254 62 123 4567","nanyuki@fortunesacco.co.ke"),
        ("BGM","Bungoma","Bungoma","Moses Wanyama","+254 55 123 4567","bungoma@fortunesacco.co.ke"),
        ("KSI","Kisii","Kisii","Beatrice Nyamweya","+254 58 123 4567","kisii@fortunesacco.co.ke"),
        ("NVS","Naivasha","Nakuru","Joseph Karanja","+254 50 123 4567","naivasha@fortunesacco.co.ke"),
        ("MRG","Muranga","Muranga","Hannah Wanjiku","+254 60 123 4567","muranga@fortunesacco.co.ke"),
    ]
    conn.executemany("INSERT OR IGNORE INTO branches(id,name,county,manager,phone,email) VALUES(?,?,?,?,?,?)", branches)

    pwd = hp("admin123")
    users = [
        (gid(),"FS-ADM-001","System Administrator","admin@fortunesacco.co.ke",pwd,"admin","NBI"),
        (gid(),"FS-HR-001","CEO James Kariuki","hr@fortunesacco.co.ke",pwd,"hr","NBI"),
        (gid(),"FS-NBI-001","Sarah Kimani","branch.nbi@fortunesacco.co.ke",pwd,"branch","NBI"),
        (gid(),"FS-MSA-001","Ahmed Hassan","branch.msa@fortunesacco.co.ke",pwd,"branch","MSA"),
        (gid(),"FS-KSM-001","Grace Otieno","branch.ksm@fortunesacco.co.ke",pwd,"branch","KSM"),
        (gid(),"FS-CLM-001","Claims Officer","claims@fortunesacco.co.ke",pwd,"claims","NBI"),
        (gid(),"FS-NKR-001","John Mwangi","branch.nkr@fortunesacco.co.ke",pwd,"branch","NKR"),
        (gid(),"FS-ELD-001","Mercy Kipchoge","branch.eld@fortunesacco.co.ke",pwd,"branch","ELD"),
    ]
    conn.executemany("INSERT OR IGNORE INTO users(id,staff_id,full_name,email,password_hash,role,branch_id) VALUES(?,?,?,?,?,?,?)", users)

    hospitals = [
        ("H001","CIC-H-001","Nairobi Hospital","Referral","Nairobi","Upper Hill","Dr. Omondi","020 284 5000","nh@hosp.ke",2000000,"Active",1),
        ("H002","CIC-H-002","Aga Khan Hospital","Private","Nairobi","3rd Parklands","Dr. Khan","020 366 2000","akh@hosp.ke",1500000,"Active",1),
        ("H003","CIC-H-003","MP Shah Hospital","Private","Nairobi","Shivachi Rd","Dr. Shah","020 428 7000","mps@hosp.ke",1000000,"Active",1),
        ("H004","CIC-H-004","Coast General Hospital","Referral","Mombasa","Mombasa CBD","Dr. Njau","041 231 4201","cgh@hosp.ke",1000000,"Active",1),
        ("H005","CIC-H-005","Kisumu County Referral","County","Kisumu","Kisumu CBD","Dr. Oloo","057 202 1000","kcr@hosp.ke",800000,"Active",1),
        ("H006","CIC-H-006","Nakuru Level 5","County","Nakuru","Nakuru CBD","Dr. Gitau","051 221 3800","nl5@hosp.ke",750000,"Probation",1),
        ("H007","CIC-H-007","Eldoret Teaching Hospital","Teaching","Eldoret","Eldoret CBD","Dr. Rono","053 206 2000","eth@hosp.ke",900000,"Active",1),
        ("H008","CIC-H-008","Karen Hospital","Private","Nairobi","Karen","Dr. Mburu","020 884 4000","kh@hosp.ke",1200000,"Active",1),
        ("H009","CIC-H-009","Mater Hospital","Private","Nairobi","South B","Dr. Waweru","020 690 9000","mh@hosp.ke",1000000,"Active",1),
        ("H010","CIC-H-010","Kenyatta National Hospital","Teaching","Nairobi","Upper Hill","Dr. Mwenda","020 272 6300","knh@hosp.ke",500000,"Active",1),
    ]
    conn.executemany("INSERT OR IGNORE INTO hospitals(id,provider_code,name,type,county,address,contact_person,phone,email,credit_limit,status,nhif_accredited) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)", hospitals)

    members = [
        ("M001","FS-NBI-0001","John Kamau Mwangi","12345678","1985-03-15","Male","0712345678","john@e.co","NBI","ACC-NBI-001",150000,"Active"),
        ("M002","FS-MSA-0012","Grace Wanjiru Njoroge","23456789","1990-07-22","Female","0722111222","grace@e.co","MSA","ACC-MSA-012",80000,"Active"),
        ("M003","FS-KSM-0034","Peter Otieno Odhiambo","34567890","1978-11-05","Male","0700456789","peter@e.co","KSM","ACC-KSM-034",25000,"Active"),
        ("M004","FS-MSA-0055","Mary Achieng Ouko","45678901","1988-04-18","Female","0711222333","mary@e.co","MSA","ACC-MSA-055",120000,"Active"),
        ("M005","FS-ELD-0019","David Kipchoge Rotich","56789012","1992-09-30","Male","0724567890","david@e.co","ELD","ACC-ELD-019",45000,"Active"),
        ("M006","FS-NBI-0088","James Waweru Njuguna","67890123","1975-01-12","Male","0733999001","james@e.co","NBI","ACC-NBI-088",500000,"Active"),
        ("M007","FS-NKR-0022","Esther Njoki Kamau","78901234","1995-06-25","Female","0745678901","esther@e.co","NKR","ACC-NKR-022",60000,"Active"),
        ("M008","FS-THK-0011","Robert Njoroge Waweru","89012345","1983-02-14","Male","0756789012","robert@e.co","THK","ACC-THK-011",90000,"Active"),
        ("M009","FS-KSM-0067","Alice Anyango Ouma","90123456","1991-08-08","Female","0767890123","alice@e.co","KSM","ACC-KSM-067",35000,"Active"),
        ("M010","FS-NBI-0234","Hassan Ali Mohammed","01234567","1987-12-20","Male","0778901234","hassan@e.co","NBI","ACC-NBI-234",200000,"Active"),
        ("M011","FS-KRC-0008","Esther Sang Chepkwony","11223344","1993-05-14","Female","0791234567","esther.s@e.co","KRC","ACC-KRC-008",55000,"Active"),
        ("M012","FS-ELD-0031","Samuel Kiprop Mutai","22334455","1980-09-18","Male","0712987654","samuel@e.co","ELD","ACC-ELD-031",70000,"Active"),
    ]
    conn.executemany("INSERT OR IGNORE INTO members(id,member_no,full_name,id_number,date_of_birth,gender,phone,email,branch_id,account_no,account_balance,status) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)", members)

    admin_id = conn.execute("SELECT id FROM users WHERE role='admin'").fetchone()[0]
    policies = [
        ("POL001","POL-2024-0001","M001","NBI","Family",500000,75000,400000,80000,15000,10000,50000,4200,"2024-01-01","2025-12-31","Active",5),
        ("POL002","POL-2024-0002","M002","MSA","Individual",250000,40000,200000,0,10000,8000,30000,2100,"2024-03-01","2025-02-28","Active",5),
        ("POL003","POL-2024-0003","M006","NBI","Corporate Group",2000000,300000,1500000,200000,50000,30000,100000,18500,"2024-04-01","2025-03-31","Active",1),
        ("POL004","POL-2023-0891","M003","KSM","Individual",250000,40000,200000,0,10000,8000,30000,2100,"2023-06-01","2024-05-31","Expired",5),
        ("POL005","POL-2024-0004","M004","MSA","Family",500000,75000,400000,80000,15000,10000,50000,4200,"2024-07-01","2025-06-30","Active",5),
        ("POL006","POL-2024-0005","M005","ELD","Individual",250000,40000,200000,0,10000,8000,30000,2100,"2024-08-01","2025-07-31","Active",5),
        ("POL007","POL-2024-0006","M007","NKR","Family",500000,75000,400000,80000,15000,10000,50000,4200,"2024-05-01","2025-04-30","Active",5),
        ("POL008","POL-2024-0007","M008","THK","Individual",250000,40000,200000,0,10000,8000,30000,2100,"2024-06-01","2025-05-31","Active",5),
        ("POL009","POL-2024-0008","M009","KSM","Individual",250000,40000,200000,0,10000,8000,30000,2100,"2024-09-01","2025-08-31","Active",5),
        ("POL010","POL-2024-0009","M010","NBI","Family",500000,75000,400000,80000,15000,10000,50000,4200,"2024-02-01","2025-01-31","Active",5),
    ]
    for p in policies:
        conn.execute("""INSERT OR IGNORE INTO policies
            (id,policy_no,member_id,branch_id,cover_type,annual_limit,outpatient_limit,inpatient_limit,
             maternity_limit,dental_limit,optical_limit,last_expense_limit,monthly_premium,
             start_date,expiry_date,status,deduction_day,created_by)
            VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""", p+(admin_id,))

    premiums = [
        ("PR001","POL001","M001","NBI",4200,4200,"2025-01-05","2025-01-05","2025-01","Paid","Account Deduction","TXN-001"),
        ("PR002","POL002","M002","MSA",2100,2100,"2025-01-05","2025-01-05","2025-01","Paid","Account Deduction","TXN-002"),
        ("PR003","POL004","M003","KSM",2100,0,"2025-01-05",None,"2025-01","Missed",None,None),
        ("PR004","POL006","M005","ELD",2100,0,"2025-01-05",None,"2025-01","Pending",None,None),
        ("PR005","POL003","M006","NBI",18500,18500,"2025-01-01","2025-01-01","2025-01","Paid","Account Deduction","TXN-005"),
        ("PR006","POL005","M004","MSA",4200,4200,"2025-01-05","2025-01-05","2025-01","Paid","Account Deduction","TXN-006"),
        ("PR007","POL007","M007","NKR",4200,4200,"2025-01-05","2025-01-05","2025-01","Paid","Account Deduction","TXN-007"),
        ("PR008","POL001","M001","NBI",4200,4200,"2024-12-05","2024-12-05","2024-12","Paid","Account Deduction","TXN-008"),
        ("PR009","POL002","M002","MSA",2100,2100,"2024-12-05","2024-12-05","2024-12","Paid","Account Deduction","TXN-009"),
        ("PR010","POL004","M003","KSM",2100,0,"2024-12-05",None,"2024-12","Missed",None,None),
        ("PR011","POL008","M008","THK",2100,2100,"2025-01-05","2025-01-05","2025-01","Paid","Account Deduction","TXN-011"),
        ("PR012","POL009","M009","KSM",2100,0,"2025-01-05",None,"2025-01","Pending",None,None),
    ]
    conn.executemany("INSERT OR IGNORE INTO premiums(id,policy_id,member_id,branch_id,amount_due,amount_paid,due_date,paid_date,period_month,status,payment_method,transaction_ref) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)", premiums)

    claims = [
        ("CLM001","CLM-2025-0001","POL001","M001","NBI","H001","Inpatient","Appendectomy","Dr. Omondi","2025-01-10","2025-01-13",45000,None,0,"2025-01-13",None,"Pending",None,None,None,None,None),
        ("CLM002","CLM-2025-0002","POL005","M004","MSA","H004","Outpatient","Malaria Treatment","Dr. Njau",None,None,28500,28500,28500,"2025-01-08","2025-01-09","Paid",None,None,None,"2025-01-10","TXN-CLM-002"),
        ("CLM003","CLM-2025-0003","POL002","M002","MSA","H002","Inpatient","Surgical Procedure","Dr. Khan","2024-12-20","2024-12-25",72000,50000,50000,"2024-12-25","2024-12-27","Paid",None,None,None,"2024-12-30","TXN-CLM-003"),
        ("CLM004","CLM-2024-0004","POL004","M003","KSM","H005","Outpatient","Diabetes Consultation","Dr. Oloo",None,None,15000,None,0,"2024-11-20","2024-11-22","Rejected",None,"Policy expired at time of claim",None,None,None),
        ("CLM005","CLM-2025-0005","POL006","M005","ELD","H007","Outpatient","General Checkup","Dr. Rono",None,None,8400,8400,8400,"2025-01-05","2025-01-06","Paid",None,None,None,"2025-01-07","TXN-CLM-005"),
        ("CLM006","CLM-2025-0006","POL010","M010","NBI","H001","Maternity","Normal Delivery","Dr. Omondi","2025-01-12","2025-01-13",95000,None,0,"2025-01-13",None,"Pending",None,None,None,None,None),
        ("CLM007","CLM-2024-0007","POL003","M006","NBI","H008","Inpatient","Knee Surgery","Dr. Mburu","2024-11-10","2024-11-15",180000,150000,150000,"2024-11-10","2024-11-18","Paid",None,None,None,"2024-11-25","TXN-CLM-007"),
        ("CLM008","CLM-2025-0008","POL007","M007","NKR","H006","Outpatient","Typhoid Treatment","Dr. Gitau",None,None,12000,None,0,"2025-01-11",None,"Under Review",None,None,None,None,None),
        ("CLM009","CLM-2025-0009","POL008","M008","THK","H003","Dental","Tooth Extraction","Dr. Shah",None,None,9500,9500,9500,"2025-01-07","2025-01-08","Paid",None,None,None,"2025-01-09","TXN-CLM-009"),
        ("CLM010","CLM-2025-0010","POL001","M001","NBI","H001","Optical","Eye Examination","Dr. Omondi",None,None,6500,None,0,"2025-01-14",None,"Pending",None,None,None,None,None),
    ]
    for cl in claims:
        conn.execute("""INSERT OR IGNORE INTO claims
            (id,claim_no,policy_id,member_id,branch_id,hospital_id,category,diagnosis,doctor_name,
             admission_date,discharge_date,claim_amount,approved_amount,paid_amount,
             date_filed,date_reviewed,status,rejection_reason,admin_notes,
             reviewed_by,payment_date,payment_ref)
            VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""", cl)

    claim_docs = [
        ("DOC001","CLM001","Hospital Bill.pdf","application/pdf",245000),
        ("DOC002","CLM001","Discharge Summary.pdf","application/pdf",189000),
        ("DOC003","CLM001","Lab Results.jpg","image/jpeg",320000),
        ("DOC004","CLM006","Maternity Bill.pdf","application/pdf",210000),
        ("DOC005","CLM008","Prescription.pdf","application/pdf",88000),
    ]
    conn.executemany("INSERT OR IGNORE INTO claim_documents(id,claim_id,filename,file_type,file_size) VALUES(?,?,?,?,?)", claim_docs)

    notifs = [
        (gid(),None,"NBI","alert","Missed Premium – Peter Otieno","2 months overdue · Policy may be suspended",0,"high"),
        (gid(),None,None,"claim","New Claim #CLM-2025-0001 Pending Review","John Kamau · KES 45,000 · Inpatient",0,"normal"),
        (gid(),None,"MSA","renewal","Policy Expiring – Grace Wanjiru","POL-2024-0002 expires in 45 days",0,"normal"),
        (gid(),None,None,"security","System Started","Fortune Sacco CIC backend is online",0,"normal"),
        (gid(),None,None,"claim","Claim Paid – Mary Achieng KES 28,500","Mombasa Branch · Outpatient",1,"normal"),
    ]
    conn.executemany("INSERT OR IGNORE INTO notifications(id,user_id,branch_id,type,title,message,is_read,priority) VALUES(?,?,?,?,?,?,?,?)", notifs)

    conn.execute("""INSERT OR IGNORE INTO audit_logs(id,user_email,role,action,ip_address,status)
        VALUES(?,?,?,?,?,?)""", (gid(),"system","admin","Database initialised & seed data loaded","127.0.0.1","Success"))

    conn.commit()

# ── QUERY HANDLERS ────────────────────────────────────────────────────────────
def handle(cmd):
    t = cmd.get("type")
    d = cmd.get("data", {})
    try:
        if t == "ping": return {"ok": True, "msg": "pong"}
        if t == "auth_login": return auth_login(d)
        if t == "auth_me": return auth_me(d)
        if t == "get_dashboard": return get_dashboard(d)
        if t == "get_branch_summary": return get_branch_summary()
        if t == "get_branches": return {"branches": rows(conn.execute("SELECT * FROM branches ORDER BY name"))}
        if t == "get_members": return get_members(d)
        if t == "get_member": return get_member(d)
        if t == "create_member": return create_member(d)
        if t == "update_member": return update_member(d)
        if t == "get_policies": return get_policies(d)
        if t == "get_policy": return get_policy(d)
        if t == "create_policy": return create_policy(d)
        if t == "update_policy": return update_policy(d)
        if t == "renew_policy": return renew_policy(d)
        if t == "get_premiums": return get_premiums(d)
        if t == "run_deductions": return run_deductions(d)
        if t == "mark_premium_paid": return mark_premium_paid(d)
        if t == "get_claims": return get_claims(d)
        if t == "get_claim": return get_claim(d)
        if t == "submit_claim": return submit_claim(d)
        if t == "review_claim": return review_claim(d)
        if t == "add_claim_doc": return add_claim_doc(d)
        if t == "get_hospitals": return get_hospitals(d)
        if t == "add_hospital": return add_hospital(d)
        if t == "update_hospital": return update_hospital(d)
        if t == "get_notifications": return get_notifications(d)
        if t == "mark_notif_read": return mark_notif_read(d)
        if t == "mark_all_read": return mark_all_read(d)
        if t == "get_audit_logs": return get_audit_logs(d)
        if t == "get_alerts": return get_alerts(d)
        if t == "get_users": return get_users(d)
        if t == "create_user": return create_user(d)
        if t == "get_stats_summary": return get_stats_summary(d)
        return {"error": f"Unknown command: {t}"}
    except Exception as e:
        import traceback
        return {"error": str(e), "trace": traceback.format_exc()[:300]}

# ── AUTH ──────────────────────────────────────────────────────────────────────
def auth_login(d):
    email = (d.get("email","")).strip().lower()
    pwd   = d.get("password","")
    user  = row(conn.execute("SELECT * FROM users WHERE LOWER(email)=? AND is_active=1",(email,)))
    if not user:
        log_audit(None,email,None,None,"Login failed – user not found","auth","127.0.0.1","Failed",None)
        return {"error":"Invalid email or password"}
    if user["failed_logins"] >= 5:
        locked = user.get("locked_until")
        if locked and datetime.fromisoformat(locked) > datetime.now():
            return {"error":f"Account locked. Too many failed attempts."}
    if user["password_hash"] != hp(pwd):
        fails = user["failed_logins"]+1
        lock = (datetime.now()+timedelta(minutes=30)).isoformat() if fails>=5 else None
        conn.execute("UPDATE users SET failed_logins=?,locked_until=? WHERE id=?",(fails,lock,user["id"]))
        conn.commit()
        log_audit(user["id"],email,user["role"],user["branch_id"],"Failed login","auth","127.0.0.1","Failed",f"Attempt {fails}")
        return {"error":"Invalid email or password","attempts_remaining":max(0,5-fails)}
    conn.execute("UPDATE users SET failed_logins=0,locked_until=NULL,last_login=? WHERE id=?",(now(),user["id"]))
    conn.commit()
    branch = row(conn.execute("SELECT * FROM branches WHERE id=?",(user["branch_id"],))) if user["branch_id"] else None
    log_audit(user["id"],email,user["role"],user["branch_id"],"User login","auth","127.0.0.1","Success",None)
    return {"ok":True,"user":{
        "id":user["id"],"staff_id":user["staff_id"],"full_name":user["full_name"],
        "email":user["email"],"role":user["role"],"branch_id":user["branch_id"],
        "branch_name":branch["name"] if branch else None
    }}

def auth_me(d):
    uid = d.get("user_id")
    if not uid: return {"error":"No user_id"}
    user = row(conn.execute("SELECT id,staff_id,full_name,email,role,branch_id,last_login FROM users WHERE id=?",(uid,)))
    if not user: return {"error":"User not found"}
    branch = row(conn.execute("SELECT * FROM branches WHERE id=?",(user["branch_id"],))) if user["branch_id"] else None
    return {"user":user,"branch":branch}

# ── DASHBOARD ─────────────────────────────────────────────────────────────────
def get_dashboard(d):
    bid = d.get("branch_id")
    w = "AND branch_id=?" if bid else ""
    a = (bid,) if bid else ()

    def q(sql): return conn.execute(sql,a).fetchone()[0]

    conn.execute("UPDATE policies SET status='Expired' WHERE status='Active' AND date(expiry_date)<date('now')")
    conn.commit()

    stats = {
        "total_members":     q(f"SELECT COUNT(*) FROM members WHERE 1=1 {w}"),
        "active_policies":   q(f"SELECT COUNT(*) FROM policies WHERE status='Active' {w}"),
        "expired_policies":  q(f"SELECT COUNT(*) FROM policies WHERE status='Expired' {w}"),
        "claims_this_month": q(f"SELECT COUNT(*) FROM claims WHERE strftime('%Y-%m',date_filed)=strftime('%Y-%m','now') {w}"),
        "claims_pending":    q(f"SELECT COUNT(*) FROM claims WHERE status='Pending' {w}"),
        "claims_review":     q(f"SELECT COUNT(*) FROM claims WHERE status='Under Review' {w}"),
        "total_hospitals":   conn.execute("SELECT COUNT(*) FROM hospitals WHERE status='Active'").fetchone()[0],
        "missed_payments":   q(f"SELECT COUNT(*) FROM premiums WHERE status='Missed' AND strftime('%Y-%m',period_month)=strftime('%Y-%m','now') {w}"),
        "expiring_30":       q(f"SELECT COUNT(*) FROM policies WHERE status='Active' AND date(expiry_date) BETWEEN date('now') AND date('now','+30 days') {w}"),
        "premiums_month":    q(f"SELECT COALESCE(SUM(amount_paid),0) FROM premiums WHERE strftime('%Y-%m',period_month)=strftime('%Y-%m','now') {w}"),
        "claims_paid_total": q(f"SELECT COALESCE(SUM(paid_amount),0) FROM claims {w.replace('AND','WHERE')}"),
        "premiums_total":    q(f"SELECT COALESCE(SUM(amount_paid),0) FROM premiums WHERE 1=1 {w}"),
    }

    claims_amt = conn.execute(f"SELECT COALESCE(SUM(approved_amount),0) FROM claims WHERE strftime('%Y-%m',date_filed)=strftime('%Y-%m','now') {w}",a).fetchone()[0]
    stats["loss_ratio"] = round((claims_amt/stats["premiums_month"])*100,1) if stats["premiums_month"]>0 else 0

    cover = rows(conn.execute(f"SELECT cover_type,COUNT(*) as cnt FROM policies WHERE status='Active' {w} GROUP BY cover_type",a))
    stats["cover_breakdown"] = {r["cover_type"]:r["cnt"] for r in cover}

    claim_status = rows(conn.execute(f"SELECT status,COUNT(*) as cnt FROM claims WHERE 1=1 {w} GROUP BY status",a))
    stats["claims_breakdown"] = {r["status"]:r["cnt"] for r in claim_status}

    monthly = rows(conn.execute(f"""
        SELECT period_month, SUM(amount_paid) as collected, SUM(amount_due) as due
        FROM premiums WHERE 1=1 {w} GROUP BY period_month ORDER BY period_month DESC LIMIT 12
    """,a))
    stats["monthly_premiums"] = monthly[::-1]

    top_hospitals = rows(conn.execute("""
        SELECT h.name, COUNT(c.id) as claims_count,
               COALESCE(SUM(c.approved_amount),0) as total_approved
        FROM claims c JOIN hospitals h ON c.hospital_id=h.id
        GROUP BY h.id ORDER BY claims_count DESC LIMIT 8
    """))
    stats["top_hospitals"] = top_hospitals
    return stats

def get_branch_summary():
    branches = rows(conn.execute("SELECT * FROM branches ORDER BY name"))
    for b in branches:
        bid = b["id"]
        b["members"]         = conn.execute("SELECT COUNT(*) FROM members WHERE branch_id=?",(bid,)).fetchone()[0]
        b["active_policies"] = conn.execute("SELECT COUNT(*) FROM policies WHERE branch_id=? AND status='Active'",(bid,)).fetchone()[0]
        b["premiums_month"]  = conn.execute("SELECT COALESCE(SUM(amount_paid),0) FROM premiums WHERE branch_id=? AND strftime('%Y-%m',period_month)=strftime('%Y-%m','now')",(bid,)).fetchone()[0]
        b["claims_month"]    = conn.execute("SELECT COUNT(*) FROM claims WHERE branch_id=? AND strftime('%Y-%m',date_filed)=strftime('%Y-%m','now')",(bid,)).fetchone()[0]
        b["missed_payments"] = conn.execute("SELECT COUNT(*) FROM premiums WHERE branch_id=? AND status='Missed'",(bid,)).fetchone()[0]
    return {"branches":branches}

# ── MEMBERS ───────────────────────────────────────────────────────────────────
def get_members(d):
    bid=d.get("branch_id"); search=d.get("search",""); status=d.get("status","")
    page=int(d.get("page",1)); pp=int(d.get("per_page",20))
    conds=[]; args=[]
    if bid: conds.append("m.branch_id=?"); args.append(bid)
    if search:
        conds.append("(m.full_name LIKE ? OR m.member_no LIKE ? OR m.phone LIKE ?)")
        args+=[f"%{search}%"]*3
    if status: conds.append("m.status=?"); args.append(status)
    w="WHERE "+" AND ".join(conds) if conds else ""
    all_rows=rows(conn.execute(f"""
        SELECT m.*,b.name as branch_name,
            (SELECT COUNT(*) FROM policies p WHERE p.member_id=m.id AND p.status='Active') as active_policies
        FROM members m LEFT JOIN branches b ON m.branch_id=b.id {w} ORDER BY m.created_at DESC
    """,args))
    total=len(all_rows); start=(page-1)*pp
    return {"data":all_rows[start:start+pp],"total":total,"page":page,"per_page":pp,"pages":(total+pp-1)//pp}

def get_member(d):
    mid=d.get("id")
    m=row(conn.execute("SELECT m.*,b.name as branch_name FROM members m LEFT JOIN branches b ON m.branch_id=b.id WHERE m.id=?",(mid,)))
    if not m: return {"error":"Member not found"}
    pols=rows(conn.execute("SELECT * FROM policies WHERE member_id=? ORDER BY created_at DESC",(mid,)))
    cls=rows(conn.execute("SELECT c.*,h.name as hospital_name FROM claims c LEFT JOIN hospitals h ON c.hospital_id=h.id WHERE c.member_id=? ORDER BY c.date_filed DESC",(mid,)))
    prms=rows(conn.execute("SELECT * FROM premiums WHERE member_id=? ORDER BY period_month DESC LIMIT 12",(mid,)))
    return {"member":m,"policies":pols,"claims":cls,"premiums":prms}

def create_member(d):
    bid=d.get("branch_id"); name=d.get("full_name")
    if not bid or not name: return {"error":"full_name and branch_id required"}
    count=conn.execute("SELECT COUNT(*) FROM members WHERE branch_id=?",(bid,)).fetchone()[0]
    mno=f"FS-{bid}-{str(count+1).zfill(4)}"
    mid=gid()
    conn.execute("""INSERT INTO members(id,member_no,full_name,id_number,date_of_birth,gender,phone,email,
        branch_id,account_no,account_balance,status,created_by) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)""",
        (mid,mno,name,d.get("id_number"),d.get("date_of_birth"),d.get("gender"),
         d.get("phone"),d.get("email"),bid,d.get("account_no"),float(d.get("account_balance",0)),"Active",d.get("created_by")))
    conn.commit()
    push_notif(f"New Member Enrolled: {name}",f"Member No: {mno}",bid,"member")
    log_audit(d.get("created_by"),None,None,bid,f"Member enrolled: {name}","members","127.0.0.1","Success",mid)
    return {"ok":True,"member_id":mid,"member_no":mno}

def update_member(d):
    mid=d.get("id")
    fields=["full_name","phone","email","date_of_birth","gender","account_no","account_balance","status"]
    updates={k:d[k] for k in fields if k in d}
    if not updates: return {"error":"Nothing to update"}
    updates["updated_at"]=now()
    s=", ".join(f"{k}=?" for k in updates)
    conn.execute(f"UPDATE members SET {s} WHERE id=?",list(updates.values())+[mid])
    conn.commit()
    return {"ok":True}

# ── POLICIES ──────────────────────────────────────────────────────────────────
def get_policies(d):
    bid=d.get("branch_id"); search=d.get("search",""); status=d.get("status",""); ct=d.get("cover_type","")
    page=int(d.get("page",1)); pp=int(d.get("per_page",20))
    conn.execute("UPDATE policies SET status='Expired' WHERE status='Active' AND date(expiry_date)<date('now')")
    conn.commit()
    conds=[]; args=[]
    if bid: conds.append("p.branch_id=?"); args.append(bid)
    if search: conds.append("(m.full_name LIKE ? OR p.policy_no LIKE ?)"); args+=[f"%{search}%"]*2
    if status: conds.append("p.status=?"); args.append(status)
    if ct: conds.append("p.cover_type=?"); args.append(ct)
    w="WHERE "+" AND ".join(conds) if conds else ""
    all_rows=rows(conn.execute(f"""
        SELECT p.*,m.full_name as member_name,m.phone as member_phone,b.name as branch_name,
            (SELECT COALESCE(SUM(paid_amount),0) FROM claims WHERE policy_id=p.id) as utilised
        FROM policies p LEFT JOIN members m ON p.member_id=m.id LEFT JOIN branches b ON p.branch_id=b.id
        {w} ORDER BY p.created_at DESC
    """,args))
    total=len(all_rows); start=(page-1)*pp
    return {"data":all_rows[start:start+pp],"total":total,"page":page,"per_page":pp,"pages":(total+pp-1)//pp}

def get_policy(d):
    pid=d.get("id")
    pol=row(conn.execute("""SELECT p.*,m.full_name as member_name,m.phone,m.email as member_email,b.name as branch_name,
        (SELECT COALESCE(SUM(paid_amount),0) FROM claims WHERE policy_id=p.id AND category='Outpatient') as outpatient_used,
        (SELECT COALESCE(SUM(paid_amount),0) FROM claims WHERE policy_id=p.id AND category='Inpatient') as inpatient_used,
        (SELECT COALESCE(SUM(paid_amount),0) FROM claims WHERE policy_id=p.id AND category='Maternity') as maternity_used,
        (SELECT COALESCE(SUM(paid_amount),0) FROM claims WHERE policy_id=p.id AND category='Dental') as dental_used,
        (SELECT COALESCE(SUM(paid_amount),0) FROM claims WHERE policy_id=p.id AND category='Optical') as optical_used
        FROM policies p LEFT JOIN members m ON p.member_id=m.id LEFT JOIN branches b ON p.branch_id=b.id WHERE p.id=?""",(pid,)))
    if not pol: return {"error":"Policy not found"}
    deps=rows(conn.execute("SELECT * FROM policy_dependants WHERE policy_id=?",(pid,)))
    cls=rows(conn.execute("SELECT c.*,h.name as hospital_name FROM claims c LEFT JOIN hospitals h ON c.hospital_id=h.id WHERE c.policy_id=? ORDER BY c.date_filed DESC",(pid,)))
    prms=rows(conn.execute("SELECT * FROM premiums WHERE policy_id=? ORDER BY period_month DESC",(pid,)))
    return {"policy":pol,"dependants":deps,"claims":cls,"premiums":prms}

def create_policy(d):
    required=["member_id","branch_id","cover_type","annual_limit","monthly_premium","start_date","expiry_date"]
    for f in required:
        if not d.get(f): return {"error":f"{f} is required"}
    count=conn.execute("SELECT COUNT(*) FROM policies").fetchone()[0]
    year=datetime.now().year
    pno=f"POL-{year}-{str(count+1).zfill(4)}"
    pid=gid()
    conn.execute("""INSERT INTO policies(id,policy_no,member_id,branch_id,cover_type,annual_limit,
        outpatient_limit,inpatient_limit,maternity_limit,dental_limit,optical_limit,last_expense_limit,
        monthly_premium,start_date,expiry_date,status,deduction_day,notes,created_by)
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
        (pid,pno,d["member_id"],d["branch_id"],d["cover_type"],float(d["annual_limit"]),
         float(d.get("outpatient_limit",0)),float(d.get("inpatient_limit",0)),
         float(d.get("maternity_limit",0)),float(d.get("dental_limit",0)),
         float(d.get("optical_limit",0)),float(d.get("last_expense_limit",0)),
         float(d["monthly_premium"]),d["start_date"],d["expiry_date"],
         d.get("status","Active"),int(d.get("deduction_day",5)),d.get("notes"),d.get("created_by")))
    for dep in d.get("dependants",[]):
        conn.execute("INSERT INTO policy_dependants(id,policy_id,full_name,relationship,dob,id_number) VALUES(?,?,?,?,?,?)",
            (gid(),pid,dep["full_name"],dep.get("relationship"),dep.get("dob"),dep.get("id_number")))
    conn.commit()
    m=row(conn.execute("SELECT full_name FROM members WHERE id=?",(d["member_id"],)))
    push_notif(f"Policy Created: {pno}",f"Member: {m['full_name'] if m else 'Unknown'} · {d['cover_type']}",d["branch_id"],"policy")
    log_audit(d.get("created_by"),None,None,d["branch_id"],f"Policy created: {pno}","policies","127.0.0.1","Success",pid)
    return {"ok":True,"policy_no":pno,"policy_id":pid}

def update_policy(d):
    pid=d.get("id")
    fields=["cover_type","annual_limit","outpatient_limit","inpatient_limit","maternity_limit",
            "dental_limit","optical_limit","monthly_premium","start_date","expiry_date","status","notes","deduction_day"]
    updates={k:d[k] for k in fields if k in d}
    if not updates: return {"error":"Nothing to update"}
    updates["updated_at"]=now()
    s=", ".join(f"{k}=?" for k in updates)
    conn.execute(f"UPDATE policies SET {s} WHERE id=?",list(updates.values())+[pid])
    conn.commit()
    return {"ok":True}

def renew_policy(d):
    pid=d.get("id")
    pol=row(conn.execute("SELECT * FROM policies WHERE id=?",(pid,)))
    if not pol: return {"error":"Policy not found"}
    old=datetime.strptime(pol["expiry_date"],"%Y-%m-%d").date()
    ns=old+timedelta(days=1)
    ne=ns.replace(year=ns.year+1)-timedelta(days=1)
    conn.execute("UPDATE policies SET start_date=?,expiry_date=?,status='Active',updated_at=? WHERE id=?",(ns.isoformat(),ne.isoformat(),now(),pid))
    conn.commit()
    return {"ok":True,"new_expiry":ne.isoformat()}

# ── PREMIUMS ──────────────────────────────────────────────────────────────────
def get_premiums(d):
    bid=d.get("branch_id"); month=d.get("month",""); status=d.get("status","")
    page=int(d.get("page",1)); pp=int(d.get("per_page",20))
    conds=[]; args=[]
    if bid: conds.append("pr.branch_id=?"); args.append(bid)
    if month: conds.append("pr.period_month=?"); args.append(month)
    if status: conds.append("pr.status=?"); args.append(status)
    w="WHERE "+" AND ".join(conds) if conds else ""
    all_rows=rows(conn.execute(f"""
        SELECT pr.*,m.full_name as member_name,p.policy_no,b.name as branch_name
        FROM premiums pr LEFT JOIN members m ON pr.member_id=m.id
        LEFT JOIN policies p ON pr.policy_id=p.id LEFT JOIN branches b ON pr.branch_id=b.id
        {w} ORDER BY pr.due_date DESC
    """,args))
    total=len(all_rows); start=(page-1)*pp
    return {"data":all_rows[start:start+pp],"total":total,"page":page,"per_page":pp,"pages":(total+pp-1)//pp}

def run_deductions(d):
    today=date.today(); period=today.strftime("%Y-%m"); processed=0; failed=0; total=0
    pols=rows(conn.execute("SELECT p.*,m.account_balance,m.id as mid,m.full_name FROM policies p JOIN members m ON p.member_id=m.id WHERE p.status='Active'"))
    for pol in pols:
        ex=conn.execute("SELECT id FROM premiums WHERE policy_id=? AND period_month=?",(pol["id"],period)).fetchone()
        if ex: continue
        due=f"{period}-{str(pol['deduction_day']).zfill(2)}"
        prid=gid()
        if pol["account_balance"]>=pol["monthly_premium"]:
            conn.execute("""INSERT INTO premiums(id,policy_id,member_id,branch_id,amount_due,amount_paid,
                due_date,paid_date,period_month,status,payment_method,transaction_ref) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)""",
                (prid,pol["id"],pol["member_id"],pol["branch_id"],pol["monthly_premium"],pol["monthly_premium"],
                 due,today.isoformat(),period,"Paid","Account Deduction",f"TXN-{period}-{prid[:8].upper()}"))
            conn.execute("UPDATE members SET account_balance=account_balance-? WHERE id=?",(pol["monthly_premium"],pol["mid"]))
            processed+=1; total+=pol["monthly_premium"]
        else:
            conn.execute("""INSERT INTO premiums(id,policy_id,member_id,branch_id,amount_due,amount_paid,
                due_date,period_month,status,notes) VALUES(?,?,?,?,?,?,?,?,?,?)""",
                (prid,pol["id"],pol["member_id"],pol["branch_id"],pol["monthly_premium"],0,due,period,"Missed",
                 f"Insufficient balance: KES {pol['account_balance']:.0f}"))
            failed+=1
            push_notif(f"Missed Premium – {pol['full_name']}",f"Insufficient balance · Policy {pol['policy_no']}",pol["branch_id"],"alert","high")
    conn.commit()
    log_audit(d.get("user_id"),None,None,None,f"Premium batch run – Period:{period} Paid:{processed} Missed:{failed}","premiums","127.0.0.1","Success",f"KES {total:,.0f}")
    return {"ok":True,"period":period,"processed":processed,"failed":failed,"total_collected":total}

def mark_premium_paid(d):
    pid=d.get("id")
    conn.execute("UPDATE premiums SET status='Paid',amount_paid=amount_due,paid_date=?,payment_method=?,transaction_ref=? WHERE id=?",
        (date.today().isoformat(),d.get("payment_method","Manual"),d.get("ref",f"MAN-{gid()[:8].upper()}"),pid))
    conn.commit()
    return {"ok":True}

# ── CLAIMS ────────────────────────────────────────────────────────────────────
def get_claims(d):
    bid=d.get("branch_id"); search=d.get("search",""); status=d.get("status",""); cat=d.get("category","")
    page=int(d.get("page",1)); pp=int(d.get("per_page",20))
    conds=[]; args=[]
    if bid: conds.append("c.branch_id=?"); args.append(bid)
    if search: conds.append("(m.full_name LIKE ? OR c.claim_no LIKE ? OR c.diagnosis LIKE ?)"); args+=[f"%{search}%"]*3
    if status: conds.append("c.status=?"); args.append(status)
    if cat: conds.append("c.category=?"); args.append(cat)
    w="WHERE "+" AND ".join(conds) if conds else ""
    all_rows=rows(conn.execute(f"""
        SELECT c.*,m.full_name as member_name,p.policy_no,p.cover_type,
               h.name as hospital_name,b.name as branch_name,
               (SELECT COUNT(*) FROM claim_documents WHERE claim_id=c.id) as doc_count
        FROM claims c LEFT JOIN members m ON c.member_id=m.id
        LEFT JOIN policies p ON c.policy_id=p.id LEFT JOIN hospitals h ON c.hospital_id=h.id
        LEFT JOIN branches b ON c.branch_id=b.id {w} ORDER BY c.date_filed DESC
    """,args))
    total=len(all_rows); start=(page-1)*pp
    return {"data":all_rows[start:start+pp],"total":total,"page":page,"per_page":pp,"pages":(total+pp-1)//pp}

def get_claim(d):
    cid=d.get("id")
    cl=row(conn.execute("""SELECT c.*,m.full_name as member_name,m.phone as member_phone,
        p.policy_no,p.cover_type,p.inpatient_limit,p.outpatient_limit,p.annual_limit,
        h.name as hospital_name,b.name as branch_name,u.full_name as reviewer_name
        FROM claims c LEFT JOIN members m ON c.member_id=m.id LEFT JOIN policies p ON c.policy_id=p.id
        LEFT JOIN hospitals h ON c.hospital_id=h.id LEFT JOIN branches b ON c.branch_id=b.id
        LEFT JOIN users u ON c.reviewed_by=u.id WHERE c.id=?""",(cid,)))
    if not cl: return {"error":"Claim not found"}
    docs=rows(conn.execute("SELECT * FROM claim_documents WHERE claim_id=?",(cid,)))
    return {"claim":cl,"documents":docs}

def submit_claim(d):
    required=["policy_id","member_id","branch_id","category","claim_amount","date_filed"]
    for f in required:
        if not d.get(f): return {"error":f"{f} is required"}
    pol=row(conn.execute("SELECT * FROM policies WHERE id=?",(d["policy_id"],)))
    if not pol: return {"error":"Policy not found"}
    if pol["status"] not in ("Active","Pending"): return {"error":f"Policy is {pol['status']}. Active policy required."}
    count=conn.execute("SELECT COUNT(*) FROM claims").fetchone()[0]
    year=datetime.now().year; cno=f"CLM-{year}-{str(count+1).zfill(4)}"
    cid=gid()
    conn.execute("""INSERT INTO claims(id,claim_no,policy_id,member_id,branch_id,hospital_id,
        category,diagnosis,doctor_name,admission_date,discharge_date,claim_amount,date_filed,status)
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
        (cid,cno,d["policy_id"],d["member_id"],d["branch_id"],d.get("hospital_id"),
         d["category"],d.get("diagnosis"),d.get("doctor_name"),
         d.get("admission_date"),d.get("discharge_date"),float(d["claim_amount"]),d["date_filed"],"Pending"))
    conn.commit()
    m=row(conn.execute("SELECT full_name FROM members WHERE id=?",(d["member_id"],)))
    push_notif(f"New Claim: {cno}",f"{m['full_name'] if m else 'Unknown'} · {d['category']} · KES {float(d['claim_amount']):,.0f}",None,"claim")
    log_audit(d.get("created_by"),None,None,d["branch_id"],f"Claim submitted: {cno} KES {d['claim_amount']}","claims","127.0.0.1","Success",cid)
    return {"ok":True,"claim_no":cno,"claim_id":cid}

def review_claim(d):
    cid=d.get("id"); action=d.get("action")
    if action not in ("approve","reject","partial"): return {"error":"action must be approve/reject/partial"}
    cl=row(conn.execute("SELECT * FROM claims WHERE id=?",(cid,)))
    if not cl: return {"error":"Claim not found"}
    if cl["status"] not in ("Pending","Under Review"): return {"error":f"Claim already {cl['status']}"}
    updates={"date_reviewed":now(),"reviewed_by":d.get("user_id"),"admin_notes":d.get("notes",""),"updated_at":now()}
    if action=="approve":
        updates.update({"status":"Approved","approved_amount":cl["claim_amount"],"paid_amount":cl["claim_amount"],
            "payment_date":date.today().isoformat(),"payment_ref":f"PAY-{gid()[:8].upper()}"})
        msg=f"Claim {cl['claim_no']} approved KES {cl['claim_amount']:,.0f}"
    elif action=="reject":
        updates.update({"status":"Rejected","rejection_reason":d.get("reason",d.get("notes",""))})
        msg=f"Claim {cl['claim_no']} rejected"
    else:
        amt=float(d.get("approved_amount",0))
        if amt<=0: return {"error":"approved_amount must be > 0"}
        updates.update({"status":"Partial","approved_amount":amt,"paid_amount":amt,
            "payment_date":date.today().isoformat(),"payment_ref":f"PAY-{gid()[:8].upper()}"})
        msg=f"Claim {cl['claim_no']} partially approved KES {amt:,.0f}"
    s=", ".join(f"{k}=?" for k in updates)
    conn.execute(f"UPDATE claims SET {s} WHERE id=?",list(updates.values())+[cid])
    conn.commit()
    m=row(conn.execute("SELECT full_name FROM members WHERE id=?",(cl["member_id"],)))
    push_notif(msg,f"Member: {m['full_name'] if m else 'Unknown'}",cl["branch_id"],"claim","high" if action=="reject" else "normal")
    log_audit(d.get("user_id"),None,None,cl["branch_id"],msg,"claims","127.0.0.1","Success",cid)
    return {"ok":True,"message":msg}

def add_claim_doc(d):
    doc_id=gid()
    conn.execute("INSERT INTO claim_documents(id,claim_id,filename,file_type,file_size) VALUES(?,?,?,?,?)",
        (doc_id,d["claim_id"],d["filename"],d.get("file_type","application/pdf"),d.get("file_size",0)))
    conn.commit()
    return {"ok":True,"doc_id":doc_id}

# ── HOSPITALS ─────────────────────────────────────────────────────────────────
def get_hospitals(d):
    search=d.get("search",""); status=d.get("status","")
    conds=[]; args=[]
    if search: conds.append("(h.name LIKE ? OR h.county LIKE ?)"); args+=[f"%{search}%"]*2
    if status: conds.append("h.status=?"); args.append(status)
    w="WHERE "+" AND ".join(conds) if conds else ""
    hs=rows(conn.execute(f"""
        SELECT h.*,
            (SELECT COUNT(*) FROM claims c WHERE c.hospital_id=h.id AND strftime('%Y-%m',c.date_filed)=strftime('%Y-%m','now')) as claims_month,
            (SELECT COALESCE(SUM(c.paid_amount),0) FROM claims c WHERE c.hospital_id=h.id) as total_paid_ytd
        FROM hospitals h {w} ORDER BY claims_month DESC
    """,args))
    return {"hospitals":hs}

def add_hospital(d):
    if not d.get("name") or not d.get("type") or not d.get("county"): return {"error":"name, type, county required"}
    count=conn.execute("SELECT COUNT(*) FROM hospitals").fetchone()[0]
    code=f"CIC-H-{str(count+1).zfill(3)}"
    hid=gid()
    conn.execute("""INSERT INTO hospitals(id,provider_code,name,type,county,address,contact_person,phone,email,credit_limit,status,nhif_accredited)
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?)""",
        (hid,code,d["name"],d["type"],d["county"],d.get("address"),d.get("contact_person"),
         d.get("phone"),d.get("email"),float(d.get("credit_limit",0)),d.get("status","Active"),1 if d.get("nhif_accredited") else 0))
    conn.commit()
    h=row(conn.execute("SELECT * FROM hospitals WHERE id=?",(hid,)))
    log_audit(d.get("user_id"),None,None,None,f"Hospital added: {d['name']}","hospitals","127.0.0.1","Success",hid)
    return {"ok":True,"hospital":h}

def update_hospital(d):
    hid=d.get("id")
    fields=["name","type","county","address","contact_person","phone","email","credit_limit","status"]
    updates={k:d[k] for k in fields if k in d}
    if not updates: return {"error":"Nothing to update"}
    s=", ".join(f"{k}=?" for k in updates)
    conn.execute(f"UPDATE hospitals SET {s} WHERE id=?",list(updates.values())+[hid])
    conn.commit()
    return {"ok":True}

# ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
def get_notifications(d):
    uid=d.get("user_id"); bid=d.get("branch_id")
    conds=["(user_id=? OR user_id IS NULL)"]; args=[uid]
    if bid: conds.append("(branch_id=? OR branch_id IS NULL)"); args.append(bid)
    w="WHERE "+" AND ".join(conds)
    ns=rows(conn.execute(f"SELECT * FROM notifications {w} ORDER BY created_at DESC LIMIT 30",args))
    unread=conn.execute(f"SELECT COUNT(*) FROM notifications {w} AND is_read=0",args).fetchone()[0]
    return {"notifications":ns,"unread":unread}

def mark_notif_read(d):
    conn.execute("UPDATE notifications SET is_read=1 WHERE id=?",(d.get("id"),))
    conn.commit(); return {"ok":True}

def mark_all_read(d):
    uid=d.get("user_id")
    conn.execute("UPDATE notifications SET is_read=1 WHERE user_id=? OR user_id IS NULL",(uid,))
    conn.commit(); return {"ok":True}

def push_notif(title,msg,branch_id=None,typ="info",priority="normal"):
    conn.execute("INSERT INTO notifications(id,branch_id,type,title,message,priority) VALUES(?,?,?,?,?,?)",
        (gid(),branch_id,typ,title,msg,priority))
    conn.commit()

# ── AUDIT LOGS ────────────────────────────────────────────────────────────────
def get_audit_logs(d):
    page=int(d.get("page",1)); pp=int(d.get("per_page",30))
    resource=d.get("resource",""); search=d.get("search","")
    conds=[]; args=[]
    if resource: conds.append("resource=?"); args.append(resource)
    if search: conds.append("(action LIKE ? OR user_email LIKE ?)"); args+=[f"%{search}%"]*2
    w="WHERE "+" AND ".join(conds) if conds else ""
    all_rows=rows(conn.execute(f"SELECT * FROM audit_logs {w} ORDER BY created_at DESC",args))
    total=len(all_rows); start=(page-1)*pp
    return {"data":all_rows[start:start+pp],"total":total,"page":page,"per_page":pp,"pages":(total+pp-1)//pp}

def log_audit(uid,email,role,bid,action,resource,ip,status,details):
    conn.execute("""INSERT INTO audit_logs(id,user_id,user_email,role,branch_id,action,resource,ip_address,status,details)
        VALUES(?,?,?,?,?,?,?,?,?,?)""",(gid(),uid,email,role,bid,action,resource,ip,status,details))
    conn.commit()

# ── ALERTS ────────────────────────────────────────────────────────────────────
def get_alerts(d):
    bid=d.get("branch_id")
    w="AND branch_id=?" if bid else ""; a=(bid,) if bid else ()
    missed=rows(conn.execute(f"""SELECT pr.*,m.full_name as member_name,m.phone,p.policy_no,b.name as branch_name
        FROM premiums pr JOIN members m ON pr.member_id=m.id JOIN policies p ON pr.policy_id=p.id
        JOIN branches b ON pr.branch_id=b.id WHERE pr.status='Missed' {w} ORDER BY pr.due_date DESC""",a))
    expiring=rows(conn.execute(f"""SELECT p.*,m.full_name as member_name,m.phone,b.name as branch_name,
        CAST(julianday(p.expiry_date)-julianday('now') AS INTEGER) as days_left
        FROM policies p JOIN members m ON p.member_id=m.id JOIN branches b ON p.branch_id=b.id
        WHERE p.status='Active' AND date(p.expiry_date) BETWEEN date('now') AND date('now','+60 days') {w}
        ORDER BY days_left""",a))
    return {"missed_premiums":missed,"expiring_policies":expiring}

# ── USERS ─────────────────────────────────────────────────────────────────────
def get_users(d):
    u=rows(conn.execute("SELECT id,staff_id,full_name,email,role,branch_id,is_active,last_login,created_at FROM users ORDER BY created_at"))
    return {"users":u}

def create_user(d):
    required=["full_name","email","password","role","branch_id"]
    for f in required:
        if not d.get(f): return {"error":f"{f} is required"}
    existing=conn.execute("SELECT id FROM users WHERE email=?",(d["email"].lower(),)).fetchone()
    if existing: return {"error":"Email already registered"}
    uid=gid()
    count=conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
    sid=f"FS-{d['role'].upper()[:3]}-{str(count+1).zfill(3)}"
    conn.execute("INSERT INTO users(id,staff_id,full_name,email,password_hash,role,branch_id) VALUES(?,?,?,?,?,?,?)",
        (uid,sid,d["full_name"],d["email"].lower(),hp(d["password"]),d["role"],d["branch_id"]))
    conn.commit()
    return {"ok":True,"user_id":uid,"staff_id":sid}

def get_stats_summary(d):
    return {
        "total_branches": conn.execute("SELECT COUNT(*) FROM branches").fetchone()[0],
        "total_users":    conn.execute("SELECT COUNT(*) FROM users WHERE is_active=1").fetchone()[0],
        "active_sessions_today": conn.execute("SELECT COUNT(DISTINCT user_id) FROM audit_logs WHERE action LIKE '%login%' AND status='Success' AND date(created_at)=date('now')").fetchone()[0],
        "failed_logins_today":   conn.execute("SELECT COUNT(*) FROM audit_logs WHERE action LIKE '%[Ff]ailed%' AND date(created_at)=date('now')").fetchone()[0],
    }

# ── MAIN LOOP ─────────────────────────────────────────────────────────────────
if __name__=="__main__":
    init_schema()
    seed()
    sys.stdout.write(json.dumps({"ready":True})+"\n")
    sys.stdout.flush()

    for line in sys.stdin:
        line=line.strip()
        if not line: continue
        try:
            cmd=json.loads(line)
            req_id=cmd.get("_id")
            result=handle(cmd)
            if req_id: result["_id"]=req_id
            sys.stdout.write(json.dumps(result)+"\n")
            sys.stdout.flush()
        except Exception as e:
            sys.stdout.write(json.dumps({"error":str(e)})+"\n")
            sys.stdout.flush()
