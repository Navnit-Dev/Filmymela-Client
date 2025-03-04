class Admin {
    constructor() {
        this.InitializeElements();
        this.ActivateListeners();
    }

    InitializeElements() {
        this.UsernameElement = document.getElementById("username");
        this.PasswordElement = document.getElementById("password");
        this.AdminLoginForm = document.getElementById("adminLoginForm");
    }

    ActivateListeners() {
       

        // Admin login form submission
        this.AdminLoginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            if (this.UsernameElement.value && this.PasswordElement.value) {
                const LoginData = {
                    username: this.UsernameElement.value.trim(),
                    password: this.PasswordElement.value.trim(),
                };

                try {
                    const response = await fetch("http://localhost:8001/api/auth/login", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(LoginData),
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        alert(`Login Failed: ${data.message || "Invalid credentials"}`);
                    } else {
                        alert("Login Successfully");
                        window.location.href = "admin-dashboard.html";
                        console.log(response,data)
                    }
                    console.log(data)
                } catch (error) {
                    console.error("Login Error:", error);
                    alert("An error occurred. Please try again later.");
                }
            } else {
                alert("Please enter username and password.");
            }
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new Admin();
});
