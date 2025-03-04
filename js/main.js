import { ThemeManager, NotificationManager } from './utils.js';
import { io } from 'https://cdn.socket.io/4.7.4/socket.io.esm.min.js';

class App {
    constructor() {
        this.socket = null;
        this.init();
    }

    async init() {
        // Initialize theme
        ThemeManager.init();

        // Initialize WebSocket connection
        this.initializeWebSocket();

        // Initialize animations
        this.initializeAnimations();

        // Initialize infinite scroll for movies
        this.initializeInfiniteScroll();

        // Initialize movie hover effects
        this.initializeMovieHoverEffects();
    }

    initializeWebSocket() {
        this.socket = io('http://localhost:8001', {
            transports: ['websocket'],
            autoConnect: true
        });

        this.socket.on('connect', () => {
            console.log('Connected to WebSocket server');
            
            // Initialize notification system after socket connection
            NotificationManager.init(this.socket);

            // Join appropriate rooms based on user role
            const userRole = localStorage.getItem('userRole');
            if (userRole === 'admin') {
                this.socket.emit('join-room', 'admin-room');
            }
        });

        this.socket.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error);
        });
    }

    initializeAnimations() {
        // Navbar animations
        gsap.from('.navbar', {
            y: -100,
            opacity: 0,
            duration: 1,
            ease: 'power3.out'
        });

        // Search bar animation
        const searchBar = document.querySelector('.search-bar');
        if (searchBar) {
            searchBar.addEventListener('focus', () => {
                gsap.to(searchBar, {
                    width: '300px',
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });

            searchBar.addEventListener('blur', () => {
                gsap.to(searchBar, {
                    width: '200px',
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });
        }

        // Trending movies auto-scroll
        this.initializeTrendingScroll();
    }

    initializeTrendingScroll() {
        const trendingSection = document.querySelector('.trending-movies');
        if (trendingSection) {
            const movies = trendingSection.children;
            let currentIndex = 0;

            setInterval(() => {
                gsap.to(movies[currentIndex], {
                    x: -100,
                    opacity: 0,
                    duration: 0.5,
                    onComplete: () => {
                        movies[currentIndex].style.display = 'none';
                        currentIndex = (currentIndex + 1) % movies.length;
                        movies[currentIndex].style.display = 'block';
                        gsap.fromTo(movies[currentIndex],
                            { x: 100, opacity: 0 },
                            { x: 0, opacity: 1, duration: 0.5 }
                        );
                    }
                });
            }, 5000);
        }
    }

    initializeInfiniteScroll() {
        const movieGrid = document.querySelector('.movie-grid');
        if (!movieGrid) return;

        let page = 1;
        let loading = false;

        const loadMoreMovies = async () => {
            if (loading) return;
            loading = true;

            try {
                const response = await fetch(`/api/movies?page=${page}`);
                const data = await response.json();

                if (data.movies.length > 0) {
                    data.movies.forEach(movie => {
                        const movieElement = this.createMovieElement(movie);
                        movieGrid.appendChild(movieElement);
                        
                        // Animate new movies
                        gsap.from(movieElement, {
                            y: 50,
                            opacity: 0,
                            duration: 0.5,
                            ease: 'power2.out'
                        });
                    });
                    page++;
                }
            } catch (error) {
                console.error('Error loading more movies:', error);
            } finally {
                loading = false;
            }
        };

        // Intersection Observer for infinite scroll
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !loading) {
                loadMoreMovies();
            }
        }, { threshold: 0.1 });

        // Observe the last movie element
        const observerTarget = document.createElement('div');
        observerTarget.className = 'observer-target';
        movieGrid.appendChild(observerTarget);
        observer.observe(observerTarget);
    }

    createMovieElement(movie) {
        const div = document.createElement('div');
        div.className = 'movie-card';
        div.innerHTML = `
            <img src="${movie.poster}" alt="${movie.title}" loading="lazy">
            <div class="movie-info">
                <h3>${movie.title}</h3>
                <p>${movie.year}</p>
            </div>
            <div class="movie-hover">
                <button class="watch-btn">Watch Now</button>
                <button class="watchlist-btn">Add to Watchlist</button>
            </div>
        `;

        // Add click handlers
        div.querySelector('.watch-btn').addEventListener('click', () => {
            window.location.href = `/movie.html?id=${movie._id}`;
        });

        div.querySelector('.watchlist-btn').addEventListener('click', async () => {
            try {
                const response = await fetch('/api/watchlist/add', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ movieId: movie._id })
                });

                if (response.ok) {
                    NotificationManager.addNotification({
                        title: 'Success',
                        message: 'Movie added to watchlist!'
                    });
                }
            } catch (error) {
                console.error('Error adding to watchlist:', error);
            }
        });

        return div;
    }

    initializeMovieHoverEffects() {
        document.addEventListener('mouseover', (e) => {
            const movieCard = e.target.closest('.movie-card');
            if (!movieCard) return;

            const hoverElement = movieCard.querySelector('.movie-hover');
            if (hoverElement) {
                gsap.to(hoverElement, {
                    opacity: 1,
                    y: 0,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            }
        });

        document.addEventListener('mouseout', (e) => {
            const movieCard = e.target.closest('.movie-card');
            if (!movieCard) return;

            const hoverElement = movieCard.querySelector('.movie-hover');
            if (hoverElement) {
                gsap.to(hoverElement, {
                    opacity: 0,
                    y: 20,
                    duration: 0.3,
                    ease: 'power2.in'
                });
            }
        });
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new App();
});
