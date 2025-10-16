// Main JavaScript for Lost & Found Website

class LostAndFoundApp {
    constructor() {
        this.currentItems = [];
        this.filteredItems = [];
        this.currentItemModal = null;
    }

    async init() {
        this.setupEventListeners();
        this.setupMobileMenu();
        this.setupRealTimeUpdates();
        await this.loadItems();
    }

    setupEventListeners() {

        // Modal functionality
        window.addEventListener('click', this.handleModalClick.bind(this));

        // Contact form
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', this.handleContactSubmit.bind(this));
        }


        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyboard.bind(this));
    }

    setupMobileMenu() {
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');

        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                hamburger.classList.toggle('active');
            });

            // Close menu when clicking a link
            const navLinks = document.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    navMenu.classList.remove('active');
                    hamburger.classList.remove('active');
                });
            });
        }
    }

    // Set up real-time updates
    setupRealTimeUpdates() {
        // Listen for Supabase real-time updates
        window.addEventListener('itemsUpdated', (event) => {
            console.log('Received real-time update:', event.detail);
            // Refresh the items when data changes
            this.loadItems();
        });
    }

    // Load and display items
    async loadItems() {
        const loadingElement = document.getElementById('loading');
        const noItemsElement = document.getElementById('noItems');
        const itemsGrid = document.getElementById('itemsGrid');
        
        try {
            // Show loading state
            if (loadingElement) loadingElement.style.display = 'block';
            if (noItemsElement) noItemsElement.style.display = 'none';
            if (itemsGrid) itemsGrid.innerHTML = '';
            
            // Wait for storage to be ready
            console.log('💡 Waiting for storage to initialize...');
            let attempts = 0;
            const maxAttempts = 100; // 10 seconds
            
            while (!window.storage?.isReady && attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
            
            if (!window.storage?.isReady) {
                console.warn('⚠️ Storage initialization timeout');
                this.showErrorState('Storage system not ready. Please refresh the page.');
                return;
            }
            
            console.log('✅ Storage ready, loading items...');
            
            // Load items from storage
            this.currentItems = await storage.getItems();
            console.log(`📦 Loaded ${this.currentItems.length} items from storage`);
            
            // Show all items (no filtering)
            this.filteredItems = [...this.currentItems];
            
            // Hide loading and render items
            this.hideLoading();
            this.renderItems();
            this.updateSummary();
            
        } catch (error) {
            console.error('Error loading items:', error);
            this.hideLoading();
            this.showErrorState('Failed to load items. Please refresh the page.');
        }
    }

    // Render items in the grid
    renderItems() {
        console.log('🎨 renderItems called with', this.filteredItems.length, 'items');
        
        const itemsGrid = document.getElementById('itemsGrid');
        const itemsCount = document.getElementById('itemsCount');
        const noItems = document.getElementById('noItems');

        if (!itemsGrid) {
            console.log('❌ itemsGrid element not found');
            return;
        }

        // Update count
        if (itemsCount) {
            itemsCount.textContent = this.filteredItems.length;
        }

        // Clear grid
        itemsGrid.innerHTML = '';
        console.log('🧹 Grid cleared');

        if (this.filteredItems.length === 0) {
            if (noItems) noItems.style.display = 'block';
            return;
        }

        if (noItems) noItems.style.display = 'none';

        // Create item cards
        console.log('🃏 Creating item cards...');
        this.filteredItems.forEach((item, index) => {
            console.log(`Creating card ${index + 1}:`, item.title);
            const itemCard = this.createItemCard(item);
            itemsGrid.appendChild(itemCard);
        });
        console.log('✅ All cards created and added to grid');

        // Add animation to cards
        this.animateCards();
        
        // Update summary after rendering
        this.updateSummary();
    }

    // Create individual item card
    createItemCard(item) {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.setAttribute('data-item-id', item.id);
        card.onclick = () => this.showItemModal(item);

        const imageUrl = item.image || 'https://via.placeholder.com/400x300?text=No+Image';
        const formattedDate = storage.formatDate(item.dateReported);

        card.innerHTML = `
            <div class="item-image">
                <img src="${imageUrl}" alt="${item.title}" onerror="this.src='https://via.placeholder.com/400x300?text=No+Image'">
                <span class="item-status ${item.type}">${item.type}</span>
            </div>
            <div class="item-content">
                <h3>${this.escapeHtml(item.title)}</h3>
                <div class="item-meta">
                    <span><i class="fas fa-map-marker-alt"></i> ${this.escapeHtml(item.location)}</span>
                    <span><i class="fas fa-calendar"></i> ${formattedDate}</span>
                </div>
                <p class="item-description">${this.escapeHtml(item.description)}</p>
                <div class="item-reporter">
                    <i class="fas fa-user"></i> ${this.escapeHtml(item.reporterName)}
                </div>
            </div>
        `;

        return card;
    }

    // Show item details modal
    showItemModal(item) {
        this.currentItemModal = item;
        const modal = document.getElementById('itemModal');
        
        // Populate modal with item data
        document.getElementById('modalTitle').textContent = 'Item Details';
        document.getElementById('modalImage').src = item.image || 'https://via.placeholder.com/400x300?text=No+Image';
        document.getElementById('modalStatus').textContent = item.type;
        document.getElementById('modalStatus').className = `item-status ${item.type}`;
        document.getElementById('modalDate').textContent = storage.formatDate(item.dateReported);
        document.getElementById('modalItemName').textContent = item.title;
        document.getElementById('modalCategory').textContent = item.category.charAt(0).toUpperCase() + item.category.slice(1);
        document.getElementById('modalLocation').textContent = item.location;
        document.getElementById('modalDescription').textContent = item.description;
        document.getElementById('modalReporter').textContent = item.reporterName;
        document.getElementById('modalEmail').textContent = item.reporterEmail;
        document.getElementById('modalPhone').textContent = item.reporterPhone || 'Not provided';

        modal.style.display = 'block';
    }


    // Handle modal clicks (for closing)
    handleModalClick(event) {
        const itemModal = document.getElementById('itemModal');
        const authModal = document.getElementById('authModal');
        const contactModal = document.getElementById('contactModal');

        if (event.target === itemModal) {
            this.closeModal();
        }
        if (event.target === contactModal) {
            this.closeContactModal();
        }
    }

    // Handle keyboard shortcuts
    handleKeyboard(event) {
        // Close modals with Escape key
        if (event.key === 'Escape') {
            this.closeModal();
            this.closeContactModal();
        }

    }

    // Close item details modal
    closeModal() {
        const modal = document.getElementById('itemModal');
        modal.style.display = 'none';
        this.currentItemModal = null;
    }

    // Show contact owner modal
    contactOwner() {
        if (!this.currentItemModal) return;

        const modal = document.getElementById('contactModal');
        const subjectField = document.getElementById('contactSubject');
        const messageField = document.getElementById('contactMessage');

        // Pre-fill subject
        const itemType = this.currentItemModal.type === 'lost' ? 'Lost' : 'Found';
        subjectField.value = `Regarding ${itemType} Item: ${this.currentItemModal.title}`;

        // Pre-fill message
        messageField.value = `Hi ${this.currentItemModal.reporterName},\n\nI saw your listing about the ${this.currentItemModal.title}. `;


        modal.style.display = 'block';
    }

    // Handle contact form submission
    async handleContactSubmit(event) {
        event.preventDefault();
        
        const subject = document.getElementById('contactSubject').value;
        const message = document.getElementById('contactMessage').value;
        const senderEmail = document.getElementById('contactEmail').value;

        if (!subject || !message || !senderEmail) {
            this.showErrorMessage('Please fill in all fields');
            return;
        }
        
        if (!this.currentItemModal) {
            this.showErrorMessage('No item selected');
            return;
        }

        // Show loading state
        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        try {
            // Prepare email data
            const emailData = {
                recipientEmail: this.currentItemModal.reporterEmail,
                senderEmail: senderEmail,
                senderName: senderEmail.split('@')[0], // Use email username as name
                subject: subject,
                message: message,
                itemTitle: this.currentItemModal.title,
                itemType: this.currentItemModal.type === 'lost' ? 'Lost' : 'Found'
            };
            
            console.log('📧 Attempting to send contact email...', emailData);
            
            // Send email using email service
            const result = await window.emailService.sendContactEmail(emailData);
            
            if (result.success) {
                this.showSuccessMessage(result.message);
                this.closeContactModal();
                document.getElementById('contactForm').reset();
            } else {
                this.showErrorMessage(result.message);
            }
            
        } catch (error) {
            console.error('❌ Error sending contact email:', error);
            this.showErrorMessage('Failed to send message. Please try again.');
        } finally {
            // Reset button state
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    // Close contact modal
    closeContactModal() {
        const modal = document.getElementById('contactModal');
        modal.style.display = 'none';
    }

    // Show success message
    showSuccessMessage(message) {
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            z-index: 3000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 4000);
    }

    // Hide loading spinner
    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'none';
        }
    }

    // Animate cards on load
    animateCards() {
        const cards = document.querySelectorAll('.item-card');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
            card.classList.add('fade-in');
        });
    }

    // Utility function: Debounce
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Utility function: Escape HTML
    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Refresh items (useful when returning from other pages)
    async refresh() {
        await this.loadItems();
    }

    // Update summary statistics
    updateSummary() {
        const stats = this.getStats();
        const itemsCountElement = document.getElementById('itemsCount');
        
        if (itemsCountElement) {
            itemsCountElement.textContent = this.filteredItems.length;
        }
        
        // Update or create summary cards if they exist
        this.updateSummaryCards(stats);
    }
    
    // Update summary cards with statistics
    updateSummaryCards(stats) {
        // Check if we have a summary section to update
        const summarySection = document.querySelector('.summary-section');
        if (summarySection) {
            const totalCard = summarySection.querySelector('.stat-total');
            const lostCard = summarySection.querySelector('.stat-lost');
            const foundCard = summarySection.querySelector('.stat-found');
            const recentCard = summarySection.querySelector('.stat-recent');
            
            // Animate numbers counting up
            if (totalCard) this.animateNumber(totalCard, stats.total);
            if (lostCard) this.animateNumber(lostCard, stats.lost);
            if (foundCard) this.animateNumber(foundCard, stats.found);
            if (recentCard) this.animateNumber(recentCard, stats.recent);
        }
    }
    
    // Animate number counting up
    animateNumber(element, targetNumber) {
        const currentNumber = parseInt(element.textContent) || 0;
        if (currentNumber === targetNumber) return;
        
        const duration = 800; // 0.8 seconds
        const increment = targetNumber > currentNumber ? 1 : -1;
        const stepTime = Math.abs(duration / (targetNumber - currentNumber));
        
        let current = currentNumber;
        const timer = setInterval(() => {
            current += increment;
            element.textContent = current;
            
            if (current === targetNumber) {
                clearInterval(timer);
                // Add a little bounce effect
                element.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    element.style.transform = 'scale(1)';
                }, 200);
            }
        }, stepTime);
    }
    
    // Show error state
    showErrorState(message) {
        const itemsGrid = document.getElementById('itemsGrid');
        const noItems = document.getElementById('noItems');
        
        if (itemsGrid) {
            itemsGrid.innerHTML = `
                <div class="error-state" style="
                    grid-column: 1 / -1;
                    text-align: center;
                    padding: 3rem;
                    color: #ef4444;
                    background: #fef2f2;
                    border-radius: 15px;
                    border: 2px solid #fecaca;
                ">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                    <h3>Oops! Something went wrong</h3>
                    <p>${message}</p>
                    <button onclick="app.loadItems()" class="btn-primary" style="margin-top: 1rem;">
                        <i class="fas fa-refresh"></i> Try Again
                    </button>
                </div>
            `;
        }
        
        if (noItems) noItems.style.display = 'none';
    }

    // Get statistics
    getStats() {
        const items = this.currentItems;
        const now = new Date();
        
        return {
            total: items.length,
            lost: items.filter(item => item.type === 'lost').length,
            found: items.filter(item => item.type === 'found').length,
            recent: items.filter(item => {
                const reportDate = new Date(item.dateReported);
                const daysSinceReport = Math.floor((now - reportDate) / (1000 * 60 * 60 * 24));
                return daysSinceReport <= 7;
            }).length
        };
    }


    // Delete item functionality with complete verification
    async deleteItem() {
        if (!this.currentItemModal) return;
        
        const itemTitle = this.currentItemModal.title;
        const itemId = this.currentItemModal.id;
        
        // Enhanced confirmation dialog
        const confirmDelete = confirm(
            `⚠️ PERMANENT DELETION WARNING ⚠️\n\n` +
            `Are you absolutely sure you want to PERMANENTLY DELETE:\n` +
            `"${itemTitle}"?\n\n` +
            `This action will:\n` +
            `• Remove the item completely from the database\n` +
            `• Cannot be undone or recovered\n` +
            `• Make the item invisible to all users\n\n` +
            `Click OK to PERMANENTLY DELETE or Cancel to keep the item.`
        );
        
        if (!confirmDelete) {
            console.log('🙅‍♂️ User cancelled deletion');
            return;
        }
        
        // Show deletion progress
        const deleteButton = document.querySelector('.btn-delete');
        if (deleteButton) {
            deleteButton.textContent = 'Deleting...';
            deleteButton.disabled = true;
            deleteButton.style.background = '#6b7280';
        }
        
        try {
            console.log(`🗿 Starting complete deletion of item: ${itemId}`);
            
            // Store current item count for verification
            const itemCountBefore = this.currentItems.length;
            
            // Perform the deletion
            const success = await storage.deleteItem(itemId);
            
            if (success) {
                console.log('✅ Delete operation completed, verifying...');
                
                // Immediately remove item from UI for better UX
                this.removeItemFromUI(itemId);
                
                // Close modal first
                this.closeModal();
                
                // Refresh items list to verify deletion
                await this.loadItems();
                
                // Verify the item is actually gone
                const itemStillExists = this.currentItems.find(item => item.id === itemId);
                const itemCountAfter = this.currentItems.length;
                
                if (itemStillExists) {
                    console.error('❌ CRITICAL: Item still exists after deletion!');
                    this.showErrorMessage('CRITICAL ERROR: Item still exists after deletion. Please check the database.');
                    return;
                }
                
                // Final success confirmation
                const itemsDeleted = itemCountBefore - itemCountAfter;
                console.log(`✅ CONFIRMED: Item completely deleted from database (${itemsDeleted} item(s) removed)`);
                
                this.showSuccessMessage(
                    `✅ "${itemTitle}" has been COMPLETELY DELETED from the database. ` +
                    `(${itemsDeleted} item(s) removed)`
                );
                
                // Update statistics
                this.updateSummary();
                
            } else {
                console.error('❌ Delete operation failed');
                this.showErrorMessage('❌ Failed to delete item. The item may still exist in the database.');
            }
            
        } catch (error) {
            console.error('❌ Critical error during deletion:', error);
            this.showErrorMessage(`❌ CRITICAL ERROR: ${error.message || 'Unknown error during deletion'}`);
        } finally {
            // Reset delete button
            if (deleteButton) {
                deleteButton.textContent = '🗑️ Delete Item';
                deleteButton.disabled = false;
                deleteButton.style.background = '';
            }
        }
    }

    // Remove item from UI immediately for better user experience
    removeItemFromUI(itemId) {
        // Remove from current items array
        this.currentItems = this.currentItems.filter(item => item.id !== itemId);
        this.filteredItems = this.filteredItems.filter(item => item.id !== itemId);
        
        // Remove the card from DOM with animation
        const itemCard = document.querySelector(`[data-item-id="${itemId}"]`);
        if (itemCard) {
            itemCard.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                if (itemCard.parentNode) {
                    itemCard.parentNode.removeChild(itemCard);
                }
            }, 300);
        }
        
        // Update counts immediately
        this.updateSummary();
        
        const itemsCount = document.getElementById('itemsCount');
        if (itemsCount) {
            itemsCount.textContent = this.filteredItems.length;
        }
    }
    
    // Show error message
    showErrorMessage(message) {
        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: #ef4444;
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            z-index: 3000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 4000);
    }
}

// Global functions for HTML onclick handlers
function closeModal() {
    app.closeModal();
}

function contactOwner() {
    app.contactOwner();
}

function closeContactModal() {
    app.closeContactModal();
}

function deleteItem() {
    app.deleteItem();
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('🚀 Initializing Lost & Found App...');
        window.app = new LostAndFoundApp();
        console.log('✅ App instance created');
        await window.app.init();
        console.log('✅ App initialization complete');
    } catch (error) {
        console.error('❌ App initialization failed:', error);
    }
});

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: scale(1);
        }
        to {
            opacity: 0;
            transform: scale(0.8);
        }
    }

    .fade-in {
        animation: fadeIn 0.6s ease forwards;
    }

    .hamburger.active span:nth-child(1) {
        transform: rotate(-45deg) translate(-5px, 6px);
    }

    .hamburger.active span:nth-child(2) {
        opacity: 0;
    }

    .hamburger.active span:nth-child(3) {
        transform: rotate(45deg) translate(-5px, -6px);
    }
`;
document.head.appendChild(style);