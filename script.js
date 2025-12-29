// ================= CONFIG =================
const API_URL = "/.netlify/functions/data";
const LOGIN_USER = "admin";
const LOGIN_PASS = "unix@2026";

// ================= LOGIN =================
function checkLogin() {
  const ok = localStorage.getItem("loggedIn") === "true";
  loginModal.style.display = ok ? "none" : "flex";
  navTabs.style.display = ok ? "flex" : "none";
}

loginForm.addEventListener("submit", e => {
  e.preventDefault();
  if (username.value === LOGIN_USER && password.value === LOGIN_PASS) {
    localStorage.setItem("loggedIn", "true");
    loginError.style.display = "none";
    checkLogin();
    loadInventory();
  } else {
    loginError.style.display = "block";
  }
});

function logout() {
  localStorage.removeItem("loggedIn");
  location.reload();
}

// ================= PAGE SWITCH =================
function switchPage(page) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById("page-" + page).classList.add("active");
}

// ================= API =================
async function apiRequest(method, body = null, path = "") {
  const res = await fetch(API_URL + path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : null
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ================= ROLE TOGGLE =================
function toggleFields() {
  const r = role.value;
  studentFields.style.display = r === "student" ? "block" : "none";
  empFields.style.display = r === "employee" ? "block" : "none";
}

// ================= SAVE =================
assetForm.addEventListener("submit", async e => {
  e.preventDefault();
  const r = role.value;

  const payload = {
    date: new Date().toISOString().split("T")[0],
    role: r,
    title: title.value,
    name: name.value,
    email: email.value,
    id: r === "student" ? rollNo.value : empId.value,
    batchOrDept: r === "student" ? batch.value : dept.value,
    location: r === "student" ? studentLocation.value : empLocation.value,
    designation: designation?.value || "",
    assetDesc: assetDesc.value,
    asset_type: asset_type.value,
    assetId: assetId.value,
    brand: brand.value,
    model: model.value,
    ram: ram.value,
    hdd: hdd.value,
    processor: processor.value,
    purchase_date: purchase_date.value,
    remarks: remarks.value
  };

  await apiRequest("POST", payload);
  alert("Saved");
  assetForm.reset();
  toggleFields();
  loadInventory();
});

// ================= LOAD =================
async function loadInventory() {
  const data = await apiRequest("GET");
  dashTable.innerHTML = "";

  statTotal.innerText = data.length;
  statStudents.innerText = data.filter(d => d.role === "student").length;
  statEmployees.innerText = data.filter(d => d.role === "employee").length;

  data.slice(0, 20).forEach(d => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${d.name}</td>
      <td>${d.role}</td>
      <td>${d.asset_desc}</td>
      <td>${d.asset_id}</td>
      <td><button onclick="del('${d.asset_id}')">Delete</button></td>
    `;
    dashTable.appendChild(tr);
  });
}

// ================= DELETE =================
async function del(id) {
  if (!confirm("Delete record?")) return;
  await apiRequest("DELETE", null, "/" + id);
  loadInventory();
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
  checkLogin();
  toggleFields();
});
