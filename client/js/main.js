
class MovieApp {
    constructor() {
        this.movies = [];
        this.currentIndustry = 'all';
        
        this.initializeElements();
        this.setupEventListeners();
        this.loadMovies();
        this.setupNavbarScroll();
    }

    initializeElements() {
        // Movie containers
        this.latestMoviesContainer = document.getElementById('latestMovies');
        this.trendingMoviesContainer = document.getElementById('trendingMovies');
        this.allMoviesContainer = document.getElementById('allMovies');
        this.allResultContainer = document.getElementById('allResults');
        
        // Search elements
        this.searchBtn = document.getElementById('searchBtn');
        this.searchOverlay = document.querySelector('.search-overlay');
        this.searchInput = document.getElementById('searchInput');
        this.closeSearchBtn = document.getElementById('closeSearch');
        
        // Mobile menu elements
        this.mobileMenuToggle = document.getElementById('mobileMenuToggle');
        this.navLinks = document.getElementById('navLinks');
        
        // Featured movie elements
        this.featuredMovie = document.querySelector('.featured-movie');
        this.featuredTitle = document.getElementById('featuredTitle');
        this.featuredDescription = document.getElementById('featuredDescription');
        this.featuredYear = document.getElementById('featuredYear');
        this.featuredCategory = document.getElementById('featuredCategories');
        this.featuredRating = document.getElementById('featuredRating');
        this.featuredLink = document.getElementById('featuredLink');
    }

    setupEventListeners() {
        // Mobile menu toggle
        this.mobileMenuToggle.addEventListener('click', () => {
            this.navLinks.classList.toggle('show');
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.navLinks.contains(e.target) && !this.mobileMenuToggle.contains(e.target)) {
                this.navLinks.classList.remove('show');
            }
        });

        // Industry filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelector('.filter-btn.active').classList.remove('active');
                btn.classList.add('active');
                this.currentIndustry = btn.dataset.industry;
                this.filterMovies();
                // Close mobile menu after filter selection on mobile
                if (window.innerWidth <= 768) {
                    this.navLinks.classList.remove('show');
                }
            });
        });

        // Search functionality
        this.searchBtn.addEventListener('click', () => this.toggleSearch(true));
        this.closeSearchBtn.addEventListener('click', () => this.toggleSearch(false));
        this.searchInput.addEventListener('input', () => this.handleSearch());

        // Close search on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.searchOverlay.style.display === 'block') {
                this.toggleSearch(false);
            }
        });
    }

    setupNavbarScroll() {
        window.addEventListener('scroll', () => {
            const navbar = document.querySelector('.navbar');
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    async loadMovies() {
        try {
            const response = await fetch('https://filmymela2.onrender.com/api/movies');
            this.movies = await response.json();
            
            // Set a random movie as featured
            this.setFeaturedMovie();
            
            // Update movie sections
            this.updateMovieSections();
        } catch (error) {
            console.error('Error loading movies:', error);
        }
    }

    setFeaturedMovie() {
        const randomMovie = this.movies[Math.floor(Math.random() * this.movies.length)];
        if (!randomMovie) return;

        this.featuredMovie.style.backgroundImage = `url(${randomMovie.posterUrl})`;
        this.featuredTitle.textContent = randomMovie.title;
        this.featuredDescription.textContent = randomMovie.description || 'No description available';
        this.featuredYear.textContent = randomMovie.year || '';
        // this.featuredCategory.textContent = randomMovie.category || '';

        randomMovie.category.forEach(category => {
            const span = document.createElement('span')
            span.id = "featuredCategorys"
            span.innerText = category
            this.featuredCategory.appendChild(span)
        })
        this.featuredRating.textContent = randomMovie.rating ? `⭐ ${randomMovie.rating}` : '';
        this.featuredLink.href = `./movie.html?id=${randomMovie._id}`;
    }

    updateMovieSections() {
        // Get latest movies (last 5)
        const latestMovies = [...this.movies]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(-5);

        // // Get trending movies (random 10 with rating > 7)
        // const trendingMovies = [...this.movies]
        //     .filter(movie => movie.rating > 7)
        //     .sort(() => Math.random() - 0.5)
        //     .slice(0, 10);

        // Update containers
        this.latestMoviesContainer.innerHTML = this.createMovieSlider(latestMovies);
        this.updateAllMovies();
    }

    updateAllMovies() {
        this.allMoviesContainer.innerHTML = this.createMovieGrid(this.movies)
        const filteredMovies = this.filterMoviesByIndustry(this.movies);
        this.allMoviesContainer.innerHTML = this.createMovieGrid(filteredMovies.reverse());
    }

    filterMoviesByIndustry(movies) {
        if (this.currentIndustry === 'all') return movies ;
        
        const industryMap = {
            'hollywood': movie => movie.category.includes('hollywood'),
            'bollywood': movie => movie.category.includes('bollywood'),
            'webseries': movie => movie.category.includes('webseries'),
            'south': movie => movie.category.includes('south'),
            'action': movie => movie.category.includes('action'),
            'comedy': movie => movie.category.includes('comedy'),
            'drama': movie => movie.category.includes('drama'),
            'thriller': movie => movie.category.includes('thriller'),
            'horrar': movie => movie.category.includes('horrar'),
            'scifi': movie => movie.category.includes('scifi'),
            'romance': movie => movie.category.includes('romance'),
        };

        return movies.filter(industryMap[this.currentIndustry] || (() => true));
    }

    createMovieCard(movie) {
        return `
            <div class="movie-card" onclick="window.location.href='./movie.html?id=${movie._id}'">
                <img src="${movie.posterUrl}" alt="${movie.title}">
                <div class="movie-info">
                    <h3>${movie.title}</h3>
                    <div class="movie-meta">
                        ${movie.year ? `<span>${movie.year}</span>` : ''}
                        ${movie.rating ? `<span>⭐ ${movie.rating}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    createMovieSlider(movies) {
        return movies.map(movie => this.createMovieCard(movie)).join('');
    }

    createMovieGrid(movies) {
        return movies.map(movie => this.createMovieCard(movie)).join('');
    }

    filterMovies() {
        this.updateAllMovies();
    }

    toggleSearch(show) {
        this.searchOverlay.style.display = show ? 'block' : 'none';
        
        if (show) {
            this.searchInput.focus();
            
        } else {
            this.searchInput.value = '';
            this.handleSearch();

        }
    }

    handleSearch() {
        
        const searchTerm = this.searchInput.value.toLowerCase();
        // Check for admin login trigger
        if (searchTerm === 'admin_login') {
            window.location.href = 'admin-login.html';
            return;
        }
        
        const filteredMovies = this.movies.filter(movie => 
            movie.title.toLowerCase().includes(searchTerm) ||
            movie.description.toLowerCase().includes(searchTerm)
        );


        if(filteredMovies.length > 0){
            this.allResultContainer.innerHTML = this.createMovieGrid(filteredMovies);

            if(searchTerm == ''){
                this.allResultContainer.innerHTML = ''
            }
        }else{
            this.allResultContainer.innerHTML = `<h3 styel="color:#fff;"> Nothing Found ! Sorry </h3>`
        }
       
        this.allMoviesContainer.innerHTML = this.createMovieGrid()
    }
}

// Initialize the movie app
document.addEventListener('DOMContentLoaded', () => {
    new MovieApp();
    
});
