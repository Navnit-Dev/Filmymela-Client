class MovieDetails {
    constructor() {
        this.movieId = new URLSearchParams(window.location.search).get('id');
        this.currentScreenshotIndex = 0;
        this.screenshots = [];
        
        if (!this.movieId) {
            window.location.href = '/';
            return;
        }
        
        this.initializeElements();
        this.setupEventListeners();
        this.loadMovieDetails();
    }

    initializeElements() {
        // Movie details elements
        this.titleElement = document.getElementById('movieTitle');
        this.posterElement = document.getElementById('moviePoster');
        this.yearElement = document.getElementById('movieYear');
        this.categoryElement = document.getElementById('movieCategory');
        this.ratingElement = document.getElementById('movieRating');
        this.descriptionElement = document.getElementById('movieDescription');
        this.downloadLinksElement = document.getElementById('downloadLinks');
        this.screenshotsGrid = document.getElementById('screenshotsGrid');
        this.categoryGrid = document.getElementById('movieMeta');
        this.watchOnline = document.getElementById('WatchOnline');
        
        // Modal elements
        this.modal = document.getElementById('screenshotModal');
        this.modalImage = document.getElementById('modalImage');
        this.closeModal = document.querySelector('.close-modal');
        this.prevButton = document.querySelector('.modal-nav.prev');
        this.nextButton = document.querySelector('.modal-nav.next');
    }

    setupEventListeners() {
        // Modal controls
        this.closeModal.addEventListener('click', () => this.hideModal());
        this.prevButton.addEventListener('click', () => this.showPreviousScreenshot());
        this.nextButton.addEventListener('click', () => this.showNextScreenshot());
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hideModal();
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (this.modal.style.display === 'block') {
                if (e.key === 'Escape') this.hideModal();
                if (e.key === 'ArrowLeft') this.showPreviousScreenshot();
                if (e.key === 'ArrowRight') this.showNextScreenshot();
            }
        });
    }

    async loadMovieDetails() {
        try {
            const response = await fetch(`https://filmymela2.onrender.com/api/movies/${this.movieId}`);
            if (!response.ok) {
                throw new Error('Movie not found');
            }
            
            const movie = await response.json();
            this.updateUI(movie);
        } catch (error) {
            console.error('Error loading movie details:', error);
            this.showError('Failed to load movie details');
        }
    }

    updateUI(movie) {
        // Update backdrop
        document.querySelector('.movie-backdrop').style.backgroundImage = `url(${movie.posterUrl})`;
        
        // Update basic info
        document.title = `${movie.title} - FilmMela`;
        this.titleElement.textContent = movie.title;
        this.posterElement.src = movie.posterUrl;
        this.posterElement.alt = movie.title;
        
        if (movie.year) {
            this.yearElement.textContent = movie.year;
        }
        
        if (movie.category) {
            movie.category.forEach(category => {
                const span = document.createElement('span')
                span.id = "movieCategory"
                span.innerText = category
                this.categoryGrid.appendChild(span)
            })
            this.categoryElement.textContent = movie.category;
        }
        
        if (movie.rating) {
            this.ratingElement.innerHTML = `⭐ ${movie.rating}`;
        }
        
        if (movie.description) {
            this.descriptionElement.textContent = movie.description;
        }

        if (movie.watch) {
            this.watchOnline.setAttribute('href',`./test.html?id=${movie._id}`)
            this.watchOnline.setAttribute('data-id',movie._id)
        }else{
            this.watchOnline.style.display = 'none'
        }

        //Watch Online EventListener

        this.watchOnline.addEventListener('click',()=>{
            if(!movie.watch){
                this.watchOnline.style.display = 'none'
            }
            window.location.href = `./test.html?id=${movie._id}`
        })

        // Update download links
        this.downloadLinksElement.innerHTML = '';
        Object.entries(movie.downloadLinks || {}).forEach(([quality, link]) => {
            const button = document.createElement('a');
            button.href = link;
            button.className = 'download-button';
            button.target = '_blank';
            button.rel = 'noopener noreferrer';
            button.innerHTML = `
                <i class="fas fa-download"></i>
                 ${quality}
            `;
            this.downloadLinksElement.appendChild(button);
        });

        // Update screenshots
        this.screenshots = movie.screenshots || [];
        this.screenshotsGrid.innerHTML = '';
        this.screenshots.forEach((url, index) => {
            const screenshot = document.createElement('div');
            screenshot.className = 'screenshot-item';
            screenshot.innerHTML = `
                <img src="${url}" alt="Screenshot ${index + 1}">
            `;
            screenshot.addEventListener('click', () => this.showScreenshot(index));
            this.screenshotsGrid.appendChild(screenshot);
        });

        
    }

    showScreenshot(index) {
        this.currentScreenshotIndex = index;
        this.modalImage.src = this.screenshots[index];
        this.modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        this.updateModalNavigation();
    }

    hideModal() {
        this.modal.style.display = 'none';
        document.body.style.overflow = '';
    }

    showPreviousScreenshot() {
        if (this.currentScreenshotIndex > 0) {
            this.showScreenshot(this.currentScreenshotIndex - 1);
        }
    }

    showNextScreenshot() {
        if (this.currentScreenshotIndex < this.screenshots.length - 1) {
            this.showScreenshot(this.currentScreenshotIndex + 1);
        }
    }

    updateModalNavigation() {
        this.prevButton.style.display = this.currentScreenshotIndex > 0 ? 'block' : 'none';
        this.nextButton.style.display = 
            this.currentScreenshotIndex < this.screenshots.length - 1 ? 'block' : 'none';
    }

    showError(message) {
        alert(message);
    }
}

// Initialize the movie details page
document.addEventListener('DOMContentLoaded', () => {
    new MovieDetails();
});
