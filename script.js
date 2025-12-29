// ================= CONFIG =================
const API_URL = "/.netlify/functions/data";
const LOGIN_USER = "admin";
const LOGIN_PASS = "unix@2026";

// ================= DOM ELEMENTS =================
const loginModal = document.getElementById("loginModal");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const navTabs = document.getElementById("navTabs");
const mainApp = document.getElementById("mainApp");

const assetForm = document.getElementById("assetForm");
const dashTable = document.getElementById("dashTable");

const role = document.getElementById("role");
const studentFields = document.getElementById("studentFields");
const empFields = document.getElementById("empFields");

const statTotal = document.getElementById("statTotal");
const statStudents = document.getElementById("statStudents");
const statEmployees = document.getElementById("statEmployees");

const recentList = document.getElementById("recentList");

// ================= LOGIN =================
function checkLogin() {
  const loggedIn = localStorage.getItem("loggedIn") === "true";

  loginModal.style.display = loggedIn ? "none" : "flex";
  navTabs.style.display = loggedIn ? "flex" : "none";
  mainApp.style.display = loggedIn ? "block" : "none";

  if (loggedIn) loadInventory();
}

loginForm.addEventListener("submit", e => {
  e.preventDefault();

  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;

  if (user === LOGIN_USER && pass === LOGIN_PASS) {
    localStorage.setItem("loggedIn", "true");
    loginError.style.display = "none";
    checkLogin();
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

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }

  return res.json();
}

// ================= ROLE TOGGLE =================
function toggleFields() {
  const r = role.value;
  studentFields.style.display = r === "student" ? "block" : "none";
  empFields.style.display = r === "employee" ? "block" : "none";
}

// ================= SAVE DATA =================
assetForm.addEventListener("submit", async e => {
  e.preventDefault();

  try {
    const r = role.value;

    const payload = {
      date: new Date().toISOString().split("T")[0],
      role: r,
      title: document.getElementById("title").value,
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      id: r === "student"
        ? document.getElementById("rollNo").value
        : document.getElementById("empId").value,
      batchOrDept: r === "student"
        ? document.getElementById("batch").value
        : document.getElementById("dept").value,
      location: r === "student"
        ? document.getElementById("studentLocation").value
        : document.getElementById("empLocation").value,
      designation: document.getElementById("designation")?.value || "",
      assetDesc: document.getElementById("assetDesc").value,
      asset_type: document.getElementById("asset_type").value,
      assetId: document.getElementById("assetId").value,
      brand: document.getElementById("brand")?.value || "",
      model: document.getElementById("model")?.value || "",
      ram: document.getElementById("ram")?.value || "",
      hdd: document.getElementById("hdd")?.value || "",
      processor: document.getElementById("processor")?.value || "",
      purchase_date: document.getElementById("purchase_date").value,
      remarks: document.getElementById("remarks").value
    };

    await apiRequest("POST", payload);
    alert("Entry saved successfully");

    assetForm.reset();
    toggleFields();
    loadInventory();

  } catch (err) {
    alert("Error saving data:\n" + err.message);
  }
});

// ================= LOAD DATA =================
async function loadInventory() {
  try {
    const data = await apiRequest("GET");

    dashTable.innerHTML = "";

    statTotal.innerText = data.length;
    statStudents.innerText = data.filter(d => d.role === "student").length;
    statEmployees.innerText = data.filter(d => d.role === "employee").length;

    recentList.innerHTML = "";

    data.slice(0, 5).forEach(d => {
      const div = document.createElement("div");
      div.textContent = `${d.name} → ${d.asset_desc}`;
      recentList.appendChild(div);
    });

    data.slice(0, 20).forEach(d => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${d.name || ""}</td>
        <td>${d.role || ""}</td>
        <td>${d.asset_desc || ""}</td>
        <td>${d.asset_id || ""}</td>
        <td>
          <button onclick="deleteItem('${d.asset_id}')">Delete</button>
        </td>
      `;
      dashTable.appendChild(tr);
    });

  } catch (err) {
    alert("Error loading data:\n" + err.message);
  }
}

// ================= DELETE =================
async function deleteItem(id) {
  if (!confirm("Delete this record?")) return;

  try {
    await apiRequest("DELETE", null, "/" + id);
    loadInventory();
  } catch (err) {
    alert("Delete failed:\n" + err.message);
  }
}

// ================= DOWNLOAD =================
function downloadSpecific(role, batch) {
  let url = `${API_URL}/download?role=${role}`;
  if (batch !== "all") url += `&batch=${batch}`;
  window.location.href = url;
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
  checkLogin();
  toggleFields();
});
