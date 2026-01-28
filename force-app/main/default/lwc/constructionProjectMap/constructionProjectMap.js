import { LightningElement, wire, track } from 'lwc';
import { subscribe, MessageContext } from 'lightning/messageService';
import getProjects from '@salesforce/apex/ConstructionProjectsController.getProjects';
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

    @wire(getProjects)
    wiredProjects({ error, data }) {
        if (data) {
            this.allProjects = data;
            // At initial load since we dont have any filters we can load all projects
            console.log('Selected Projects:', JSON.stringify(this.filteredProjects));
        } else if (error) {
            console.error('Error loading projects', error);
        }
    }

    get filteredProjects() {
        return this.allProjects.filter(project => {
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
    }

    get mapMarkers() {
        return this.filteredProjects.map(project => ({
            location: {
                City: project.location,
                Country: 'Germany',
            },
            value: project.id,
            title: project.title,
            description: `${project.propertyType} - ${this.formatPrice(project.price)}`,
            icon: 'custom:custom24'
        }));
    }

    formatPrice(price) {
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR',
            maximumFractionDigits: 0
        }).format(price);
    }
}