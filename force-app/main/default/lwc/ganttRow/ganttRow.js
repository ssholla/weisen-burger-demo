import { LightningElement, api } from 'lwc';

export default class GanttRow extends LightningElement {
    @api phase; // Object with items array
    @api pixelsPerDay = 0;
    @api rangeStart; // Date object
    @api rowHeight = 100; // px height of this row

    get tasks() {
        return this.phase && this.phase.items ? this.phase.items : [];
    }

    get rowTransform() {
        // Vertical positioning handled by parent iteration or layout. 
        // This component renders the CONTENT of the row.
        return `translate(0, 0)`; 
    }
}