import { LightningElement, track, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getProjects from '@salesforce/apex/ConstructionProjectsController.getProjects';
import createLead from '@salesforce/apex/ConstructionProjectsController.createLead';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { subscribe, MessageContext } from 'lightning/messageService';
import PROJECT_FILTERS from '@salesforce/messageChannel/ProjectFilters__c';
import isExperienceCloud from '@salesforce/apex/ConstructionProjectsController.isExperienceCloud';

export default class ConstructionProjectResults extends NavigationMixin(LightningElement) {
    // Filter values
    selectedPrice = '';
    selectedRooms = '';
    selectedBathrooms = '';
    selectedLocation = '';
    selectedRegion = '';
    selectedPropertyType = '';
    selectedSort = '';

    isCommunity = false;

    @wire(isExperienceCloud)
    wiredContext({ error, data }) {
        if (data !== undefined) {
            this.isCommunity = data;
        } else if (error) {
            this.isCommunity = false; // Default to false (Internal) if it fails
        }
    }

    get isInternal() {
        return !this.isCommunity;
    }

    // Modal state
    showDetailModal = false;
    @track selectedProject = null;
    // Register modal state and inputs
    showRegisterModal = false;
    registerFirstName = '';
    registerLastName = '';
    registerEmail = '';
    registerPhone = '';
    registerMobile = '';

    // All projects data
    @track allProjects = [];
    // Pagination
    pageSize = 9;
    @track currentPage = 1;

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
            // Reset to first page when filters change
            this.currentPage = 1;
        }
    }

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

    handleSortChange(event) {
        this.selectedSort = event.detail.value;
        // Reset pagination when sorting changes
        this.currentPage = 1;
    }

    @wire(getProjects)
    wiredProjects({ error, data }) {
        if (data) {
            this.allProjects = data.map(project => ({
                ...project,
                currentImageIndex: 0
            }));
            this.currentPage = 1;
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
                    filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
                    break;
                case 'alpha_desc':
                    filtered.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
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
            })),
            // Display logic helpers
            hasTitle: !!project.title,
            displayLocation: project.region ? `${project.location}, ${project.region}` : project.location,
            hasFeatures: project.features && project.features.length > 0,
            hasRooms: !!project.rooms,
            hasArea: !!project.area,
            hasPropertyType: !!project.propertyType
        }));
    }

    formatPrice(price) {
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR',
            maximumFractionDigits: 0
        }).format(price);
    }
    
    // Pagination helpers
    get paginatedProjects() {
        const all = this.filteredProjects || [];
        const start = (this.currentPage - 1) * this.pageSize;
        return all.slice(start, start + this.pageSize);
    }

    get totalPages() {
        const total = this.resultCount || 0;
        return Math.max(1, Math.ceil(total / this.pageSize));
    }

    get pages() {
        const pages = [];
        for (let i = 1; i <= this.totalPages; i++) {
            pages.push({ num: i, className: i === this.currentPage ? 'page-btn active' : 'page-btn' });
        }
        return pages;
    }

    get isFirstPage() {
        return this.currentPage <= 1;
    }

    get isLastPage() {
        return this.currentPage >= this.totalPages;
    }

    get showingStartIndex() {
        if (this.resultCount === 0) return 0;
        return (this.currentPage - 1) * this.pageSize + 1;
    }

    get showingEndIndex() {
        return Math.min(this.currentPage * this.pageSize, this.resultCount);
    }

    handlePreviousPage() {
        if (this.currentPage > 1) this.currentPage -= 1;
    }

    handleNextPage() {
        if (this.currentPage < this.totalPages) this.currentPage += 1;
    }

    handleGoToPage(event) {
        const page = parseInt(event.target.dataset.page, 10);
        if (!isNaN(page) && page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
        }
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

    handleViewDetails(event) {
        const projectId = event.target.dataset.projectId;
        this.selectedProject = this.filteredProjects.find(p => p.id === projectId);
        this.showDetailModal = true;
    }

    handleCloseDetail() {
        this.showDetailModal = false;
        this.selectedProject = null;
    }

    handleDetailPreviousImage() {
        if (this.selectedProject) {
            this.updateImageIndex(this.selectedProject.id, -1);
            this.selectedProject = this.filteredProjects.find(p => p.id === this.selectedProject.id);
        }
    }

    handleDetailNextImage() {
        if (this.selectedProject) {
            this.updateImageIndex(this.selectedProject.id, 1);
            this.selectedProject = this.filteredProjects.find(p => p.id === this.selectedProject.id);
        }
    }

    handleDetailIndicatorClick(event) {
        if (this.selectedProject) {
            const index = parseInt(event.target.dataset.index, 10);
            const projectId = this.selectedProject.id;
            
            const projectIndex = this.allProjects.findIndex(p => p.id === projectId);
            if (projectIndex !== -1) {
                this.allProjects[projectIndex].currentImageIndex = index;
                this.allProjects = [...this.allProjects];
                this.selectedProject = this.filteredProjects.find(p => p.id === projectId);
            }
        }
    }

    handleDownloadExpose() {
        console.log('Download Exposé for', this.selectedProject.title);
    }

    handleContactFromDetail() {
        console.log('Contact for', this.selectedProject.title);
    }

    handleOpenRecordToSalesforce() {
        if (!this.selectedProject || !this.selectedProject.id) {
            return;
        }

        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.selectedProject.id,
                actionName: 'view'
            }
        });
    }

    handleOpenRegister() {
        // Remember if detail modal was open, close it and open register modal
        this._wasDetailOpen = !!this.showDetailModal;
        this.showDetailModal = false;
        this.showRegisterModal = true;
        // prefill if possible
        this.registerFirstName = '';
        this.registerLastName = '';
        this.registerEmail = '';
        this.registerPhone = '';
        this.registerMobile = '';
    }

    handleCloseRegister() {
        this.showRegisterModal = false;
        // If the register modal was opened from the detail modal, restore it on cancel
        if (this._wasDetailOpen && this.selectedProject) {
            this.showDetailModal = true;
        }
        this._wasDetailOpen = false;
    }

    handleRegisterInput(event) {
        const field = event.target.dataset.name;
        if (!field) return;
        this[`register${field.charAt(0).toUpperCase() + field.slice(1)}`] = event.target.value;
    }

    async handleSubmitRegister() {
        if (!this.registerLastName) {
            this.dispatchEvent(new ShowToastEvent({ title: 'Error', message: 'Last name is required', variant: 'error' }));
            return;
        }

        try {
            const unitId = this.selectedProject ? this.selectedProject.id : null;
            const leadId = await createLead({
                firstName: this.registerFirstName || null,
                lastName: this.registerLastName,
                email: this.registerEmail || null,
                phone: this.registerPhone || null,
                mobile: this.registerMobile || null,
                unitId: unitId
            });
            this.dispatchEvent(new ShowToastEvent({ title: 'Success', message: 'Successfully Registered', variant: 'success' }));
            this.showRegisterModal = false;
        } catch (error) {
            console.error('Error creating lead', error);
            const msg = (error && error.body && error.body.message) ? error.body.message : (error && error.message) ? error.message : 'Unknown error';
            this.dispatchEvent(new ShowToastEvent({ title: 'Error', message: msg, variant: 'error' }));
        }
    }
}