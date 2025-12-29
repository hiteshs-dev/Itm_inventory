// ================= CONFIG =================
const API_URL = "/.netlify/functions/data";

// ================= HELPERS =================
function showAlert(msg) {
  alert(msg);
}

async function apiRequest(method, body = null, path = "") {
  const res = await fetch(API_URL + path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : null
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }

  return res.json();
}

// ================= LOAD DASHBOARD TABLE =================
async function loadInventory() {
  try {
    const data = await apiRequest("GET");
    const tbody = document.getElementById("dashTable");

    if (!tbody) return;

    tbody.innerHTML = "";

    data.slice(0, 20).forEach(item => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${item.name || ""}</td>
        <td>${item.role || ""}</td>
        <td>${item.asset_desc || ""}</td>
        <td>${item.asset_id || ""}</td>
        <td>
          <button onclick="deleteItem('${item.asset_id}')">Delete</button>
        </td>
      `;
      tbody.appendChild(row);
    });

    updateStats(data);
    updateRecent(data);

  } catch (err) {
    showAlert("Error loading data:\n" + err.message);
  }
}

// ================= STATS =================
function updateStats(data) {
  document.getElementById("statTotal").innerText = data.length;
  document.getElementById("statStudents").innerText =
    data.filter(d => d.role === "student").length;
  document.getElementById("statEmployees").innerText =
    data.filter(d => d.role === "employee").length;
}

// ================= RECENT ACTIVITY =================
function updateRecent(data) {
  const recent = document.getElementById("recentList");
  if (!recent) return;

  recent.innerHTML = "";
  data.slice(0, 5).forEach(d => {
    const div = document.createElement("div");
    div.textContent = `${d.name} → ${d.asset_desc}`;
    recent.appendChild(div);
  });
}

// ================= SAVE DATA =================
async function saveData(event) {
  event.preventDefault();

  const role = document.getElementById("role").value;

  const payload = {
    date: new Date().toISOString().split("T")[0],
    role,
    title: document.getElementById("title").value,
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    id: role === "student"
      ? document.getElementById("rollNo").value
      : document.getElementById("empId").value,
    batchOrDept: role === "student"
      ? document.getElementById("batch").value
      : document.getElementById("dept").value,
    location: document.getElementById("location").value,
    designation: document.getElementById("designation").value,
    assetDesc: document.getElementById("assetDesc").value,
    asset_type: document.getElementById("asset_type").value,
    assetId: document.getElementById("assetId").value,
    brand: document.getElementById("brand").value,
    model: document.getElementById("model").value,
    ram: document.getElementById("ram").value,
    hdd: document.getElementById("hdd").value,
    processor: document.getElementById("processor").value,
    purchase_date: document.getElementById("purchase_date").value,
    remarks: document.getElementById("remarks").value
  };

  try {
    await apiRequest("POST", payload);
    showAlert("Entry saved successfully");
    document.getElementById("assetForm").reset();
    loadInventory();
  } catch (err) {
    showAlert("Error saving data:\n" + err.message);
  }
}

// ================= DELETE =================
async function deleteItem(assetId) {
  if (!confirm("Delete this record?")) return;

  try {
    await apiRequest("DELETE", null, "/" + assetId);
    loadInventory();
  } catch (err) {
    showAlert("Error deleting:\n" + err.message);
  }
}

// ================= DOWNLOAD =================
function downloadSpecific(role, batch) {
  let url = `${API_URL}/download?role=${role}`;
  if (batch !== "all") url += `&batch=${batch}`;
  window.location.href = url;
}

// ================= ROLE TOGGLE =================
function toggleFields() {
  const role = document.getElementById("role").value;
  document.getElementById("studentFields").style.display =
    role === "student" ? "block" : "none";
  document.getElementById("empFields").style.display =
    role === "employee" ? "block" : "none";
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("assetForm")
    .addEventListener("submit", saveData);

  toggleFields();
  loadInventory();
});
