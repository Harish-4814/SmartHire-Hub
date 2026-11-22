
const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
        message.textContent = "Logging in...";

        const response = await fetch(
            "http://localhost:5000/api/auth/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            message.textContent = data.message || "Login failed.";
            return;
        }

        // Save login information
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        message.textContent = "Login successful!";

        // Check first login
        setTimeout(() => {

            if (data.user.mustChangePassword === true) {
                window.location.href = "change-password.html";
            } else {
                window.location.href = "dashboard.html";
            }

        }, 500);

    } catch (error) {
        console.error("Login Error:", error);
        message.textContent = "Unable to connect to server.";
    }
});
