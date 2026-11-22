
const adminToken = localStorage.getItem("adminToken");

// Check admin authentication
if (!adminToken) {
    window.location.href = "admin-login.html";
}

// Elements
const logoutBtn = document.getElementById("logoutBtn");
const uploadBtn = document.getElementById("uploadBtn");
const viewStudentsBtn = document.getElementById("viewStudentsBtn");


// =========================
// LOGOUT
// =========================

logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");

    window.location.href = "admin-login.html";
});


// =========================
// UPLOAD STUDENTS
// =========================

uploadBtn.addEventListener("click", async () => {

    const fileInput = document.getElementById("studentFile");
    const message = document.getElementById("uploadMessage");

    if (!fileInput.files.length) {
        message.textContent = "Please select an Excel file.";
        return;
    }

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    try {
        message.textContent = "Uploading...";

        const response = await fetch(
            "http://localhost:5000/api/admin/upload-students",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${adminToken}`
                },
                body: formData
            }
        );

        const data = await response.json();

        if (!response.ok) {
            message.textContent = data.message || "Upload failed.";
            return;
        }

        message.textContent =
            data.message || "Students uploaded successfully!";

        fileInput.value = "";

    } catch (error) {
        console.error("Upload Error:", error);
        message.textContent = "Unable to connect to server.";
    }
});


// =========================
// VIEW STUDENTS
// =========================

async function viewStudents() {

    try {
        const response = await fetch(
            "http://localhost:5000/api/admin/students",
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${adminToken}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Unable to load students.");
            return;
        }

        localStorage.setItem(
            "studentsData",
            JSON.stringify(data.students)
        );

        window.location.href = "students.html";

    } catch (error) {
        console.error("View Students Error:", error);
        alert("Unable to connect to server.");
    }
}

viewStudentsBtn.addEventListener("click", viewStudents);
