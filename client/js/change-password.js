
const form = document.getElementById("changePasswordForm");
const message = document.getElementById("message");

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const currentPassword =
        document.getElementById("currentPassword").value;

    const newPassword =
        document.getElementById("newPassword").value;

    const confirmPassword =
        document.getElementById("confirmPassword").value;

    const token = localStorage.getItem("token");

    if (!token) {
        message.textContent = "Please login again.";
        return;
    }

    if (newPassword !== confirmPassword) {
        message.textContent = "New passwords do not match.";
        return;
    }

    if (newPassword.length < 8) {
        message.textContent = "Password must be at least 8 characters.";
        return;
    }

    try {
        const response = await fetch(
            "http://localhost:5000/api/auth/change-password",
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword
                })
            }
        );

        const data = await response.json();

        if (response.ok) {
            message.textContent = "Password changed successfully!";

            const user = JSON.parse(
                localStorage.getItem("user") || "{}"
            );

            user.mustChangePassword = false;
            localStorage.setItem("user", JSON.stringify(user));

            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 1000);

        } else {
            message.textContent = data.message;
        }

    } catch (error) {
        console.error(error);
        message.textContent = "Unable to connect to server.";
    }
});
