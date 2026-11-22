
const form = document.getElementById("resumeForm");
const message = document.getElementById("message");
const results = document.getElementById("results");
const uploadBtn = document.getElementById("uploadBtn");

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const file = document.getElementById("resume").files[0];
    const token = localStorage.getItem("token");

    if (!token) {
        message.textContent = "Please login again.";
        return;
    }

    if (!file) {
        message.textContent = "Please select your resume.";
        return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    uploadBtn.disabled = true;
    uploadBtn.textContent = "Analyzing...";
    message.textContent = "";
    results.style.display = "none";

    try {
        const response = await fetch(
            "http://localhost:5000/api/resume/upload",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Resume upload failed");
        }

        const extracted = data.extracted;

        // Display ATS Score
        document.getElementById("atsScore").textContent =
            extracted.atsScore ?? 0;

        // Update progress bar
        document.getElementById("progressFill").style.width =
            (extracted.atsScore ?? 0) + "%";

        // Score message
        let scoreMessage = "";

        if (extracted.atsScore >= 80) {
            scoreMessage = "Excellent resume compatibility!";
        } else if (extracted.atsScore >= 60) {
            scoreMessage = "Good resume. Some improvements are possible.";
        } else {
            scoreMessage = "Your resume needs improvement.";
        }

        document.getElementById("scoreMessage").textContent =
            scoreMessage;

        // Display CGPA
        document.getElementById("cgpa").textContent =
            extracted.cgpa > 0 ? extracted.cgpa : "Not found";

        // Display Skills
        const skillsDiv = document.getElementById("skills");
        skillsDiv.innerHTML = "";

        if (extracted.skills && extracted.skills.length > 0) {
            extracted.skills.forEach(skill => {
                const span = document.createElement("span");
                span.className = "skill";
                span.textContent = skill;
                skillsDiv.appendChild(span);
            });
        } else {
            skillsDiv.textContent = "No recognized skills found.";
        }

        // Display Suggestions
        const suggestionsDiv = document.getElementById("suggestions");
        suggestionsDiv.innerHTML = "";

        if (extracted.suggestions && extracted.suggestions.length > 0) {
            extracted.suggestions.forEach(item => {
                const div = document.createElement("div");
                div.className = "suggestion";
                div.textContent = item;
                suggestionsDiv.appendChild(div);
            });
        } else {
            suggestionsDiv.textContent =
                "No major suggestions from these basic checks.";
        }

        // Update local student profile
        const user = JSON.parse(
            localStorage.getItem("user") || "{}"
        );

        user.cgpa = extracted.cgpa;
        user.skills = extracted.skills;

        localStorage.setItem("user", JSON.stringify(user));

        results.style.display = "block";
        message.textContent = "Resume analyzed successfully!";

    } catch (error) {
        console.error("Resume Error:", error);
        message.textContent = error.message;

    } finally {
        uploadBtn.disabled = false;
        uploadBtn.textContent = "Upload & Analyze";
    }
});
