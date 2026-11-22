const adminLoginForm = document.getElementById("adminLoginForm");
const adminMessage = document.getElementById("adminMessage");

adminLoginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("adminEmail").value.trim();
    const password = document.getElementById("adminPassword").value;

    try {
        console.log("Sending admin login request...");

        const response = await fetch("http://localhost:5000/api/admin/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        console.log("Server response:", response.status);

        const data = await response.json();

        console.log("Response data:", data);

        if (response.ok) {
            localStorage.setItem("adminToken", data.token);
            localStorage.setItem("admin", JSON.stringify(data.admin));

            adminMessage.textContent = "Login successful!";

            setTimeout(() => {
                window.location.href = "admin-dashboard.html";
            }, 500);

        } else {
            adminMessage.textContent = data.message || "Admin login failed.";
        }

    } catch (error) {
        console.error("Admin login error:", error);
        adminMessage.textContent = "Unable to connect to server.";
    }
});