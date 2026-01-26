import { LightningElement, track } from 'lwc';

export default class ConstructionProjects extends LightningElement {
    // Filter values
    selectedPrice = '';
    selectedRooms = '';
    selectedBathrooms = '';
    selectedLocation = '';
    selectedRegion = '';
    selectedPropertyType = '';

    // All projects data
    @track allProjects = [
        {
            id: '1',
            code: 'A3.25',
            title: '2-Room Terrace Apartment with Garden in Winnenden',
            location: 'Winnenden',
            region: 'Greater Stuttgart',
            rooms: 2,
            bathrooms: 1,
            area: 65,
            propertyType: 'Apartment',
            price: 342000,
            features: ['Terrace', 'Garden', 'Balcony'],
            images: [
                'https://via.placeholder.com/800x600/1a4d8f/ffffff?text=Apartment+View+1',
                'https://via.placeholder.com/800x600/1a4d8f/ffffff?text=Floor+Plan',
                'https://via.placeholder.com/800x600/1a4d8f/ffffff?text=Garden+View'
            ],
            currentImageIndex: 0
        },
        {
            id: '2',
            code: 'A3.27',
            title: '2-Room Terrace Apartment with Garden in Winnenden',
            location: 'Winnenden',
            region: 'Greater Stuttgart',
            rooms: 2,
            bathrooms: 1,
            area: 68,
            propertyType: 'Apartment',
            price: 343000,
            features: ['Terrace', 'Garden', 'Elevator'],
            images: [
                'https://via.placeholder.com/800x600/1a4d8f/ffffff?text=Apartment+A3.27',
                'https://via.placeholder.com/800x600/1a4d8f/ffffff?text=Living+Room',
                'https://via.placeholder.com/800x600/1a4d8f/ffffff?text=Bedroom'
            ],
            currentImageIndex: 0
        },
        {
            id: '3',
            code: 'A2.15',
            title: '3-Room Ground Floor Apartment in Winnenden with Private Garden',
            location: 'Winnenden',
            region: 'Greater Stuttgart',
            rooms: 3,
            bathrooms: 2,
            area: 85,
            propertyType: 'Apartment',
            price: 451000,
            features: ['Garden', 'Ground Floor', 'Terrace'],
            images: [
                'https://via.placeholder.com/800x600/1a4d8f/ffffff?text=Ground+Floor+Apt',
                'https://via.placeholder.com/800x600/1a4d8f/ffffff?text=Kitchen',
                'https://via.placeholder.com/800x600/1a4d8f/ffffff?text=Garden'
            ],
            currentImageIndex: 0
        },
        {
            id: '4',
            code: 'A2.20',
            title: '3-Room Apartment in Winnenden with 90 m² incl. Balcony',
            location: 'Winnenden',
            region: 'Greater Stuttgart',
            rooms: 3,
            bathrooms: 2,
            area: 90,
            propertyType: 'Apartment',
            price: 479000,
            features: ['Balcony', 'Elevator', 'Premium Finishes'],
            images: [
                'https://via.placeholder.com/800x600/1a4d8f/ffffff?text=3-Room+Apartment',
                'https://via.placeholder.com/800x600/1a4d8f/ffffff?text=Balcony+View'
            ],
            currentImageIndex: 0
        },
        {
            id: '5',
            code: 'A1.12',
            title: '4-Room Apartment in Winnenden with 102 m² incl. Balcony',
            location: 'Winnenden',
            region: 'Greater Stuttgart',
            rooms: 4,
            bathrooms: 2,
            area: 102,
            propertyType: 'Apartment',
            price: 559500,
            features: ['Balcony', 'Elevator', 'Parking'],
            images: [
                'https://via.placeholder.com/800x600/1a4d8f/ffffff?text=4-Room+Apartment',
                'https://via.placeholder.com/800x600/1a4d8f/ffffff?text=Master+Bedroom',
                'https://via.placeholder.com/800x600/1a4d8f/ffffff?text=Living+Area'
            ],
            currentImageIndex: 0
        },
        {
            id: '6',
            code: 'A5.48',
            title: 'Penthouse with Two Roof Terraces and Breathtaking Views in Winnenden',
            location: 'Winnenden',
            region: 'Greater Stuttgart',
            rooms: 5,
            bathrooms: 3,
            area: 144,
            propertyType: 'Penthouse',
            price: 829000,
            features: ['Roof Terrace', 'Panoramic View', 'Premium Finishes', 'Elevator'],
            images: [
                'https://via.placeholder.com/800x600/1a4d8f/ffffff?text=Penthouse',
                'https://via.placeholder.com/800x600/1a4d8f/ffffff?text=Roof+Terrace',
                'https://via.placeholder.com/800x600/1a4d8f/ffffff?text=City+View'
            ],
            currentImageIndex: 0
        },
        {
            id: '7',
            code: 'A3.34',
            title: 'Exclusive Penthouse in Winnenden with 122 m² and Premium Finishes',
            location: 'Winnenden',
            region: 'Greater Stuttgart',
            rooms: 4,
            bathrooms: 2,
            area: 122,
            propertyType: 'Penthouse',
            price: 708000,
            features: ['Terrace', 'Premium Finishes', 'Elevator'],
            images: [
                'https://via.placeholder.com/800x600/1a4d8f/ffffff?text=Exclusive+Penthouse',
                'https://via.placeholder.com/800x600/1a4d8f/ffffff?text=Interior'
            ],
            currentImageIndex: 0
        },
        {
            id: '8',
            code: 'A1.08',
            title: 'Spacious 4-Room Apartment with Balcony in Winnenden-Höfen',
            location: 'Winnenden',
            region: 'Greater Stuttgart',
            rooms: 4,
            bathrooms: 2,
            area: 98,
            propertyType: 'Apartment',
            price: 549000,
            features: ['Balcony', 'Elevator', 'Storage'],
            images: [
                'https://via.placeholder.com/800x600/1a4d8f/ffffff?text=Spacious+4-Room',
                'https://via.placeholder.com/800x600/1a4d8f/ffffff?text=Floor+Plan',
                'https://via.placeholder.com/800x600/1a4d8f/ffffff?text=Balcony'
            ],
            currentImageIndex: 0
        },
        {
            id: '9',
            code: 'A3.26',
            title: 'Bright 1-Room Ground Floor Apartment in Winnenden with Private Garden',
            location: 'Winnenden',
            region: 'Greater Stuttgart',
            rooms: 1,
            bathrooms: 1,
            area: 45,
            propertyType: 'Studio',
            price: 239000,
            features: ['Garden', 'Ground Floor'],
            images: [
                'https://via.placeholder.com/800x600/1a4d8f/ffffff?text=Studio+Apartment',
                'https://via.placeholder.com/800x600/1a4d8f/ffffff?text=Garden+Area'
            ],
            currentImageIndex: 0
        },
        {
            id: '10',
            code: 'A3.29',
            title: 'Bright 1-Room Apartment in Winnenden with Balcony',
            location: 'Winnenden',
            region: 'Greater Stuttgart',
            rooms: 1,
            bathrooms: 1,
            area: 47,
            propertyType: 'Studio',
            price: 239000,
            features: ['Balcony', 'Elevator'],
            images: [
                'https://via.placeholder.com/800x600/1a4d8f/ffffff?text=1-Room+with+Balcony'
            ],
            currentImageIndex: 0
        }
    ];

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

        // Add computed properties for display
        return filtered.map(project => ({
            ...project,
            formattedPrice: this.formatPrice(project.price),
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
        // Navigate to project details or show modal
        console.log('View details for project:', projectId);
        // You can implement navigation or modal logic here
    }

    handleContactClick() {
        // Navigate to contact form or open contact modal
        console.log('Contact button clicked');
        // You can implement contact form logic here
    }
}
