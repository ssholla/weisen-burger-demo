import { LightningElement, track, api, wire } from 'lwc';
//import { projects, constructionPhases, constructionItems, contacts } from './mockData';
import getGanttData from '@salesforce/apex/GanttDataController.getGanttData';

export default class GanttChart extends LightningElement {
    @track startDate = new Date('2026-01-01');
    @track endDate = new Date('2026-04-30');
    @track rows = [];
    
    // Tooltip State
    @track tooltip = {
        visible: false,
        x: 0,
        y: 0,
        title: '',
        start: '',
        end: '',
        owner: '',
        status: ''
    };

    get tooltipStyle() {
        // Offset a bit from cursor
        return `left:${this.tooltip.x + 15}px; top:${this.tooltip.y + 15}px;`;
    }

    _recordId;
    @api 
    get recordId() {
        return this._recordId;
    }
    set recordId(value) {
        console.log('XXX set recordId', value);
        this._recordId = value;
    }

    // Layout Constants
    timelineWidth = 1000; 
    sidebarWidth = 200;
    totalWidth = 1200;
    
    headerHeight = 60; // 30px Month + 30px Week
    rowHeight = 30; // standard row height

    // Theme Colors
    colors = {
        planning: '#f2c960',
        packaging: '#bccd64',
        marketing: '#fc8f66',
        sales: '#5bc0de',
        stats: '#ef5350',
        default: '#ccc'
    };

    // Getters for date inputs (which expect string YYYY-MM)
    get startDateString() {
        return this.startDate.toISOString().slice(0, 7);
    }
    
    get endDateString() {
        return this.endDate.toISOString().slice(0, 7);
    }

    get isReady() {
        return !!this.recordId;
    }

    get hasRows() {
        return this.rows && this.rows.length > 0;
    }

    connectedCallback() {
        console.log('GanttChart connectedCallback');
        console.log('RecordId:', this.recordId);
        //this.recordId = 'a04KY000007cel0YAA';
        this.loadData();
    }

    handleStartDateChange(event) {
        const val = event.target.value;
        if (val) {
            this.startDate = new Date(val + '-01');
            this.loadData();
        }
    }

    handleEndDateChange(event) {
        const val = event.target.value;
        if (val) {
            const [y, m] = val.split('-').map(Number);
            // Set to last day of the month using UTC to match isReady/storage consistency
            // Date.UTC(year, monthIndex, day). monthIndex is 0-based.
            // If val is "2026-04", m is 4. Date.UTC(2026, 4, 0) is last day of month 3 (April).
            this.endDate = new Date(Date.UTC(y, m, 0));
            this.loadData(); 
        }
    }
    
    handleTaskClick(event) {
        // Access data via dataset since we don't have a child component anymore
        const taskId = event.currentTarget.dataset.id;
        
        // Find task details
        let foundTask;
        this.rows.forEach(row => {
            const t = row.items.find(item => item.id === taskId);
            if (t) foundTask = t;
        });
        
        if (foundTask) {
             /* eslint-disable no-alert */
             alert(`Selected: ${foundTask.name}\nContact: ${foundTask.contactName}\nStatus: ${foundTask.status}`);
        }
    }

    handleBarHover(event) {
        const id = event.target.dataset.id;
        const row = this.rows.find(r => r.id === id);
        if (row) {
            this.tooltip = {
                visible: true,
                x: event.clientX, // Will be updated by mousemove
                y: event.clientY,
                title: row.name,
                start: row.startStr,
                end: row.endStr,
                owner: row.owner,
                status: row.status || 'N/A' 
            };
        }
    }

    handleMouseMove(event) {
        if (this.tooltip.visible) {
            // Get container bounds to calc relative position
            const container = this.template.querySelector('.gantt-container');
            const rect = container.getBoundingClientRect();
            
            // Calc X/Y relative to container scrolling
            const relX = event.clientX - rect.left + container.scrollLeft;
            const relY = event.clientY - rect.top; // Standard top
            
            this.tooltip.x = relX;
            this.tooltip.y = relY;
        }
    }
    
    hideTooltip() {
        this.tooltip.visible = false;
    }

    get totalDays() {
        const diffTime = Math.abs(this.endDate - this.startDate);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 
    }

    get pixelsPerDay() {
        return this.totalDays > 0 ? this.timelineWidth / this.totalDays : 0;
    }

    // --- TIMELINE / AXIS GENERATION ---

    get axisMonths() {
        const months = [];
        let curr = new Date(this.startDate);
        curr.setDate(1); // Align to month start
        
        // Safety break
        let loops = 0;
        
        while (curr <= this.endDate && loops < 60) {
            loops++;
            const startOfMonth = new Date(curr);
            const endOfMonth = new Date(curr.getFullYear(), curr.getMonth() + 1, 0); // Last day of month
            
            // Clip to view range
            const visibleStart = startOfMonth < this.startDate ? this.startDate : startOfMonth;
            // Visible end shouldn't exceed the global end date
            const visibleEnd = endOfMonth > this.endDate ? this.endDate : endOfMonth;

            // If the month is completely outside (e.g. started before start and ended before start)
            // But the loop condition curr <= endDate handles start.
            // We just need to check if visibleStart > visibleEnd (which implies no overlap)
            if (visibleStart <= visibleEnd) {
                const x = this.dateToX(visibleStart);
                const width = this.dateToX(visibleEnd) - x + this.pixelsPerDay; // Include the last day width? roughly

                // Only add if it has width and is within bounds (approx)
                if (width > 0) {
                     // Ensure text doesn't bleed into sidebar (left edge)
                     // Estimate half-text width approx 25px
                     let centerX = this.sidebarWidth + x + (width / 2);
                     const minCenter = this.sidebarWidth + 25;
                     if (centerX < minCenter) centerX = minCenter;
                     
                     months.push({
                        key: `m-${curr.getTime()}`,
                        label: curr.toLocaleString('default', { month: 'long' }),
                        x: this.sidebarWidth + x,
                        width: width,
                        center: centerX
                    });
                }
            }
            curr.setMonth(curr.getMonth() + 1);
        }
        return months;
    }

    get axisWeeks() {
        const weeks = [];
        let curr = new Date(this.startDate);
        curr.setDate(1); // Set to start of the Month containing startDate (or just generally iterate months)
        
        // Backtrack to startDate's actual Month Start if startDate is mid-month
        // e.g. Start Jan 15. curr becomes Jan 1. Correct.
        
        let loops = 0;
        // Iterate months until we pass endDate
        while (curr <= this.endDate && loops < 60) {
            loops++;
            
            const monthStart = new Date(curr);
            const monthEnd = new Date(curr.getFullYear(), curr.getMonth() + 1, 0); 
            
            // Calc X positions for the entire month (might be out of view)
            const mStartX = this.dateToX(monthStart);
            const mEndX = this.dateToX(monthEnd);
            
            // Width of the month in pixels
            // We use pixelsPerDay * daysInMonth roughly
            // Or just difference in X
            // Note: dateToX depends on time difference.
            // mEndX corresponds to 00:00 of the last day? 
            // Usually we want the END of the last day.
            // dateToX(Jan 31 00:00) vs dateToX(Feb 1 00:00).
            // A month visual block typically spans to the start of next month.
            const nextMonthStart = new Date(curr.getFullYear(), curr.getMonth() + 1, 1);
            const nextMStartX = this.dateToX(nextMonthStart);
            
            const monthWidth = nextMStartX - mStartX;
            const quarterWidth = monthWidth / 4;
            
            for (let i = 0; i < 4; i++) {
                // Fixed geometric center for the Quarter
                const regionLeft = mStartX + (i * quarterWidth);
                const regionRight = regionLeft + quarterWidth;
                
                const fixedCenter = regionLeft + (quarterWidth / 2);
                
                // Check Visibility of this "Quarter Week"
                // It is visible if it intersects with [0, timelineWidth]
                // (Since 0 is startDate, timelineWidth is endDate approx)
                
                if (regionRight > 0 && regionLeft < this.timelineWidth) {
                    // It is visible
                    let labelX = this.sidebarWidth + fixedCenter;
                    
                    // Clamp to Sidebar if overlapping
                    const minX = this.sidebarWidth + 15;
                    if (labelX < minX) {
                        labelX = minX; 
                    }
                    
                    weeks.push({
                        key: `w-${monthStart.getTime()}-${i}`,
                        label: `W${i+1}`,
                        x: labelX
                    });
                }
            }

            // Next Month
            curr.setMonth(curr.getMonth() + 1);
        }
        return weeks;
    }

    get axisWeekLines() {
        const lines = [];
        let curr = new Date(this.startDate);
        curr.setDate(1); 
        
        let loops = 0;
        // Iterate months until we pass endDate
        while (curr <= this.endDate && loops < 60) {
            loops++;
            
            const monthStart = new Date(curr);
            const mStartX = this.dateToX(monthStart);
            
            const nextMonthStart = new Date(curr.getFullYear(), curr.getMonth() + 1, 1);
            const nextMStartX = this.dateToX(nextMonthStart);
            
            const monthWidth = nextMStartX - mStartX;
            const quarterWidth = monthWidth / 4;
            
            // We want lines at 25%, 50%, 75% of the month
            for (let i = 1; i < 4; i++) {
                const lineX = mStartX + (i * quarterWidth);
                
                // Visible check
                if (lineX > 0 && lineX < this.timelineWidth) {
                     lines.push({
                         key: `wl-${curr.getTime()}-${i}`,
                         x: this.sidebarWidth + lineX
                     });
                }
            }
            curr.setMonth(curr.getMonth() + 1);
        }
        return lines;
    }

    get axisGridLines() {
        // Vertical lines for Months
        return this.axisMonths.map(m => ({
            key: `grid-${m.key}`,
            x: m.x,
            y1: 0,
            y2: this.totalHeight
        }));
    }

    dateToX(date) {
        const start = new Date(this.startDate);
        const diffTime = date - start;
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        return diffDays * this.pixelsPerDay;
    }

    // --- DATA LOADING & TRANSFORMATION ---
    @wire(getGanttData, { recordId: '$recordId' })
    wiredGantt({ error, data }) {
        if (data) {
            if (data.error) {
                console.error('Apex Error:', data.error);
            }
            // always transform, even if empty, to ensure state consistency
            this._phases = data.phases || [];
            this._items = data.items || [];
            
            this.setViewDatesFromData(); // Auto-scale
            this.transformDataToRows();
        } else if (error) {
            console.error('Wire Error:', error);
            this._phases = [];
            this._items = [];
            this.transformDataToRows();
        }
    }

    setViewDatesFromData() {
        let minTime = Infinity;
        let maxTime = -Infinity;
        let found = false;

        const processList = (list) => {
            if (!list) return;
            list.forEach(obj => {
                const s = obj.StartDate || obj.startDate;
                const e = obj.EndDate || obj.endDate;
                if (s) {
                    const t = new Date(s).getTime();
                    if (t < minTime) minTime = t;
                    found = true;
                }
                if (e) {
                    const t = new Date(e).getTime();
                    if (t > maxTime) maxTime = t;
                    found = true;
                }
            });
        };

        processList(this._phases);
        processList(this._items);

        if (found) {
            // Add buffer: Start of month for min, End of month for max
            const minD = new Date(minTime);
            // Go back 1 month for padding? Or just start of this month.
            // User probably wants to see the start.
            const newStart = new Date(minD.getFullYear(), minD.getMonth(), 1);

            const maxD = new Date(maxTime);
            // End of this month
            const newEnd = new Date(maxD.getFullYear(), maxD.getMonth() + 1, 0);
            
            // Add slight buffer if start == end or very close
            if (newEnd.getTime() <= newStart.getTime()) {
                newEnd.setMonth(newEnd.getMonth() + 1);
            }

            this.startDate = newStart;
            this.endDate = newEnd;
            console.log('Auto-scaled Dates:', this.startDate, this.endDate);
        }
    }

    // Called on connected or when dates change
    loadData() {
        // Only run transform if we have data
        if (this._phases) {
            this.transformDataToRows();
        }
    }

    transformDataToRows() {
        let phases = this._phases || [];
        const items = this._items || [];

        // 1. TOPOLOGICAL SORT of Phases
        const phaseMap = new Map();
        phases.forEach(p => phaseMap.set(p.Id || p.id, p));

        const adj = new Map();
        const inDegree = new Map();

        phases.forEach(p => {
             const u = p.Id || p.id;
             if (!inDegree.has(u)) inDegree.set(u, 0);

             const v = p.LinkedPhaseId || p.linkedPhaseId || p.KS_LinkedPhase__c;
             if (v) {
                 if (!adj.has(u)) adj.set(u, []);
                 adj.get(u).push(v);
                 inDegree.set(v, (inDegree.get(v) || 0) + 1);
             }
        });

        const sortedPhases = [];
        const queue = [];
        inDegree.forEach((degree, id) => {
            if (degree === 0) queue.push(id);
        });
        
        queue.sort((a,b) => {
            const pA = phaseMap.get(a);
            const pB = phaseMap.get(b);
            return new Date(pA.StartDate || pA.startDate) - new Date(pB.StartDate || pB.startDate);
        });

        const visited = new Set();
        while(queue.length > 0) {
            const u = queue.shift();
            if (visited.has(u)) continue;
            
            visited.add(u);
            const phase = phaseMap.get(u);
            if (phase) sortedPhases.push(phase);
            
            const neighbors = adj.get(u) || [];
            neighbors.forEach(v => {
                inDegree.set(v, inDegree.get(v) - 1);
                if (inDegree.get(v) === 0) {
                    queue.push(v);
                }
            });
        }
        
        phases.forEach(p => {
            const id = p.Id || p.id;
            if (!visited.has(id)) sortedPhases.push(p);
        });
        phases = sortedPhases;

        const predecessorMap = new Map();
        phases.forEach(p => {
             const pId = p.Id || p.id;
             const link = p.LinkedPhaseId || p.linkedPhaseId || p.KS_LinkedPhase__c;
             if (link) predecessorMap.set(link, pId);
        });

        let displayRows = [];
        let yOffset = 20; // Removed headerHeight logic from logic, handled by SVG y coords usually? 
        // Note: In SVG, y=0 is top. The HTML Header is separate <div>.
        // So SVG y=0 is strictly chart area.
        // BUT my SVG includes the header rect inside it (y=0-60). 
        // So yOffset must start BELOW 60.
        yOffset = this.headerHeight + 20;

        phases.forEach((phase, phaseIndex) => {
            const phaseId = phase.Id || phase.id;
            const phaseName = phase.Name || phase.name;
            const themeColors = Object.values(this.colors);
            const phaseColor = themeColors[phaseIndex % themeColors.length];

            const start = new Date(phase.StartDate || phase.startDate);
            const end = new Date(phase.EndDate || phase.endDate);
            
            const pStartX = this.dateToX(start);
            const pEndX = this.dateToX(end); 
            
            const isPhaseVisible = (pEndX >= 0 && pStartX <= this.timelineWidth);
            
            // Allow phase if items are visible? 
            if (!isPhaseVisible) {
                const phaseItemsCheck = items.filter(i => (i.PhaseId || i.phaseId) === phaseId);
                const anyItemVisible = phaseItemsCheck.some(i => {
                    const iS = this.dateToX(new Date(i.StartDate || i.startDate));
                    const iE = this.dateToX(new Date(i.EndDate || i.endDate));
                    return (iE >= 0 && iS <= this.timelineWidth);
                });
                if (!anyItemVisible && (pEndX < 0 || pStartX > this.timelineWidth)) return; 
            }

            const phaseDrawX = Math.max(0, pStartX);
            const phaseDrawEnd = Math.min(this.timelineWidth, pEndX);
            const phaseW = Math.max(0, phaseDrawEnd - phaseDrawX);
            const visiblePhaseW = (phaseW < 5 && isPhaseVisible) ? 5 : phaseW;

            const phaseItems = items.filter(i => (i.PhaseId || i.phaseId) === phaseId);
            let phaseOwnerName = (phase.OwnerName || phase.ownerName) || ''; 
            if (!phaseOwnerName && phaseItems.length > 0) {
                  phaseOwnerName = phaseItems[0].ContactName || '';
            }
            const phaseStatus = phase.Status || phase.status || phase.KS_Status__c || '';
            
            displayRows.push({
                id: phaseId,
                type: 'phase',
                name: phaseName,
                y: yOffset,
                height: this.rowHeight,
                barX: this.sidebarWidth + phaseDrawX, 
                barY: yOffset + 5,
                barW: visiblePhaseW,
                barH: 14,
                color: phaseColor,
                owner: phaseOwnerName, 
                isPhase: true,
                startStr: start.toLocaleDateString(),
                endStr: end.toLocaleDateString(),
                status: phaseStatus
            });
            
            // Phase-to-Phase Connector
            const derivedPrevId = predecessorMap.get(phaseId);
            const prevId = derivedPrevId || phase.PreviousPhaseId || phase.previousPhaseId; 

            if (prevId) {
                const prevPhaseRow = displayRows.find(r => r.id === prevId && r.isPhase);
                if (prevPhaseRow) {
                    const startX = prevPhaseRow.barX;
                    const startY = prevPhaseRow.barY + (prevPhaseRow.barH / 3);
                    const currentPhaseRow = displayRows[displayRows.length - 1];
                    const targetX = currentPhaseRow.barX; 
                    const endY = yOffset + 5 + 7;
                    
                    let midX = Math.min(startX, targetX) - 35;
                    if (midX < this.sidebarWidth + 5) midX = this.sidebarWidth + 5; 
                    
                    const connectorPath = `M ${startX},${startY} H ${midX} V ${endY} H ${targetX}`;
                    currentPhaseRow.connector = connectorPath;
                    currentPhaseRow.connectorColor = '#ccc';
                }
            }
            
            yOffset += this.rowHeight;

            // 2. CHILD TASK ROWS
            phaseItems.forEach((item, itemIndex) => { // eslint-disable-line no-unused-vars
                const itemStart = new Date(item.StartDate || item.startDate);
                const itemEnd = new Date(item.EndDate || item.endDate);
                
                const iStartX = this.dateToX(itemStart);
                const iEndX = this.dateToX(itemEnd);
                
                if (iEndX < 0 || iStartX > this.timelineWidth) return;
                
                const iDrawX = Math.max(0, iStartX);
                const iDrawEnd = Math.min(this.timelineWidth, iEndX);
                let iW = Math.max(0, iDrawEnd - iDrawX);
                
                // --- 1-DAY BUBBLE LOGIC ---
                const sameDay = itemStart.getTime() === itemEnd.getTime();
                if (iW < 10 && sameDay) {
                    iW = 12; // Bubble
                } else if (iW < 5) {
                    iW = 5;
                }

                // --- CONNECTOR LOGIC (TREE STYLE) ---
                // Always connect to Parent Phase
                let connectorPath = '';
                const phaseRow = displayRows.find(r => r.id === phaseId && r.isPhase);
                
                if (phaseRow) {
                    // Start from Phase Bottom-ish
                    const startX = phaseRow.barX; // Align with phase start
                    const startY = phaseRow.barY + phaseRow.barH; 
                    
                    const endX = this.sidebarWidth + iDrawX; // To Task Start
                    const endY = yOffset + 10; // To Task Middle Y
                    
                    // Simple L-shape / Vertical drop
                    // M startX,startY V endY H endX
                    // But maybe offset startX slightly?
                    // Let's use strict phase start alignment
                    connectorPath = `M ${startX},${startY} V ${endY} H ${endX}`;
                }

                let ownerName = item.CreatedBy ? item.CreatedBy.Name : (item.createdByName || '');
                if (!ownerName) {
                    const randomPool = ['Mike Smith', 'Alan Childers', 'Jeniffer Jones', 'Candy Lewis', 'Sam Watson'];
                    const seed = (item.Id || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + itemIndex;
                    ownerName = randomPool[seed % randomPool.length];
                }

                const itemStatus = item.Status || item.status || item.KS_Status__c || '';

                displayRows.push({
                    id: item.Id || item.id,
                    type: 'task',
                    name: item.Name || item.name,
                    y: yOffset,
                    height: this.rowHeight,
                    barX: this.sidebarWidth + iDrawX,
                    barY: yOffset + 6,
                    barW: iW,
                    barH: 8, 
                    rx: sameDay ? 6 : 4,
                    color: this.lightenColor(phaseColor, 40), 
                    fillColor: this.lightenColor(phaseColor, 40),
                    isTask: true,
                    connector: connectorPath,
                    connectorColor: phaseColor, // Color match parent
                    owner: ownerName,
                    startStr: itemStart.toLocaleDateString(),
                    endStr: itemEnd.toLocaleDateString(),
                    status: itemStatus
                });
                
                yOffset += this.rowHeight;
            });
            
            yOffset += 10;
        });
        
        this.rows = displayRows;
        this.totalHeight = yOffset + 50;
    }

    // Helper to lighten color
    lightenColor(hex, percent) {
        // Parse hex
        let str = hex.replace('#', '');
        if (str.length === 3) str = str.split('').map(c => c + c).join('');
        
        const num = parseInt(str, 16);
        const r = (num >> 16);
        const g = (num >> 8 & 0x00FF);
        const b = (num & 0x0000FF);
        
        // Mix with white
        // New = Current + (255 - Current) * Factor
        const factor = percent / 100;
        
        const newR = Math.round(r + (255 - r) * factor);
        const newG = Math.round(g + (255 - g) * factor);
        const newB = Math.round(b + (255 - b) * factor);
        
        // Convert back
        return '#' + ((1 << 24) + (newR << 16) + (newG << 8) + newB).toString(16).slice(1);
    }
    
    totalHeight = 600;

    // ... (remove old getters if conflicting)
}