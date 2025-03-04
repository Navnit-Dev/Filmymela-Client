import { NotificationManager } from './utils.js';

// DOM Elements
const formTitle = document.getElementById("form-title");
const authForm = document.getElementById("auth-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const usernameInput = document.getElementById("username");
const nameGroup = document.getElementById("name-group");
const submitBtn = document.getElementById("submit-btn");
const submitBtnText = submitBtn.querySelector("span");
const submitBtnSpinner = submitBtn.querySelector(".spinner");
const toggleText = document.getElementById("toggle-text");
const togglePasswordBtn = document.getElementById("togglePassword");

let isSignUp = false;

// Configure toastr
toastr.options = {
    closeButton: true,
    progressBar: true,
    positionClass: "toast-top-right",
    timeOut: 3000
};

// Toggle password visibility
togglePasswordBtn.addEventListener("click", () => {
    const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);
    togglePasswordBtn.classList.toggle("fa-eye");
    togglePasswordBtn.classList.toggle("fa-eye-slash");
});

function toggleForm() {
    isSignUp = !isSignUp;
    if (isSignUp) {
        formTitle.innerText = "Sign Up";
        submitBtnText.innerText = "Sign Up";
        nameGroup.style.display = "block";
        toggleText.innerHTML = `Already have an account? <span id="toggle-btn" style="cursor:pointer; color:red;">Sign In</span>`;
    } else {
        formTitle.innerText = "Sign In";
        submitBtnText.innerText = "Sign In";
        nameGroup.style.display = "none";
        toggleText.innerHTML = `New to FilmyMela? <span id="toggle-btn" style="cursor:pointer; color:red;">Sign Up</span>`;
    }

    // Re-add event listener to dynamically created toggle button
    document.getElementById("toggle-btn").addEventListener("click", toggleForm);
}

// Add event listener on page load
document.getElementById("toggle-btn").addEventListener("click", toggleForm);

// Form validation
function validateForm() {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const username = usernameInput.value.trim();

    if (!email || !password) {
        throw new Error("Please fill in all required fields");
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        throw new Error("Please enter a valid email address");
    }

    if (password.length < 6) {
        throw new Error("Password must be at least 6 characters long");
    }

    if (isSignUp && !username) {
        throw new Error("Please enter your full name");
    }
}

// Show/hide loading state
function setLoading(loading) {
    submitBtn.disabled = loading;
    submitBtnText.style.display = loading ? "none" : "block";
    submitBtnSpinner.style.display = loading ? "block" : "none";
}

authForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
        validateForm();

        const userData = {
            email: emailInput.value.trim(),
            password: passwordInput.value.trim(),
            ...(isSignUp && { username: usernameInput.value.trim() })
        };

        setLoading(true);

        let route = isSignUp ? "signup" : "signin";
        const response = await fetch(`http://localhost:8001/api/auth/${route}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Authentication failed. Please try again.");
        }

        // Store user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.id);
        localStorage.setItem('userEmail', userData.email);
        if (data.username) {
            localStorage.setItem('username', data.username);
        }

        // Show success notification
        toastr.success(
            isSignUp ? "Account created successfully!" : "Welcome back!",
            "Success"
        );

        // Redirect after a short delay
        setTimeout(() => {
            window.location.href = "./";
        }, 1000);

    } catch (error) {
        console.error("Error:", error);
        toastr.error(error.message, "Error");
    } finally {
        setLoading(false);
    }
});

// Handle password reset (if implemented)
const forgotPassword = async (email) => {
    try {
        const response = await fetch('http://localhost:8001/api/auth/reset-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Password reset failed');
        }

        toastr.success('Password reset instructions sent to your email', 'Success');
    } catch (error) {
        toastr.error(error.message, 'Error');
    }
};

// Initialize notifications
document.addEventListener('DOMContentLoaded', () => {
    NotificationManager.init();
});
