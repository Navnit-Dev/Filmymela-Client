// Default admin credentials
if (!localStorage.getItem('adminCredentials')) {
    localStorage.setItem('adminCredentials', JSON.stringify({
        username: 'admin',
        password: 'admin123'
    }));
}

document.getElementById('adminLoginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
    
    // Get stored credentials
    const storedCredentials = JSON.parse(localStorage.getItem('adminCredentials'));
    
    if (username === storedCredentials.username && password === storedCredentials.password) {
        // Store session
        localStorage.setItem('adminSession', 'true');
        
        // Redirect to admin dashboard
        window.location.href = 'admin-dashboard.html';
    } else {
        errorMessage.textContent = 'Invalid credentials';
        errorMessage.style.display = 'block';
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 3000);
    }
});
