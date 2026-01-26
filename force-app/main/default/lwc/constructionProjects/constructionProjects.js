import { LightningElement, track, wire } from 'lwc';
import getProjects from '@salesforce/apex/ConstructionProjectsController.getProjects';

export default class ConstructionProjects extends LightningElement {
    // Filter values
    selectedPrice = '';
    selectedRooms = '';
    selectedBathrooms = '';
    selectedLocation = '';
    selectedRegion = '';
    selectedPropertyType = '';
    selectedSort = ''; // new sort selection
    isSorting = false;
    _sortTimer;

    // Modal state
    showDetailModal = false;
    @track selectedProject = null;

    // All projects data
    @track allProjects = [];

    @wire(getProjects)
    wiredProjects({ error, data }) {
        if (data) {
            // Clone data to make it mutable and ensure UI state properties exist
            this.allProjects = data.map(project => ({
                ...project,
                currentImageIndex: 0 // Ensure UI state is initialized
            }));
        } else if (error) {
            console.error('Error loading projects', error);
        }
    }

    // Filter options
    get priceOptions() {
        return [
            { label: 'All Prices', value: '' },
            { label: 'Up to €300,000', value: '0-300000' },
            { label: '€300,000 - €500,000', value: '300000-500000' },
            { label: '€500,000 - €700,000', value: '500000-700000' },
            { label: 'Above €700,000', value: '700000-999999999' }
        ];
    }

    get roomOptions() {
        return [
            { label: 'All Rooms', value: '' },
            { label: '1 Room', value: '1' },
            { label: '2 Rooms', value: '2' },
            { label: '3 Rooms', value: '3' },
            { label: '4 Rooms', value: '4' },
            { label: '5+ Rooms', value: '5' }
        ];
    }

    get bathroomOptions() {
        return [
            { label: 'All Bathrooms', value: '' },
            { label: '1 Bathroom', value: '1' },
            { label: '2 Bathrooms', value: '2' },
            { label: '3+ Bathrooms', value: '3' }
        ];
    }

    get locationOptions() {
        return [
            { label: 'All Locations', value: '' },
            { label: 'Winnenden', value: 'Winnenden' }
        ];
    }

    get regionOptions() {
        return [
            { label: 'All Regions', value: '' },
            { label: 'Greater Stuttgart', value: 'Greater Stuttgart' }
        ];
    }

    get propertyTypeOptions() {
        return [
            { label: 'All Property Types', value: '' },
            { label: 'Apartment', value: 'Apartment' },
            { label: 'Penthouse', value: 'Penthouse' },
            { label: 'Studio', value: 'Studio' }
        ];
    }

    // Sort options
    get sortOptions() {
        return [
            { label: 'Default', value: '' },
            { label: 'Best Selling', value: 'most_sold' },
            { label: 'Alphabetical, A-Z', value: 'alpha_asc' },
            { label: 'Alphabetical, Z-A', value: 'alpha_desc' },
            { label: 'Price, low to high', value: 'price_asc' },
            { label: 'Price, high to low', value: 'price_desc' },
            { label: 'Date, old to new', value: 'date_old_new' },
            { label: 'Date, new to old', value: 'date_new_old' }
        ];
    }

    // Filtered projects
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

        // Apply sorting if requested
        if (this.selectedSort) {
            const sortKey = this.selectedSort;
            filtered = filtered.slice(); // clone array before sorting
            switch (sortKey) {
                case 'most_sold':
                    // If there's a salesCount property, sort descending; otherwise, keep order
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

        // Add computed properties for display
        return filtered.map(project => ({
            ...project,
            formattedPrice: this.formatPrice(project.price),
            parkingPrice: project.parkingCost ? `plus €${project.parkingCost.toLocaleString('de-DE')}` : 'Included',
            pricePerSqm: `€${(project.price / project.area).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            currentImage: project.images[project.currentImageIndex],
            hasMultipleImages: project.images.length > 1,
            imageIndicators: project.images.map((img, index) => ({
                index: index,
                className: index === project.currentImageIndex ? 'indicator active' : 'indicator'
            }))
        }));
    }

    get hasProjects() {
        return this.filteredProjects.length > 0;
    }

    get resultCount() {
        return this.filteredProjects.length;
    }

    get resultLabel() {
        return this.resultCount === 1 ? 'Project' : 'Projects';
    }

    // Format price as currency
    formatPrice(price) {
        return '€' + price.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    // Filter handlers
    handlePriceChange(event) {
        this.selectedPrice = event.detail.value;
    }

    handleRoomsChange(event) {
        this.selectedRooms = event.detail.value;
    }

    handleBathroomsChange(event) {
        this.selectedBathrooms = event.detail.value;
    }

    handleLocationChange(event) {
        this.selectedLocation = event.detail.value;
    }

    handleRegionChange(event) {
        this.selectedRegion = event.detail.value;
    }

    handlePropertyTypeChange(event) {
        this.selectedPropertyType = event.detail.value;
    }

    handleSortChange(event) {
        this.selectedSort = event.detail.value;
        // trigger sorting animation
        this.isSorting = true;
        if (this._sortTimer) {
            clearTimeout(this._sortTimer);
        }
        this._sortTimer = setTimeout(() => {
            this.isSorting = false;
            this._sortTimer = null;
        }, 450);
    }

    get projectsGridClass() {
        return `projects-grid ${this.isSorting ? 'is-sorting' : ''}`;
    }

    handleClearFilters() {
        this.selectedPrice = '';
        this.selectedRooms = '';
        this.selectedBathrooms = '';
        this.selectedLocation = '';
        this.selectedRegion = '';
        this.selectedPropertyType = '';
    }

    // Carousel handlers
    handlePreviousImage(event) {
        const projectId = event.currentTarget.dataset.projectId;
        const project = this.allProjects.find(p => p.id === projectId);
        if (project) {
            project.currentImageIndex = 
                project.currentImageIndex === 0 
                    ? project.images.length - 1 
                    : project.currentImageIndex - 1;
            this.allProjects = [...this.allProjects]; // Trigger reactivity
        }
    }

    handleNextImage(event) {
        const projectId = event.currentTarget.dataset.projectId;
        const project = this.allProjects.find(p => p.id === projectId);
        if (project) {
            project.currentImageIndex = 
                project.currentImageIndex === project.images.length - 1 
                    ? 0 
                    : project.currentImageIndex + 1;
            this.allProjects = [...this.allProjects]; // Trigger reactivity
        }
    }

    handleIndicatorClick(event) {
        const projectId = event.currentTarget.dataset.projectId;
        const index = parseInt(event.currentTarget.dataset.index, 10);
        const project = this.allProjects.find(p => p.id === projectId);
        if (project) {
            project.currentImageIndex = index;
            this.allProjects = [...this.allProjects]; // Trigger reactivity
        }
    }

    // Action handlers
    handleViewDetails(event) {
        const projectId = event.currentTarget.dataset.projectId;
        const project = this.filteredProjects.find(p => p.id === projectId);
        if (project) {
            this.selectedProject = { ...project };
            this.showDetailModal = true;
        }
    }

    handleCloseDetail() {
        this.showDetailModal = false;
        this.selectedProject = null;
    }

    // Detail modal carousel handlers
    handleDetailPreviousImage() {
        if (this.selectedProject) {
            this.selectedProject.currentImageIndex = 
                this.selectedProject.currentImageIndex === 0 
                    ? this.selectedProject.images.length - 1 
                    : this.selectedProject.currentImageIndex - 1;
            
            this.updateSelectedProjectDisplay();
        }
    }

    handleDetailNextImage() {
        if (this.selectedProject) {
            this.selectedProject.currentImageIndex = 
                this.selectedProject.currentImageIndex === this.selectedProject.images.length - 1 
                    ? 0 
                    : this.selectedProject.currentImageIndex + 1;
            
            this.updateSelectedProjectDisplay();
        }
    }

    handleDetailIndicatorClick(event) {
        const index = parseInt(event.currentTarget.dataset.index, 10);
        if (this.selectedProject) {
            this.selectedProject.currentImageIndex = index;
            this.updateSelectedProjectDisplay();
        }
    }

    updateSelectedProjectDisplay() {
        // Force reactivity by creating a new object
        this.selectedProject = {
            ...this.selectedProject,
            currentImage: this.selectedProject.images[this.selectedProject.currentImageIndex],
            imageIndicators: this.selectedProject.images.map((img, index) => ({
                index: index,
                className: index === this.selectedProject.currentImageIndex ? 'indicator active' : 'indicator'
            }))
        };
    }

    handleDownloadExpose() {
        // Implement download exposé logic
        console.log('Download exposé for project:', this.selectedProject.code);
        // You can implement file download or navigation here
    }

    handleContactFromDetail() {
        // Implement contact from detail view
        console.log('Contact from detail for project:', this.selectedProject.code);
        // You can implement contact form or navigation here
    }

    handleContactClick() {
        // Navigate to contact form or open contact modal
        console.log('Contact button clicked');
        // You can implement contact form logic here
    }
}
