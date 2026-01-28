import { LightningElement, api } from 'lwc';

export default class GanttTask extends LightningElement {
    @api task;
    @api pixelsPerDay = 0;
    @api rangeStart;
    @api verticalOffset = 0; // Index to stagger usage

    get x() {
        if (!this.task || !this.rangeStart || !this.pixelsPerDay) return 0;
        const start = new Date(this.task.startDate);
        const rangeStart = new Date(this.rangeStart);
        
        const diffTime = start - rangeStart;
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        
        return diffDays * this.pixelsPerDay;
    }

    get width() {
        if (!this.task || !this.pixelsPerDay) return 0;
        const start = new Date(this.task.startDate);
        const end = new Date(this.task.endDate);
        
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        
        return Math.max(5, diffDays * this.pixelsPerDay);
    }

    get y() {
         // Simple staggering: 25px per task, start at 30px down (below phase label)
         return 30 + (this.verticalOffset * 30);
    }

    get color() {
        switch((this.task.status || '').toLowerCase()) {
            case 'completed': return '#4bca81'; // green
            case 'in progress': return '#ffb75d'; // orange
            case 'not started': return '#0070d2'; // blue
            default: return '#ccc';
        }
    }

    get ariaLabel() {
         return `${this.task.name}, Contact: ${this.task.contactName}, Status: ${this.task.status}, Start: ${this.task.startDate}, End: ${this.task.endDate}`;
    }

    handleKeyUp(event) {
        if (event.code === 'Enter' || event.code === 'Space') {
            event.preventDefault(); // Prevent scrolling for space
            this.handleClick();
        }
    }

    get transform() {
        return `translate(${this.x}, ${this.y})`;
    }

    handleClick() {
        this.dispatchEvent(new CustomEvent('taskselected', {
            detail: { taskId: this.task.id },
            bubbles: true,
            composed: true
        }));
    }
}