// Class Notes App JavaScript

document.addEventListener('DOMContentLoaded', function() {
    console.log('Class Notes App loaded successfully!');
    
    // Apply dynamic colors from data attributes
    applyDynamicColors();
    
    // Add smooth scrolling to navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Add active class to clicked nav item
            navLinks.forEach(nl => nl.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Enhanced hover effects for cards
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            if (this.classList.contains('class-card')) {
                this.style.transform = 'translateY(-5px)';
                this.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
            } else {
                this.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            if (this.classList.contains('class-card')) {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            } else {
                this.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            }
        });
    });
    
    // Color preset functionality
    const colorPresets = document.querySelectorAll('.color-preset');
    const colorInput = document.getElementById('color');
    
    if (colorPresets.length > 0 && colorInput) {
        colorPresets.forEach(preset => {
            preset.addEventListener('click', function() {
                const color = this.getAttribute('data-color');
                colorInput.value = color;
                
                // Remove active class from all presets
                colorPresets.forEach(p => p.classList.remove('active'));
                // Add active class to clicked preset
                this.classList.add('active');
            });
        });
        
        // Set initial active preset based on current color value
        const currentColor = colorInput.value;
        colorPresets.forEach(preset => {
            if (preset.getAttribute('data-color') === currentColor) {
                preset.classList.add('active');
            }
        });
    }
    
    // Search functionality enhancements
    const searchForm = document.querySelector('form[action*="search"]');
    const searchInput = document.querySelector('input[name="q"]');
    
    if (searchInput) {
        // Add search suggestions or history (localStorage)
        const searchHistory = JSON.parse(localStorage.getItem('search_history') || '[]');
        
        searchInput.addEventListener('focus', function() {
            // Could add dropdown with search history here
        });
        
        if (searchForm) {
            searchForm.addEventListener('submit', function() {
                const query = searchInput.value.trim();
                if (query && !searchHistory.includes(query)) {
                    searchHistory.unshift(query);
                    // Keep only last 10 searches
                    if (searchHistory.length > 10) {
                        searchHistory.pop();
                    }
                    localStorage.setItem('search_history', JSON.stringify(searchHistory));
                }
            });
        }
    }
    
    // Auto-save indication
    window.showAutoSaveStatus = function(saved = true) {
        const existingIndicator = document.querySelector('.autosave-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }
        
        const indicator = document.createElement('div');
        indicator.className = 'autosave-indicator position-fixed';
        indicator.style.top = '70px';
        indicator.style.right = '20px';
        indicator.style.zIndex = '9999';
        indicator.style.padding = '8px 12px';
        indicator.style.borderRadius = '4px';
        indicator.style.fontSize = '0.85rem';
        
        if (saved) {
            indicator.className += ' bg-success text-white';
            indicator.innerHTML = '<i class="fas fa-check"></i> Draft saved';
        } else {
            indicator.className += ' bg-warning text-dark';
            indicator.innerHTML = '<i class="fas fa-clock"></i> Saving...';
        }
        
        document.body.appendChild(indicator);
        
        setTimeout(() => {
            indicator.remove();
        }, 2000);
    };
    
    // Enhanced notification function
    window.showNotification = function(message, type = 'info', duration = 5000) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        alertDiv.style.top = '20px';
        alertDiv.style.right = '20px';
        alertDiv.style.zIndex = '9999';
        alertDiv.style.minWidth = '300px';
        alertDiv.innerHTML = `
            <div class="d-flex align-items-center">
                <div class="me-2">
                    ${type === 'success' ? '<i class="fas fa-check-circle"></i>' : 
                      type === 'error' || type === 'danger' ? '<i class="fas fa-exclamation-circle"></i>' : 
                      type === 'warning' ? '<i class="fas fa-exclamation-triangle"></i>' : 
                      '<i class="fas fa-info-circle"></i>'}
                </div>
                <div class="flex-grow-1">${message}</div>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        document.body.appendChild(alertDiv);
        
        // Auto dismiss
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, duration);
    };
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + S to save (in forms)
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            const form = document.querySelector('form#noteForm');
            if (form) {
                e.preventDefault();
                form.submit();
            }
        }
        
        // Ctrl/Cmd + K to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.querySelector('input[name="q"]');
            if (searchInput) {
                searchInput.focus();
            }
        }
    });
    
    // Confirmation for destructive actions (if any are added later)
    window.confirmAction = function(message, callback) {
        if (confirm(message)) {
            callback();
        }
    };
    
    // Initialize tooltips if Bootstrap is available
    if (typeof bootstrap !== 'undefined') {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
    
    // Theme management (for future dark mode)
    window.toggleTheme = function() {
        const currentTheme = localStorage.getItem('theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        showNotification(`Switched to ${newTheme} mode`, 'info');
    };
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Performance: Lazy load images if any
    const images = document.querySelectorAll('img[data-src]');
    if (images.length > 0 && 'IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
    
    console.log('All app features initialized successfully!');
});

// Function to apply dynamic colors from data attributes
function applyDynamicColors() {
    // Apply class border colors and theme individual cards
    const classBorderElements = document.querySelectorAll('[data-class-color]');
    classBorderElements.forEach(element => {
        const color = element.getAttribute('data-class-color');
        if (color) {
            // Set CSS custom property for the class color on the element itself
            element.style.setProperty('--class-color', color);
            
            // Apply theming to individual class cards on dashboard
            if (element.classList.contains('class-card')) {
                applyClassCardTheming(element, color);
            }
            
            // Apply complete theming if this is a class-themed page
            const themedContainer = element.closest('.class-themed');
            if (themedContainer) {
                applyCompleteClassTheme(color);
            }
        }
    });
    
    // Apply background colors for color indicators
    const bgColorElements = document.querySelectorAll('[data-bg-color]');
    bgColorElements.forEach(element => {
        const color = element.getAttribute('data-bg-color');
        if (color) {
            element.style.backgroundColor = color;
        }
    });
    
    // Apply school card colors
    const schoolCards = document.querySelectorAll('[data-school-color]');
    schoolCards.forEach(element => {
        const color = element.getAttribute('data-school-color');
        if (color) {
            element.style.backgroundColor = color;
        }
    });
}

// Function to apply theming to individual class cards
function applyClassCardTheming(cardElement, color) {
    // Apply color to primary buttons within this card
    const primaryButtons = cardElement.querySelectorAll('.btn-primary');
    primaryButtons.forEach(btn => {
        btn.style.backgroundColor = color;
        btn.style.borderColor = color;
    });
    
    // Apply color to outline primary buttons within this card
    const outlinePrimaryButtons = cardElement.querySelectorAll('.btn-outline-primary');
    outlinePrimaryButtons.forEach(btn => {
        btn.style.color = color;
        btn.style.borderColor = color;
        
        // Set up hover effects
        btn.addEventListener('mouseenter', function() {
            this.style.backgroundColor = color;
            this.style.color = 'white';
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.backgroundColor = 'transparent';
            this.style.color = color;
        });
    });
    
    // Apply color to any text-primary elements within this card
    const primaryText = cardElement.querySelectorAll('.text-primary');
    primaryText.forEach(text => {
        text.style.color = color;
    });
}

// Function to apply complete class theming
function applyCompleteClassTheme(color) {
    // Calculate lighter and darker shades
    const lightColor = lightenColor(color, 20);
    const darkColor = darkenColor(color, 20);
    
    // Apply navbar theming
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        navbar.style.backgroundColor = color;
    }
    
    // Apply to all primary buttons
    const primaryButtons = document.querySelectorAll('.class-themed .btn-primary');
    primaryButtons.forEach(btn => {
        btn.style.backgroundColor = color;
        btn.style.borderColor = color;
    });
    
    // Apply to outline primary buttons
    const outlinePrimaryButtons = document.querySelectorAll('.class-themed .btn-outline-primary');
    outlinePrimaryButtons.forEach(btn => {
        btn.style.color = color;
        btn.style.borderColor = color;
        
        btn.addEventListener('mouseenter', function() {
            this.style.backgroundColor = color;
            this.style.color = 'white';
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.backgroundColor = 'transparent';
            this.style.color = color;
        });
    });
    
    // Apply to text-primary elements
    const primaryText = document.querySelectorAll('.class-themed .text-primary');
    primaryText.forEach(text => {
        text.style.color = color;
    });
    
    // Apply to card headers and accents
    const cardHeaders = document.querySelectorAll('.class-themed .card-header');
    cardHeaders.forEach(header => {
        header.style.borderBottomColor = lightColor;
    });
}

// Helper function to lighten a color
function lightenColor(color, percent) {
    const num = parseInt(color.replace("#",""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

// Helper function to darken a color
function darkenColor(color, percent) {
    const num = parseInt(color.replace("#",""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    return "#" + (0x1000000 + (R > 255 ? 255 : R < 0 ? 0 : R) * 0x10000 +
        (G > 255 ? 255 : G < 0 ? 0 : G) * 0x100 +
        (B > 255 ? 255 : B < 0 ? 0 : B)).toString(16).slice(1);
}

// Confirmation dialogs for delete actions
function confirmDelete(message) {
    return confirm(message);
}

function confirmClassDelete(className) {
    return confirmDelete(`Are you sure you want to delete the class "${className}" and ALL its notes? This action cannot be undone.`);
}

function confirmNoteDelete(noteTitle) {
    return confirmDelete(`Are you sure you want to delete the note "${noteTitle}"? This action cannot be undone.`);
}

function confirmArchive(className) {
    return confirm(`Are you sure you want to archive the class "${className}"? It will be moved to archived classes but can be restored later.`);
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        confirmDelete,
        confirmClassDelete,
        confirmNoteDelete,
        confirmArchive
    };
}
