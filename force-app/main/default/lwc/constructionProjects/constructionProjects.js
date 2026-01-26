import { LightningElement, track } from 'lwc';

export default class ConstructionProjects extends LightningElement {
    // Filter values
    selectedPrice = '';
    selectedRooms = '';
    selectedBathrooms = '';
    selectedLocation = '';
    selectedRegion = '';
    selectedPropertyType = '';

    // Modal state
    showDetailModal = false;
    @track selectedProject = null;

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
            area: 64.7,
            floor: '0 of 3',
            parkingCost: 26500,
            propertyType: 'Apartment',
            price: 342000,
            features: ['Terrace', 'Garden', 'Balcony'],
            images: [
                'https://immobilien.weisenburger.de/cdn/shop/files/HausA3Whg25EG_4a1c71bd-2a4f-4f2a-ad2d-3459c33a3af1.png?v=1765981314&width=1200',
                'https://immobilien.weisenburger.de/cdn/shop/files/15.png?v=1766071663&width=1200',
                'https://immobilien.weisenburger.de/cdn/shop/files/18.png?v=1766071663&width=1200',
                'https://immobilien.weisenburger.de/cdn/shop/files/16.png?v=1766071663&width=1200',
                'https://immobilien.weisenburger.de/cdn/shop/files/17_d022a82a-1033-4916-8a63-90f11aa93ad2.png?v=1766071663&width=1200'
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
            floor: '0 of 3',
            parkingCost: 26500,
            propertyType: 'Apartment',
            price: 343000,
            features: ['Terrace', 'Garden', 'Elevator'],
            images: [
                'https://immobilien.weisenburger.de/cdn/shop/files/HausA3Whg27EG.png?v=1765981248&width=1200',
                'https://immobilien.weisenburger.de/cdn/shop/files/15.png?v=1766071663&width=1200',
                'https://immobilien.weisenburger.de/cdn/shop/files/18.png?v=1766071663&width=1200',
                'https://immobilien.weisenburger.de/cdn/shop/files/16.png?v=1766071663&width=1200',
                'https://immobilien.weisenburger.de/cdn/shop/files/17_d022a82a-1033-4916-8a63-90f11aa93ad2.png?v=1766071663&width=1200'
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
            floor: '0 of 3',
            parkingCost: 28000,
            propertyType: 'Apartment',
            price: 451000,
            features: ['Garden', 'Ground Floor', 'Terrace'],
            images: [
                'https://immobilien.weisenburger.de/cdn/shop/files/HausA2Whg15EG_2ead048c-1ee1-4f58-8550-89bac0d298c3.png?v=1765981365&width=1200',
                'https://immobilien.weisenburger.de/cdn/shop/files/15.png?v=1766071663&width=1200',
                'https://immobilien.weisenburger.de/cdn/shop/files/18.png?v=1766071663&width=1200',
                'https://immobilien.weisenburger.de/cdn/shop/files/16.png?v=1766071663&width=1200',
                'https://immobilien.weisenburger.de/cdn/shop/files/17_d022a82a-1033-4916-8a63-90f11aa93ad2.png?v=1766071663&width=1200'
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
            floor: '2 of 3',
            parkingCost: 26500,
            propertyType: 'Apartment',
            price: 479000,
            features: ['Balcony', 'Elevator', 'Premium Finishes'],
            images: [
                'https://immobilien.weisenburger.de/cdn/shop/files/HausA2Whg201.OG.png?v=1765981345&width=1200',
                'https://immobilien.weisenburger.de/cdn/shop/files/15.png?v=1766071663&width=1200',
                'https://immobilien.weisenburger.de/cdn/shop/files/18.png?v=1766071663&width=1200',
                'https://immobilien.weisenburger.de/cdn/shop/files/16.png?v=1766071663&width=1200',
                'https://immobilien.weisenburger.de/cdn/shop/files/17_d022a82a-1033-4916-8a63-90f11aa93ad2.png?v=1766071663&width=1200'
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
            floor: '1 of 3',
            parkingCost: 28000,
            propertyType: 'Apartment',
            price: 559500,
            features: ['Balcony', 'Elevator', 'Parking'],
            images: [
                'https://immobilien.weisenburger.de/cdn/shop/files/HausA1Whg12-2.OG_02a13b2a-812e-4ded-826c-90af827cdfdd.png?v=1765981432&width=1200',
                'https://immobilien.weisenburger.de/cdn/shop/files/15.png?v=1766071663&width=1200',
                'https://immobilien.weisenburger.de/cdn/shop/files/18.png?v=1766071663&width=1200',
                'https://immobilien.weisenburger.de/cdn/shop/files/16.png?v=1766071663&width=1200',
                'https://immobilien.weisenburger.de/cdn/shop/files/17_d022a82a-1033-4916-8a63-90f11aa93ad2.png?v=1766071663&width=1200'
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
            floor: '3 of 3',
            parkingCost: 30000,
            propertyType: 'Penthouse',
            price: 829000,
            features: ['Roof Terrace', 'Panoramic View', 'Premium Finishes', 'Elevator'],
            images: [
                'https://immobilien.weisenburger.de/cdn/shop/files/HausA5Whg48Penthouse_5586d2ef-0582-4cf1-a4e9-453d9eef3d40.png?v=1766071663&width=1200',
                'https://immobilien.weisenburger.de/cdn/shop/files/Bild_3.jpg?v=1766072826&width=1200',
                'https://immobilien.weisenburger.de/cdn/shop/files/Bild_1.jpg?v=1766072826&width=1200',
                'https://immobilien.weisenburger.de/cdn/shop/files/Bild_4.jpg?v=1766072826&width=1200',
                'https://immobilien.weisenburger.de/cdn/shop/files/Bild_2.jpg?v=1766072826&width=1200'
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
            floor: '3 of 3',
            parkingCost: 28000,
            propertyType: 'Penthouse',
            price: 708000,
            features: ['Terrace', 'Premium Finishes', 'Elevator'],
            images: [
                'https://immobilien.weisenburger.de/cdn/shop/files/HausA3Whg34Penthouse_99d019ad-ddeb-4e4a-8b5a-a613aa05437f.png?v=1766071614&width=1200',
                'https://immobilien.weisenburger.de/cdn/shop/files/15.png?v=1766071663&width=1200',
                'https://immobilien.weisenburger.de/cdn/shop/files/18.png?v=1766071663&width=1200',
                'https://immobilien.weisenburger.de/cdn/shop/files/16.png?v=1766071663&width=1200',
                'https://immobilien.weisenburger.de/cdn/shop/files/17_d022a82a-1033-4916-8a63-90f11aa93ad2.png?v=1766071663&width=1200'
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
            floor: '0 of 3',
            parkingCost: 26500,
            propertyType: 'Apartment',
            price: 549000,
            features: ['Balcony', 'Elevator', 'Storage'],
            images: [
                'https://immobilien.weisenburger.de/cdn/shop/files/HausA1Whg8-1.OG.png?v=1765981388&width=1200',
                'https://immobilien.weisenburger.de/cdn/shop/files/15.png?v=1766071663&width=1200',
                'https://immobilien.weisenburger.de/cdn/shop/files/18.png?v=1766071663&width=1200',
                'https://immobilien.weisenburger.de/cdn/shop/files/16.png?v=1766071663&width=1200',
                'https://immobilien.weisenburger.de/cdn/shop/files/17_d022a82a-1033-4916-8a63-90f11aa93ad2.png?v=1766071663&width=1200'
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
            floor: '0 of 3',
            parkingCost: 25000,
            propertyType: 'Studio',
            price: 239000,
            features: ['Garden', 'Ground Floor'],
            images: [
                'https://immobilien.weisenburger.de/cdn/shop/files/HausA3Whg26EG_b25cfb25-bbbf-4ca9-b460-462b2f0c7a5d.png?v=1765981270&width=1200',
                'https://immobilien.weisenburger.de/cdn/shop/files/15.png?v=1766071663&width=1200',
                'https://immobilien.weisenburger.de/cdn/shop/files/18.png?v=1766071663&width=1200',
                'https://immobilien.weisenburger.de/cdn/shop/files/16.png?v=1766071663&width=1200',
                'https://immobilien.weisenburger.de/cdn/shop/files/17_d022a82a-1033-4916-8a63-90f11aa93ad2.png?v=1766071663&width=1200'
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
            floor: '2 of 3',
            parkingCost: 25000,
            propertyType: 'Studio',
            price: 239000,
            features: ['Balcony', 'Elevator'],
            images: [
                'https://immobilien.weisenburger.de/cdn/shop/files/HausA3Whg291.OG.png?v=1765981217&width=1200',
                'https://immobilien.weisenburger.de/cdn/shop/files/15.png?v=1766071663&width=1200',
                'https://immobilien.weisenburger.de/cdn/shop/files/18.png?v=1766071663&width=1200',
                'https://immobilien.weisenburger.de/cdn/shop/files/16.png?v=1766071663&width=1200',
                'https://immobilien.weisenburger.de/cdn/shop/files/17_d022a82a-1033-4916-8a63-90f11aa93ad2.png?v=1766071663&width=1200'
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
