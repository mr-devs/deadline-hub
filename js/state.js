/**
 * @file js/state.js
 * @description Centralized state management for the Deadline Hub application.
 * Manages global application state including deadlines data and filter selections.
 */

class AppState {
    constructor() {
        this.deadlines = [];
        this.selectedSubmissionTypes = [];
        this.selectedVenueTypes = [];
        this.selectedArchivalTypes = [];
    }

    setDeadlines(data) {
        this.deadlines = data.map((item, index) => ({ ...item, id: index }));
    }

    getDeadlines() {
        return this.deadlines;
    }

    getSelectedSubmissionTypes() {
        return [...this.selectedSubmissionTypes];
    }

    getSelectedVenueTypes() {
        return [...this.selectedVenueTypes];
    }

    getSelectedArchivalTypes() {
        return [...this.selectedArchivalTypes];
    }

    toggleSubmissionType(type) {
        const index = this.selectedSubmissionTypes.indexOf(type);
        if (index > -1) {
            this.selectedSubmissionTypes.splice(index, 1);
        } else {
            this.selectedSubmissionTypes.push(type);
        }
    }

    toggleVenueType(type) {
        const index = this.selectedVenueTypes.indexOf(type);
        if (index > -1) {
            this.selectedVenueTypes.splice(index, 1);
        } else {
            this.selectedVenueTypes.push(type);
        }
    }

    toggleArchivalType(type) {
        const index = this.selectedArchivalTypes.indexOf(type);
        if (index > -1) {
            this.selectedArchivalTypes.splice(index, 1);
        } else {
            this.selectedArchivalTypes.push(type);
        }
    }

    clearAllFilters() {
        this.selectedSubmissionTypes = [];
        this.selectedVenueTypes = [];
        this.selectedArchivalTypes = [];
    }

}

export const appState = new AppState();