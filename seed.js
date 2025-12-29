import { neon } from '@neondatabase/serverless';
const sql = neon("postgresql://neondb_owner:npg_2jdoUMF0aipg@ep-rapid-leaf-aeo9gg8s.c-2.us-east-2.aws.neondb/neondb?sslmode=require");

const sampleData = [
    { role: 'employee', name: 'Sagaya Mary Anthony Paul', title: 'Ms.', email: 'sagaya@itm.edu', id: 'E001', dept: 'Executive', loc: 'Admin Block', designation: 'Executive', asset: 'HP Laptop', serial: 'HP-001', brand: 'HP', model: 'EliteBook', ram: '16GB', hdd: '512GB SSD', processor: 'i7 11th Gen', date: '2023-01-15', type: 'Laptop' },
    { role: 'employee', name: 'Sangeeta Trott', title: 'Prof.', email: 'sangeeta@itm.edu', id: 'E002', dept: 'Academics', loc: 'Room 102', designation: 'Professor', asset: 'Lenovo ThinkPad', serial: 'LENO-002', brand: 'Lenovo', model: 'X1 Carbon', ram: '32GB', hdd: '1TB SSD', processor: 'i7 12th Gen', date: '2022-11-01', type: 'Laptop' },
    { role: 'student', name: 'Rahul Sharma', title: 'Mr.', email: 'rahul.s@itm.edu', id: 'S-2026-001', dept: 'Batch 2026', loc: 'Hostel A', designation: '', asset: 'MacBook Air M2', serial: 'MAC-001', brand: 'Apple', model: 'M2 Air', ram: '8GB', hdd: '256GB SSD', processor: 'M2 Chip', date: '2024-06-20', type: 'Laptop' },
    { role: 'student', name: 'Priya Singh', title: 'Ms.', email: 'priya.s@itm.edu', id: 'S-2027-002', dept: 'Batch 2027', loc: 'Home', designation: '', asset: 'Dell G15', serial: 'DELL-003', brand: 'Dell', model: 'G15 5520', ram: '16GB', hdd: '1TB SSD', processor: 'i9 12th Gen', date: '2024-07-10', type: 'Laptop' },
    { role: 'employee', name: 'John Doe', title: 'Mr.', email: 'john@itm.edu', id: 'E003', dept: 'IT Support', loc: 'Lab 3', designation: 'Technician', asset: 'Dell Desktop', serial: 'DESKTOP-001', brand: 'Dell', model: 'Optiplex', ram: '16GB', hdd: '500GB HDD', processor: 'i5 10th Gen', date: '2021-05-10', type: 'Desktop' }
];

async function seedDatabase() {
    console.log("🌱 Seeding database...");
    for (const item of sampleData) {
        try {
            await sql`
                INSERT INTO inventory (date, role, title, name, email, id, batch_or_dept, location, designation, asset_desc, asset_type, asset_id, brand, model, ram, hdd, processor, purchase_date, remarks)
                VALUES (
                    '1/1/2024', 
                    ${item.role}, ${item.title}, ${item.name}, ${item.email}, ${item.id}, ${item.dept}, ${item.loc}, ${item.designation}, ${item.asset}, ${item.type}, 
                    ${item.serial}, ${item.brand}, ${item.model}, ${item.ram}, ${item.hdd}, ${item.processor}, ${item.date}, ''
                )
            `;
            console.log(`✅ Added: ${item.name}`);
        } catch (err) { console.log(`⚠️ Skipped: ${item.name}`); }
    }
    console.log("✨ Seeding Complete!");
    process.exit();
}
seedDatabase();