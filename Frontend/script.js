const API_URL = "https://itm-inventory-api.onrender.com";

function login() {
  if (username.value === "admin" && password.value === "unix@2026") {
    localStorage.setItem("login", "true");
    loginBox.classList.add("hidden");
    app.classList.remove("hidden");
    loadData();
  } else {
    loginError.textContent = "Invalid credentials";
  }
}

function logout() {
  localStorage.clear();
  location.reload();
}

if (localStorage.getItem("login")) {
  loginBox.classList.add("hidden");
  app.classList.remove("hidden");
  loadData();
}

assetForm.onsubmit = async e => {
  e.preventDefault();

  await fetch(API_URL + "/assets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: name.value,
      role: role.value,
      asset: asset.value,
      serial: serial.value
    })
  });

  assetForm.reset();
  loadData();
};

async function loadData() {
  const res = await fetch(API_URL + "/assets");
  const data = await res.json();
  table.innerHTML = "";

  data.forEach(d => {
    table.innerHTML += `
      <tr>
        <td>${d.name}</td>
        <td>${d.role}</td>
        <td>${d.asset}</td>
        <td>${d.serial}</td>
        <td><button onclick="del('${d.id}')">Delete</button></td>
      </tr>
    `;
  });
}

async function del(id) {
  await fetch(API_URL + "/assets/" + id, { method: "DELETE" });
  loadData();
}
