import { LightningElement, wire } from 'lwc';
import { publish, MessageContext } from 'lightning/messageService';
import PROJECT_FILTERS from '@salesforce/messageChannel/ProjectFilters__c';
import getLocations from '@salesforce/apex/LocationService.getLocations';

export default class ConstructionProjectFilters extends LightningElement {
    selectedPrice = '';
    selectedRooms = '';
    selectedBathrooms = '';
    selectedLocation = '';
    selectedRegion = '';
    selectedPropertyType = '';

    // dynamic location options populated from Apex
    _locationOptions = [
        { label: 'All Projects', value: '' }
    ];

    @wire(MessageContext)
    messageContext;

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
        return this._locationOptions;
    }

    @wire(getLocations)
    wiredLocations({ data, error }) {
        if (data) {
            this._locationOptions = [
                { label: 'All Projects', value: '' },
                ...data.map((loc) => ({ label: loc, value: loc }))
            ];
        } else if (error) {
            this._locationOptions = [
                { label: 'All Projects', value: '' }
            ];
        }
    }

    get regionOptions() {
        return [
            { label: 'All Projects', value: '' },
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

    handlePriceChange(event) {
        this.selectedPrice = event.detail.value;
        this.publishFilters();
    }

    handleRoomsChange(event) {
        this.selectedRooms = event.detail.value;
        this.publishFilters();
    }

    handleBathroomsChange(event) {
        this.selectedBathrooms = event.detail.value;
        this.publishFilters();
    }

    handleLocationChange(event) {
        this.selectedLocation = event.detail.value;
        this.publishFilters();
    }

    handleRegionChange(event) {
        this.selectedRegion = event.detail.value;
        this.publishFilters();
    }

    handlePropertyTypeChange(event) {
        this.selectedPropertyType = event.detail.value;
        this.publishFilters();
    }

    handleClearFilters() {
        this.selectedPrice = '';
        this.selectedRooms = '';
        this.selectedBathrooms = '';
        this.selectedLocation = '';
        this.selectedRegion = '';
        this.selectedPropertyType = '';
        this.publishFilters();
    }

    publishFilters() {
        const filters = {
            price: this.selectedPrice,
            rooms: this.selectedRooms,
            bathrooms: this.selectedBathrooms,
            location: this.selectedLocation,
            region: this.selectedRegion,
            propertyType: this.selectedPropertyType
        };
        publish(this.messageContext, PROJECT_FILTERS, { filters });
    }
}
