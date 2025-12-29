import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.NETLIFY_DATABASE_URL);

export async function handler(event) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers };
  }

  const path = event.path;
  const id = path.split("/").pop();

  try {
    // ---------- DOWNLOAD CSV ----------
    if (event.httpMethod === "GET" && path.endsWith("/download")) {
      const role = event.queryStringParameters?.role;
      const batch = event.queryStringParameters?.batch;

      let rows;
      if (role === "employee") {
        rows = await sql`SELECT * FROM inventory WHERE role='employee' ORDER BY date DESC`;
      } else if (role === "student" && batch) {
        rows = await sql`
          SELECT * FROM inventory 
          WHERE role='student' AND batch_or_dept=${batch}
          ORDER BY date DESC
        `;
      } else {
        rows = await sql`SELECT * FROM inventory ORDER BY date DESC`;
      }

      let csv =
        "Sr No,Date,Role,Title,Name,Email,ID,Location,Dept/Batch,Designation,Asset Type,Asset Desc,Brand,Model,RAM,HDD,Processor,Purchase Date,Remarks\n";

      rows.forEach((r, i) => {
        csv += `${i + 1},${r.date},${r.role},${r.title || ""},${r.name || ""},${r.email || ""},${r.id || ""},${r.location || ""},${r.batch_or_dept || ""},${r.designation || ""},${r.asset_type || ""},${r.asset_desc || ""},${r.brand || ""},${r.model || ""},${r.ram || ""},${r.hdd || ""},${r.processor || ""},${r.purchase_date || ""},${r.remarks || ""}\n`;
      });

      return {
        statusCode: 200,
        headers: {
          ...headers,
          "Content-Type": "text/csv",
          "Content-Disposition": "attachment; filename=inventory.csv"
        },
        body: csv
      };
    }

    // ---------- GET ----------
    if (event.httpMethod === "GET") {
      const rows = await sql`SELECT * FROM inventory ORDER BY date DESC`;
      return { statusCode: 200, headers, body: JSON.stringify(rows) };
    }

    // ---------- POST ----------
    if (event.httpMethod === "POST") {
      const b = JSON.parse(event.body);
      await sql`
        INSERT INTO inventory
        (date, role, title, name, email, id, batch_or_dept, location, designation,
         asset_desc, asset_type, asset_id, brand, model, ram, hdd, processor, purchase_date, remarks)
        VALUES
        (${b.date}, ${b.role}, ${b.title}, ${b.name}, ${b.email},
         ${b.id}, ${b.batchOrDept}, ${b.location}, ${b.designation},
         ${b.assetDesc}, ${b.asset_type}, ${b.assetId},
         ${b.brand}, ${b.model}, ${b.ram}, ${b.hdd}, ${b.processor},
         ${b.purchase_date}, ${b.remarks})
      `;
      return { statusCode: 201, headers, body: JSON.stringify({ ok: true }) };
    }

    // ---------- PUT ----------
    if (event.httpMethod === "PUT") {
      const b = JSON.parse(event.body);
      await sql`DELETE FROM inventory WHERE asset_id=${id}`;
      await sql`
        INSERT INTO inventory
        (date, role, title, name, email, id, batch_or_dept, location, designation,
         asset_desc, asset_type, asset_id, brand, model, ram, hdd, processor, purchase_date, remarks)
        VALUES
        (${b.date}, ${b.role}, ${b.title}, ${b.name}, ${b.email},
         ${b.id}, ${b.batchOrDept}, ${b.location}, ${b.designation},
         ${b.assetDesc}, ${b.asset_type}, ${b.assetId},
         ${b.brand}, ${b.model}, ${b.ram}, ${b.hdd}, ${b.processor},
         ${b.purchase_date}, ${b.remarks})
      `;
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    // ---------- DELETE ----------
    if (event.httpMethod === "DELETE") {
      await sql`DELETE FROM inventory WHERE asset_id=${id}`;
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 405, headers, body: "Method Not Allowed" };

  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
}
