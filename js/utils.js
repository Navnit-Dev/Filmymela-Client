// Theme Management
const THEME_KEY = 'filmcity-theme';
const NOTIFICATION_KEY = 'filmcity-notifications';

export const ThemeManager = {
    isDark: false,

    init() {
        const savedTheme = localStorage.getItem(THEME_KEY);
        if (savedTheme === 'dark') {
            this.enableDarkMode();
        }
        this.setupThemeToggle();
    },

    setupThemeToggle() {
        const toggle = document.getElementById('theme-toggle');
        if (toggle) {
            toggle.addEventListener('click', () => this.toggleTheme());
            // Update toggle state
            toggle.checked = this.isDark;
        }
    },

    toggleTheme() {
        this.isDark ? this.enableLightMode() : this.enableDarkMode();
    },

    enableDarkMode() {
        document.documentElement.classList.add('dark-mode');
        localStorage.setItem(THEME_KEY, 'dark');
        this.isDark = true;
    },

    enableLightMode() {
        document.documentElement.classList.remove('dark-mode');
        localStorage.setItem(THEME_KEY, 'light');
        this.isDark = false;
    }
};

// Notification System
export const NotificationManager = {
    socket: null,
    notifications: [],

    init(socket) {
        this.socket = socket;
        this.loadNotifications();
        this.setupSocketListeners();
        this.setupNotificationUI();
    },

    loadNotifications() {
        const saved = localStorage.getItem(NOTIFICATION_KEY);
        this.notifications = saved ? JSON.parse(saved) : [];
        this.updateNotificationBadge();
    },

    setupSocketListeners() {
        if (!this.socket) return;

        this.socket.on('new-notification', (notification) => {
            this.addNotification(notification);
        });
    },

    setupNotificationUI() {
        const bell = document.querySelector('.notification-bell');
        const panel = document.querySelector('.notification-panel');
        
        if (bell && panel) {
            bell.addEventListener('click', () => {
                panel.classList.toggle('show');
                this.markAllAsRead();
            });
        }
    },

    addNotification(notification) {
        const newNotification = {
            id: Date.now(),
            ...notification,
            read: false,
            timestamp: new Date().toISOString()
        };

        this.notifications.unshift(newNotification);
        this.notifications = this.notifications.slice(0, 50); // Keep last 50 notifications
        this.saveNotifications();
        this.showNotificationPopup(newNotification);
        this.updateNotificationBadge();
    },

    showNotificationPopup(notification) {
        const popup = document.createElement('div');
        popup.className = 'notification-popup';
        popup.innerHTML = `
            <div class="notification-content">
                <h4>${notification.title}</h4>
                <p>${notification.message}</p>
            </div>
        `;

        document.body.appendChild(popup);

        // Animate popup
        gsap.fromTo(popup, 
            { x: 100, opacity: 0 },
            { 
                x: 0, 
                opacity: 1, 
                duration: 0.5,
                onComplete: () => {
                    setTimeout(() => {
                        gsap.to(popup, {
                            x: 100,
                            opacity: 0,
                            duration: 0.5,
                            onComplete: () => popup.remove()
                        });
                    }, 5000);
                }
            }
        );
    },

    markAllAsRead() {
        this.notifications = this.notifications.map(n => ({ ...n, read: true }));
        this.saveNotifications();
        this.updateNotificationBadge();
    },

    updateNotificationBadge() {
        const badge = document.querySelector('.notification-badge');
        if (!badge) return;

        const unreadCount = this.notifications.filter(n => !n.read).length;
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? 'block' : 'none';
    },

    saveNotifications() {
        localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(this.notifications));
        this.renderNotifications();
    },

    renderNotifications() {
        const panel = document.querySelector('.notification-list');
        if (!panel) return;

        panel.innerHTML = this.notifications.map(notification => `
            <div class="notification-item ${notification.read ? 'read' : 'unread'}">
                <h4>${notification.title}</h4>
                <p>${notification.message}</p>
                <small>${new Date(notification.timestamp).toLocaleString()}</small>
            </div>
        `).join('');
    }
};