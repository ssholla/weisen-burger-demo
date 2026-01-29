import { LightningElement, wire, track } from 'lwc';
import { subscribe, MessageContext } from 'lightning/messageService';
import getProjectsWithUnits from '@salesforce/apex/MapController.getProjectsWithUnits';
import PROJECT_FILTERS from '@salesforce/messageChannel/ProjectFilters__c';

export default class ConstructionProjectMap extends LightningElement {
    // Filter values
    selectedPrice = '';
    selectedRooms = '';
    selectedBathrooms = '';
    selectedLocation = '';
    selectedRegion = '';
    selectedPropertyType = '';

    @track allProjects = [];
    @track allUnits = [];

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
        console.log('RECEIVED MSG:', JSON.stringify(message));
        if (message && message.filters) {
            this.selectedPrice = message.filters.price;
            this.selectedRooms = message.filters.rooms;
            this.selectedBathrooms = message.filters.bathrooms;
            this.selectedLocation = message.filters.location;
            this.selectedRegion = message.filters.region;
            this.selectedPropertyType = message.filters.propertyType;

            // Log whenever filters change
            console.log('Selected Projects:', JSON.stringify(this.filteredProjects));
        }
    }

    @wire(getProjectsWithUnits)
    wiredProjects({ error, data }) {
        if (data) {
            this.allProjects = data;
            console.log('Raw projects data:', JSON.stringify(data));

            // Flatten units for filtering
            this.allUnits = [];
            data.forEach(project => {
                if (project.units && project.units.length > 0) {
                    project.units.forEach(unit => {
                        this.allUnits.push({
                            ...unit,
                            projectId: project.id,
                            projectName: project.name,
                            projectTitle: project.title,
                            projectCity: project.city,
                            projectRegion: project.region,
                            projectLatitude: project.latitude,
                            projectLongitude: project.longitude,
                            projectCountry: project.country
                        });
                    });
                }
            });
            console.log('Loaded projects:', this.allProjects.length);
            console.log('Total units:', this.allUnits.length);
            console.log('Map markers:', JSON.stringify(this.mapMarkers));
        } else if (error) {
            console.error('Error loading projects', error);
            console.error('Error details:', JSON.stringify(error));
        }
    }

    get filteredProjects() {
        // If no filters applied, show all projects
        const hasFilters = this.selectedPrice || this.selectedRooms || this.selectedBathrooms ||
            this.selectedLocation || this.selectedRegion || this.selectedPropertyType;

        if (!hasFilters) {
            // Return all projects with their total unit count
            return this.allProjects.map(project => ({
                ...project,
                matchingUnitsCount: project.units ? project.units.length : 0
            }));
        }

        // Filter units based on criteria, then group by project
        const filteredUnits = this.allUnits.filter(unit => {
            // Price filter (unit price)
            if (this.selectedPrice) {
                const [min, max] = this.selectedPrice.split('-').map(Number);
                if (unit.price < min || unit.price > max) {
                    return false;
                }
            }

            // Rooms filter
            if (this.selectedRooms) {
                const rooms = parseInt(this.selectedRooms, 10);
                if (rooms === 5) {
                    if (unit.numberOfRooms < 5) return false;
                } else {
                    if (unit.numberOfRooms !== rooms) return false;
                }
            }

            // Bathrooms filter
            if (this.selectedBathrooms) {
                const bathrooms = parseInt(this.selectedBathrooms, 10);
                if (bathrooms === 3) {
                    if (unit.numberOfBaths < 3) return false;
                } else {
                    if (unit.numberOfBaths !== bathrooms) return false;
                }
            }

            // Location filter (project city)
            if (this.selectedLocation && unit.projectCity !== this.selectedLocation) {
                return false;
            }

            // Region filter (project region)
            if (this.selectedRegion && unit.projectRegion !== this.selectedRegion) {
                return false;
            }

            // Property type filter (unit type)
            if (this.selectedPropertyType && unit.type !== this.selectedPropertyType) {
                return false;
            }

            return true;
        });

        // Group filtered units by project and return unique projects
        const projectMap = new Map();
        filteredUnits.forEach(unit => {
            if (!projectMap.has(unit.projectId)) {
                const project = this.allProjects.find(p => p.id === unit.projectId);
                if (project) {
                    projectMap.set(unit.projectId, {
                        ...project,
                        matchingUnitsCount: 1
                    });
                }
            } else {
                const proj = projectMap.get(unit.projectId);
                proj.matchingUnitsCount++;
            }
        });

        return Array.from(projectMap.values());
    }

    get mapMarkers() {
        return this.filteredProjects
            .filter(project => project.latitude && project.longitude)
            .map(project => {
                const unitText = project.matchingUnitsCount === 1 ? 'unit' : 'units';
                return {
                    location: {
                        Latitude: project.latitude,
                        Longitude: project.longitude,
                        City: project.city,
                        Street: project.street,
                        PostalCode: project.postalCode,
                        Country: project.country
                    },
                    value: project.id,
                    title: project.title || project.name,
                    description: `${project.matchingUnitsCount} ${unitText} available • ${project.region || ''}`,
                    icon: 'standard:location'
                };
            });
    }

    get mapCenter() {
        const markers = this.mapMarkers;
        if (!markers || markers.length === 0) {
            return { location: { Latitude: 51.1657, Longitude: 10.4515 } }; // Center of Germany
        }

        // Calculate center point from all markers
        const latitudes = markers.map(m => m.location.Latitude);
        const longitudes = markers.map(m => m.location.Longitude);

        const avgLat = latitudes.reduce((a, b) => a + b, 0) / latitudes.length;
        const avgLng = longitudes.reduce((a, b) => a + b, 0) / longitudes.length;

        return {
            location: {
                Latitude: avgLat,
                Longitude: avgLng
            }
        };
    }

    get mapZoomLevel() {
        const markers = this.mapMarkers;
        if (!markers || markers.length === 0) {
            return 6;
        }

        if (markers.length === 1) {
            return 12;
        }

        // Calculate the span of coordinates
        const latitudes = markers.map(m => m.location.Latitude);
        const longitudes = markers.map(m => m.location.Longitude);

        const latSpan = Math.max(...latitudes) - Math.min(...latitudes);
        const lngSpan = Math.max(...longitudes) - Math.min(...longitudes);
        const maxSpan = Math.max(latSpan, lngSpan);

        // Determine zoom level based on span (rough approximation)
        if (maxSpan > 10) return 5;
        if (maxSpan > 5) return 6;
        if (maxSpan > 2) return 7;
        if (maxSpan > 1) return 8;
        if (maxSpan > 0.5) return 9;
        if (maxSpan > 0.2) return 10;
        if (maxSpan > 0.1) return 11;
        return 12;
    }

    formatPrice(price) {
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR',
            maximumFractionDigits: 0
        }).format(price);
    }
}