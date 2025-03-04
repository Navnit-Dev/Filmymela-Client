import { ThemeManager, NotificationManager } from './utils.js';

class ProfileManager {
    constructor() {
        this.profileData = null;
        this.init();
    }

    async init() {
        // Initialize theme and notifications
        ThemeManager.init();
        NotificationManager.init();

        // Check authentication
        this.checkAuth();

        // Initialize UI elements
        this.initializeElements();
        
        // Load profile data
        await this.loadProfileData();

        // Setup event listeners
        this.setupEventListeners();

        // Initialize animations
        this.initializeAnimations();
    }

    initializeElements() {
        // Profile elements
        this.profileName = document.getElementById('ProfileName');
        this.profileEmail = document.getElementById('ProfileMail');
        this.profilePic = document.querySelector('.profile-pic');
        this.profileUpload = document.getElementById('profile-upload');

        // Stats elements
        this.watchlistCount = document.getElementById('watchlistCount');
        this.reviewsCount = document.getElementById('reviewsCount');
        this.downloadsCount = document.getElementById('downloadsCount');

        // Buttons
        this.editProfileBtn = document.getElementById('editProfileBtn');
        this.changePasswordBtn = document.getElementById('changePasswordBtn');
        this.logoutBtn = document.getElementById('logoutBtn');
        this.saveProfileBtn = document.getElementById('saveProfileBtn');
        this.savePasswordBtn = document.getElementById('savePasswordBtn');

        // Modals
        this.editProfileModal = new bootstrap.Modal(document.getElementById('editProfileModal'));
        this.changePasswordModal = new bootstrap.Modal(document.getElementById('changePasswordModal'));
    }

    checkAuth() {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = './UserLogin.html';
            return;
        }
    }

    async loadProfileData() {
        try {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');

            const response = await fetch(`http://localhost:8001/api/auth/user/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load profile data');
            }

            this.profileData = await response.json();
            this.updateUI();
        } catch (error) {
            console.error('Error loading profile:', error);
            toastr.error('Failed to load profile data');
        }
    }

    updateUI() {
        if (!this.profileData) return;

        // Update profile info
        this.profileName.textContent = this.profileData.username;
        this.profileEmail.textContent = this.profileData.email;
        if (this.profileData.profilePic) {
            this.profilePic.src = this.profileData.profilePic;
        }

        // Update stats
        this.watchlistCount.textContent = this.profileData.watchlistCount || 0;
        this.reviewsCount.textContent = this.profileData.reviewsCount || 0;
        this.downloadsCount.textContent = this.profileData.downloadsCount || 0;

        // Remove loading states
        document.querySelectorAll('.loading').forEach(el => el.classList.remove('loading'));
    }

    setupEventListeners() {
        // Profile picture upload
        this.profileUpload.addEventListener('change', this.handleProfilePicUpload.bind(this));

        // Edit profile
        this.editProfileBtn.addEventListener('click', () => {
            document.getElementById('editName').value = this.profileData.username;
            document.getElementById('editEmail').value = this.profileData.email;
            this.editProfileModal.show();
        });

        // Save profile changes
        this.saveProfileBtn.addEventListener('click', this.handleProfileUpdate.bind(this));

        // Change password
        this.changePasswordBtn.addEventListener('click', () => {
            this.changePasswordModal.show();
        });

        // Save password changes
        this.savePasswordBtn.addEventListener('click', this.handlePasswordChange.bind(this));

        // Logout
        this.logoutBtn.addEventListener('click', this.handleLogout.bind(this));
    }

    async handleProfilePicUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const formData = new FormData();
            formData.append('profilePic', file);

            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8001/api/auth/update-profile-pic', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) throw new Error('Failed to upload profile picture');

            const data = await response.json();
            this.profilePic.src = data.profilePicUrl;
            toastr.success('Profile picture updated successfully');
        } catch (error) {
            console.error('Error uploading profile picture:', error);
            toastr.error('Failed to upload profile picture');
        }
    }

    async handleProfileUpdate() {
        try {
            const newName = document.getElementById('editName').value;
            const newEmail = document.getElementById('editEmail').value;

            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8001/api/auth/update-profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    username: newName,
                    email: newEmail
                })
            });

            if (!response.ok) throw new Error('Failed to update profile');

            const data = await response.json();
            this.profileData = data;
            this.updateUI();
            this.editProfileModal.hide();
            toastr.success('Profile updated successfully');
        } catch (error) {
            console.error('Error updating profile:', error);
            toastr.error('Failed to update profile');
        }
    }

    async handlePasswordChange() {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (newPassword !== confirmPassword) {
            toastr.error('New passwords do not match');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8001/api/auth/change-password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword
                })
            });

            if (!response.ok) throw new Error('Failed to change password');

            this.changePasswordModal.hide();
            document.getElementById('changePasswordForm').reset();
            toastr.success('Password changed successfully');
        } catch (error) {
            console.error('Error changing password:', error);
            toastr.error('Failed to change password');
        }
    }

    handleLogout() {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('username');
        window.location.href = './UserLogin.html';
    }

    initializeAnimations() {
        // Animate stats on scroll
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    gsap.from(entry.target, {
                        textContent: 0,
                        duration: 1,
                        ease: "power1.out",
                        snap: { textContent: 1 },
                        stagger: {
                            each: 0.1,
                            onUpdate: function() {
                                this.targets()[0].textContent = Math.ceil(this.targets()[0].textContent);
                            },
                        }
                    });
                    observer.unobserve(entry.target);
                }
            });
        });

        // Observe stat numbers
        document.querySelectorAll('.stat-item p').forEach(stat => {
            observer.observe(stat);
        });

        // Animate profile actions
        gsap.from('.action-btn', {
            opacity: 0,
            y: 20,
            duration: 0.5,
            stagger: 0.1,
            ease: "power2.out"
        });
    }
}

// Initialize profile manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ProfileManager();
});
