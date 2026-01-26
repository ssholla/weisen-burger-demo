import { LightningElement, track, wire } from 'lwc';
import getProjects from '@salesforce/apex/ConstructionProjectsController.getProjects';
import { subscribe, MessageContext } from 'lightning/messageService';
import PROJECT_FILTERS from '@salesforce/messageChannel/ProjectFilters__c';

export default class ConstructionProjectResults extends LightningElement {
    // Filter values
    selectedPrice = '';
    selectedRooms = '';
    selectedBathrooms = '';
    selectedLocation = '';
    selectedRegion = '';
    selectedPropertyType = '';
    selectedSort = '';

    // All projects data
    @track allProjects = [];

    @wire(MessageContext)
    messageContext;

    subscription = null;

    connectedCallback() {
        this.subscribeToMessageChannel();
    }

    subscribeToMessageChannel() {
        if (!this.subscription) {
            this.subscription = subscribe(
                this.messageContext,
                PROJECT_FILTERS,
                (message) => this.handleFilterMessage(message)
            );
        }
    }

    handleFilterMessage(message) {
        if (message && message.filters) {
            this.selectedPrice = message.filters.price;
            this.selectedRooms = message.filters.rooms;
            this.selectedBathrooms = message.filters.bathrooms;
            this.selectedLocation = message.filters.location;
            this.selectedRegion = message.filters.region;
            this.selectedPropertyType = message.filters.propertyType;
            this.selectedSort = message.filters.sort;
        }
    }

    @wire(getProjects)
    wiredProjects({ error, data }) {
        if (data) {
            this.allProjects = data.map(project => ({
                ...project,
                currentImageIndex: 0
            }));
        } else if (error) {
            console.error('Error loading projects', error);
        }
    }

    // Filtered projects getter (Same logic as before)
    get filteredProjects() {
        let filtered = this.allProjects.filter(project => {
            // Price filter
            if (this.selectedPrice) {
                const [min, max] = this.selectedPrice.split('-').map(Number);
                if (project.price < min || project.price > max) {
                    return false;
                }
            }

            // Rooms filter
            if (this.selectedRooms) {
                const rooms = parseInt(this.selectedRooms, 10);
                if (rooms === 5) {
                    if (project.rooms < 5) return false;
                } else {
                    if (project.rooms !== rooms) return false;
                }
            }

            // Bathrooms filter
            if (this.selectedBathrooms) {
                const bathrooms = parseInt(this.selectedBathrooms, 10);
                if (bathrooms === 3) {
                    if (project.bathrooms < 3) return false;
                } else {
                    if (project.bathrooms !== bathrooms) return false;
                }
            }

            // Location filter
            if (this.selectedLocation && project.location !== this.selectedLocation) {
                return false;
            }

            // Region filter
            if (this.selectedRegion && project.region !== this.selectedRegion) {
                return false;
            }

            // Property type filter
            if (this.selectedPropertyType && project.propertyType !== this.selectedPropertyType) {
                return false;
            }

            return true;
        });

        // Apply sorting
        if (this.selectedSort) {
            const sortKey = this.selectedSort;
            filtered = filtered.slice();
            switch (sortKey) {
                case 'most_sold':
                    filtered.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));
                    break;
                case 'alpha_asc':
                    filtered.sort((a, b) => a.title.localeCompare(b.title));
                    break;
                case 'alpha_desc':
                    filtered.sort((a, b) => b.title.localeCompare(a.title));
                    break;
                case 'price_asc':
                    filtered.sort((a, b) => a.price - b.price);
                    break;
                case 'price_desc':
                    filtered.sort((a, b) => b.price - a.price);
                    break;
                case 'date_old_new':
                    filtered.sort((a, b) => new Date(a.listingDate || a.createdDate || 0) - new Date(b.listingDate || b.createdDate || 0));
                    break;
                case 'date_new_old':
                    filtered.sort((a, b) => new Date(b.listingDate || b.createdDate || 0) - new Date(a.listingDate || a.createdDate || 0));
                    break;
                default:
                    break;
            }
        }

        // Add computed properties
        return filtered.map(project => ({
            ...project,
            formattedPrice: this.formatPrice(project.price),
            parkingPrice: project.parkingCost ? `plus €${project.parkingCost.toLocaleString('de-DE')}` : 'Included',
            pricePerSqm: `€${(project.price / project.area).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            currentImage: project.images ? project.images[project.currentImageIndex] : '',
            hasMultipleImages: project.images && project.images.length > 1,
            imageIndicators: (project.images || []).map((img, index) => ({
                index: index,
                className: index === project.currentImageIndex ? 'indicator active' : 'indicator'
            }))
        }));
    }

    formatPrice(price) {
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR',
            maximumFractionDigits: 0
        }).format(price);
    }
    
    get hasProjects() {
        return this.filteredProjects.length > 0;
    }

    get resultCount() {
        return this.filteredProjects.length;
    }

    get resultLabel() {
        return this.filteredProjects.length === 1 ? 'Result' : 'Results';
    }

    get projectsGridClass() {
        return 'projects-grid';
    }

    handlePreviousImage(event) {
        const projectId = event.target.dataset.projectId;
        this.updateImageIndex(projectId, -1);
    }

    handleNextImage(event) {
        const projectId = event.target.dataset.projectId;
        this.updateImageIndex(projectId, 1);
    }

    handleIndicatorClick(event) {
        const projectId = event.target.dataset.projectId;
        const index = parseInt(event.target.dataset.index, 10);
        
        const projectIndex = this.allProjects.findIndex(p => p.id === projectId);
        if (projectIndex !== -1) {
            this.allProjects[projectIndex].currentImageIndex = index;
            // Force refresh of filteredProjects - trigger reactivity
            this.allProjects = [...this.allProjects]; 
        }
    }

    updateImageIndex(projectId, delta) {
        const projectIndex = this.allProjects.findIndex(p => p.id === projectId);
        if (projectIndex !== -1) {
            const project = this.allProjects[projectIndex];
            const imageCount = project.images.length;
            let newIndex = project.currentImageIndex + delta;
            
            if (newIndex < 0) newIndex = imageCount - 1;
            if (newIndex >= imageCount) newIndex = 0;
            
            project.currentImageIndex = newIndex;
            this.allProjects = [...this.allProjects];
        }
    }
}
