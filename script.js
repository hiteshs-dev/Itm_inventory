// ================= CONFIG =================
const API_URL = "/.netlify/functions/data";

// ================= HELPERS =================
function showAlert(message) {
  alert(message);
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

  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return res.json();
  }

  return res.text();
}

// ================= LOAD DATA =================
async function loadInventory() {
  try {
    const data = await apiRequest("GET");
    const tbody = document.querySelector("#inventoryTable tbody");
    tbody.innerHTML = "";

    data.forEach((item, index) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${item.date || ""}</td>
        <td>${item.role || ""}</td>
        <td>${item.name || ""}</td>
        <td>${item.asset_type || ""}</td>
        <td>${item.asset_desc || ""}</td>
        <td>${item.asset_id || ""}</td>
        <td>
          <button onclick="deleteItem('${item.asset_id}')">Delete</button>
        </td>
      `;

      tbody.appendChild(row);
    });
  } catch (err) {
    showAlert("Error loading data:\n" + err.message);
  }
}

// ================= SAVE DATA =================
async function saveData(event) {
  event.preventDefault();

  const form = event.target;

  const data = {
    date: form.date.value,
    role: form.role.value,
    title: form.title.value,
    name: form.name.value,
    email: form.email.value,
    id: form.id.value,
    batchOrDept: form.batchOrDept.value,
    location: form.location.value,
    designation: form.designation.value,
    assetDesc: form.assetDesc.value,
    asset_type: form.assetType.value,
    assetId: form.assetId.value,
    brand: form.brand.value,
    model: form.model.value,
    ram: form.ram.value,
    hdd: form.hdd.value,
    processor: form.processor.value,
    purchase_date: form.purchaseDate.value,
    remarks: form.remarks.value
  };

  try {
    await apiRequest("POST", data);
    showAlert("Data saved successfully");
    form.reset();
    loadInventory();
  } catch (err) {
    showAlert("Error saving data:\n" + err.message);
  }
}

// ================= DELETE =================
async function deleteItem(assetId) {
  if (!confirm("Are you sure you want to delete this item?")) return;

  try {
    await apiRequest("DELETE", null, "/" + assetId);
    showAlert("Item deleted");
    loadInventory();
  } catch (err) {
    showAlert("Error deleting data:\n" + err.message);
  }
}

// ================= DOWNLOAD CSV =================
function downloadCSV() {
  window.location.href = API_URL + "/download";
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("inventoryForm");
  if (form) {
    form.addEventListener("submit", saveData);
  }
  loadInventory();
});
