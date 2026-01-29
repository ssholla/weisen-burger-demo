import { LightningElement, track, wire } from 'lwc';
import { subscribe, MessageContext } from 'lightning/messageService';
import getFilteredProjects from '@salesforce/apex/MapController.getFilteredProjects';
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

    @wire(MessageContext)
    messageContext;

    subscription = null;

    connectedCallback() {
        this.subscribeToMessageChannel();
        this.loadProjects();
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
            this.selectedPrice = message.filters.price || '';
            this.selectedRooms = message.filters.rooms || '';
            this.selectedBathrooms = message.filters.bathrooms || '';
            this.selectedLocation = message.filters.location || '';
            this.selectedRegion = message.filters.region || '';
            this.selectedPropertyType = message.filters.propertyType || '';

            // Reload projects with new filters
            this.loadProjects();
        }
    }

    get resultCount() {
        return this.allProjects ? this.allProjects.length : 0;
    }

    get resultLabel() {
        return this.resultCount === 1 ? 'Project on Map' : 'Projects on Map';
    }

    loadProjects() {
        console.log('Loading projects with filters:', {
            price: this.selectedPrice,
            rooms: this.selectedRooms,
            bathrooms: this.selectedBathrooms,
            location: this.selectedLocation,
            region: this.selectedRegion,
            propertyType: this.selectedPropertyType
        });

        getFilteredProjects({
            priceRange: this.selectedPrice || null,
            rooms: this.selectedRooms || null,
            bathrooms: this.selectedBathrooms || null,
            location: this.selectedLocation || null,
            region: this.selectedRegion || null,
            propertyType: this.selectedPropertyType || null
        })
            .then(data => {
                this.allProjects = data;
                console.log('Loaded projects:', data.length);
                console.log('Map markers count:', this.mapMarkers.length);
            })
            .catch(error => {
                console.error('Error loading projects:', error);
                console.error('Error details:', JSON.stringify(error));
            });
    }

    get mapMarkers() {
        return this.allProjects
            .filter(project => project.latitude && project.longitude)
            .map(project => {
                const matchingUnitsCount = project.units ? project.units.length : 0;
                const unitText = matchingUnitsCount === 1 ? 'unit' : 'units';
                const totalPriceFormatted = project.totalPrice ? this.formatPrice(project.totalPrice) : 'N/A';
                const totalM2Formatted = project.totalM2 ? `${project.totalM2.toLocaleString('de-DE')} m²` : 'N/A';

                // Create rich HTML description using supported tags
                let description = '';

                // Location info
                if (project.region) {
                    description += `<p><small><mark>📍 ${project.region}</mark></small></p>`;
                }
                if (project.street || project.city) {
                    const addressLine = [project.street, project.postalCode, project.city].filter(Boolean).join(' ');
                    description += `<p><em>${addressLine}</em></p>`;
                }

                description += '<br>';

                // Stats with emphasis
                description += `<p><strong>📊 Available Units:</strong> <b>${matchingUnitsCount}</b> ${unitText}</p>`;
                description += `<p><strong>📐 Total Area:</strong> ${totalM2Formatted}</p>`;
                description += `<p><strong>💰 Total Value:</strong> ${totalPriceFormatted}</p>`;

                if (project.status) {
                    description += `<br><p><mark><strong>✓ ${project.status}</strong></mark></p>`;
                }

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
                    description: description,
                    // mapIcon: {
                    //     path: 'M18,10v54h9V53c0-0.553,0.447-1,1-1h8c0.553,0,1,0.447,1,1v11h9V20V4c0-2.211-1.789-4-4-4H22 c-2.211,0-4,1.789-4,4V10z M34,9c0-0.553,0.447-1,1-1h4c0.553,0,1,0.447,1,1v4c0,0.553-0.447,1-1,1h-4c-0.553,0-1-0.447-1-1V9z M34,19c0-0.553,0.447-1,1-1h4c0.553,0,1,0.447,1,1v4c0,0.553-0.447,1-1,1h-4c-0.553,0-1-0.447-1-1V19z M34,29c0-0.553,0.447-1,1-1 h4c0.553,0,1,0.447,1,1v4c0,0.553-0.447,1-1,1h-4c-0.553,0-1-0.447-1-1V29z M34,39c0-0.553,0.447-1,1-1h4c0.553,0,1,0.447,1,1v4 c0,0.553-0.447,1-1,1h-4c-0.553,0-1-0.447-1-1V39z M24,9c0-0.553,0.447-1,1-1h4c0.553,0,1,0.447,1,1v4c0,0.553-0.447,1-1,1h-4 c-0.553,0-1-0.447-1-1V9z M24,19c0-0.553,0.447-1,1-1h4c0.553,0,1,0.447,1,1v4c0,0.553-0.447,1-1,1h-4c-0.553,0-1-0.447-1-1V19z M24,29c0-0.553,0.447-1,1-1h4c0.553,0,1,0.447,1,1v4c0,0.553-0.447,1-1,1h-4c-0.553,0-1-0.447-1-1V29z M24,39c0-0.553,0.447-1,1-1 h4c0.553,0,1,0.447,1,1v4c0,0.553-0.447,1-1,1h-4c-0.553,0-1-0.447-1-1V39z M16,10H4c-2.211,0-4,1.789-4,4v46c0,2.211,1.789,4,4,4h12V10z M12,53c0,0.553-0.447,1-1,1H7 c-0.553,0-1-0.447-1-1v-4c0-0.553,0.447-1,1-1h4c0.553,0,1,0.447,1,1V53z M12,43c0,0.553-0.447,1-1,1H7c-0.553,0-1-0.447-1-1v-4 c0-0.553,0.447-1,1-1h4c0.553,0,1,0.447,1,1V43z M12,33c0,0.553-0.447,1-1,1H7c-0.553,0-1-0.447-1-1v-4c0-0.553,0.447-1,1-1h4 c0.553,0,1,0.447,1,1V33z M11,24H7c-0.553,0-1-0.447-1-1v-4c0-0.553,0.447-1,1-1h4c0.553,0,1,0.447,1,1v4 C12,23.553,11.553,24,11,24z M60,20H48v44h12c2.211,0,4-1.789,4-4V24C64,21.789,62.211,20,60,20z M58,53c0,0.553-0.447,1-1,1h-4 c-0.553,0-1-0.447-1-1v-4c0-0.553,0.447-1,1-1h4c0.553,0,1,0.447,1,1V53z M58,43c0,0.553-0.447,1-1,1h-4c-0.553,0-1-0.447-1-1v-4 c0-0.553,0.447-1,1-1h4c0.553,0,1,0.447,1,1V43z M58,33c0,0.553-0.447,1-1,1h-4c-0.553,0-1-0.447-1-1v-4c0-0.553,0.447-1,1-1h4 c0.553,0,1,0.447,1,1V33z',
                    //     fillColor: '#1a4d8f',
                    //     fillOpacity: 1,
                    //     strokeWeight: 0,
                    //     scale: 0.6,
                    //     anchor: { x: 32, y: 32 }
                    // }
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