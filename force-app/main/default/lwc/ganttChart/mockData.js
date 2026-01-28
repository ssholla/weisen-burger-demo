// Mock Data for Gantt Prototype

export const projects = [
    { id: 'PR1', name: 'Downtown Condo Project' }
];

export const contacts = [
    { id: 'C1', name: 'Bob Johnson', email: 'bob@example.com' },
    { id: 'C2', name: 'Henry Leblanc', email: 'henry@example.com' },
    { id: 'C3', name: 'Anne Hopkins', email: 'anne@example.com' },
    { id: 'C4', name: 'Benjamin Otterson', email: 'ben@example.com' },
    { id: 'C5', name: 'Kathy Gaines', email: 'kathy@example.com' }
];

export const constructionPhases = [
    { id: 'P1', projectId: 'PR1', name: 'Planning', startDate: '2026-01-01', endDate: '2026-01-31', ownerId: 'U1' },
    { id: 'P2', projectId: 'PR1', name: 'Packaging', startDate: '2026-02-01', endDate: '2026-02-28', ownerId: 'U2', previousPhaseId: 'P1' },
    { id: 'P3', projectId: 'PR1', name: 'Marketing', startDate: '2026-02-15', endDate: '2026-03-31', ownerId: 'U3', previousPhaseId: 'P2' },
    { id: 'P4', projectId: 'PR1', name: 'Sales', startDate: '2026-03-01', endDate: '2026-04-30', ownerId: 'U4' },
    { id: 'P5', projectId: 'PR1', name: 'Collect Statistics', startDate: '2026-01-15', endDate: '2026-04-15', ownerId: 'U5' }
];

export const constructionItems = [
    { id: 'T1', phaseId: 'P1', name: 'Set up team', startDate: '2026-01-01', endDate: '2026-01-10', status: 'Completed', contactId: 'C1' },
    { id: 'T2', phaseId: 'P1', name: 'Set up budget', startDate: '2026-01-10', endDate: '2026-01-20', status: 'Completed', contactId: 'C1' },
    { id: 'T3', phaseId: 'P1', name: 'Prepare launch plan', startDate: '2026-01-20', endDate: '2026-01-30', status: 'In Progress', contactId: 'C1' },

    { id: 'T4', phaseId: 'P2', name: 'Prepare brief', startDate: '2026-02-01', endDate: '2026-02-10', status: 'In Progress', contactId: 'C2' },
    { id: 'T5', phaseId: 'P2', name: 'Develop ideas', startDate: '2026-02-11', endDate: '2026-02-25', status: 'Not Started', contactId: 'C2' },
    { id: 'T12', phaseId: 'P2', name: 'Review process', startDate: '2026-03-20', endDate: '2026-04-10', status: 'Not Started', contactId: 'C2' },


    { id: 'T6', phaseId: 'P3', name: 'Prepare brief', startDate: '2026-02-15', endDate: '2026-02-28', status: 'Not Started', contactId: 'C3' },
    { id: 'T7', phaseId: 'P3', name: 'Develop ideas', startDate: '2026-03-01', endDate: '2026-03-20', status: 'Not Started', contactId: 'C3' },

    { id: 'T8', phaseId: 'P4', name: 'Brief sales force', startDate: '2026-03-01', endDate: '2026-03-15', status: 'Not Started', contactId: 'C4' },
    { id: 'T9', phaseId: 'P4', name: 'Sales Channels', startDate: '2026-03-10', endDate: '2026-04-20', status: 'Not Started', contactId: 'C4' },

    { id: 'T10', phaseId: 'P5', name: 'Sales figures', startDate: '2026-01-20', endDate: '2026-04-01', status: 'In Progress', contactId: 'C5' },
    { id: 'T11', phaseId: 'P5', name: 'New leads', startDate: '2026-02-10', endDate: '2026-03-15', status: 'Not Started', contactId: 'C5' }];