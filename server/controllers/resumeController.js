
const fs = require("fs");
const User = require("../models/User");
const { PDFParse } = require("pdf-parse");
const mammoth = require("mammoth");

const knownSkills = [
    "Python", "C", "C++", "Java", "JavaScript",
    "HTML", "CSS", "React", "Node.js", "Express.js",
    "MongoDB", "MySQL", "SQL", "PHP", "R", "Git",
    "GitHub", "Machine Learning", "Data Science",
    "Data Analytics", "Artificial Intelligence",
    "Flask", "Django", "TensorFlow", "Pandas",
    "NumPy", "Scikit-learn", "Power BI", "Excel"
];

const extractCGPA = (text) => {
    const match = text.match(
        /\bCGPA\b\s*[:\-]?\s*(\d{1,2}(?:\.\d+)?)\s*(?:\/\s*10)?/i
    );

    if (match) {
        const cgpa = parseFloat(match[1]);
        if (cgpa >= 0 && cgpa <= 10) return cgpa;
    }

    return 0;
};

const extractSkills = (text) => {
    const lowerText = text.toLowerCase();

    return knownSkills.filter(skill =>
        lowerText.includes(skill.toLowerCase())
    );
};

const calculateATS = (text, skills) => {
    const lowerText = text.toLowerCase();
    let score = 0;
    const suggestions = [];

    if (text.length > 500) score += 15;
    else suggestions.push("Add more relevant resume content.");

    if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(text))
        score += 10;
    else suggestions.push("Add a valid email address.");

    if (/\b\d{10}\b/.test(text)) score += 5;
    else suggestions.push("Add your contact number.");

    const sections = [
        ["education", "Education"],
        ["skills", "Skills"],
        ["project", "Projects"],
        ["experience", "Experience"],
        ["certification", "Certifications"]
    ];

    sections.forEach(([keyword, label]) => {
        if (lowerText.includes(keyword)) score += 10;
        else suggestions.push("Consider adding a " + label + " section.");
    });

    if (skills.length >= 5) score += 20;
    else if (skills.length >= 3) {
        score += 15;
        suggestions.push("Add more relevant technical skills.");
    } else {
        score += skills.length * 3;
        suggestions.push("Include more relevant technical skills.");
    }

    if (/\b(developed|created|designed|implemented|managed|built)\b/i.test(text))
        score += 10;
    else suggestions.push("Use action words to describe your work.");

    if (/\b\d+%|\b\d+\+|\b\d+\s*(users|projects|years)\b/i.test(text))
        score += 10;
    else suggestions.push("Include measurable achievements.");

    return {
        score: Math.min(score, 100),
        suggestions
    };
};

const uploadResume = async (req, res) => {
    let parser = null;

    try {
        if (!req.file) {
            return res.status(400).json({
                message: "Please upload a PDF or DOCX resume."
            });
        }

        const filePath = req.file.path;
        let extractedText = "";

        if (req.file.mimetype === "application/pdf") {
            const buffer = fs.readFileSync(filePath);

            parser = new PDFParse({
                data: new Uint8Array(buffer)
            });

            const pdfData = await parser.getText();
            extractedText = pdfData.text;
        }
        else if (
            req.file.mimetype ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
            const result = await mammoth.extractRawText({
                path: filePath
            });

            extractedText = result.value;
        }
        else {
            return res.status(400).json({
                message: "Only PDF and DOCX files are supported."
            });
        }

        if (!extractedText || !extractedText.trim()) {
            return res.status(400).json({
                message: "Could not extract text from resume."
            });
        }

        const cgpa = extractCGPA(extractedText);
        const skills = extractSkills(extractedText);
        const ats = calculateATS(extractedText, skills);

        const user = await User.findByIdAndUpdate(
            req.user.userId,
            {
                cgpa,
                skills,
                resumeFileName: req.file.originalname,
                resumePath: req.file.filename,
                resumeUploadedAt: new Date()
            },
            {
                returnDocument: "after"
            }
        ).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "Student account not found."
            });
        }

        return res.json({
            message: "Resume uploaded and analyzed successfully!",
            extracted: {
                cgpa,
                skills,
                atsScore: ats.score,
                suggestions: ats.suggestions
            },
            user
        });

    } catch (error) {
        console.error("Resume Processing Error:", error);

        return res.status(500).json({
            message: "Error processing resume.",
            error: error.message
        });

    } finally {
        if (parser) {
            try {
                await parser.destroy();
            } catch (error) {
                console.error("PDF cleanup error:", error);
            }
        }

        // Do not delete the uploaded resume.
        // It must remain available for the teacher.
    }
};

module.exports = {
    uploadResume
};
