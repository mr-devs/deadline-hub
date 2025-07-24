/**
 * @file js/state.js
 * @description Centralized state management for the Deadline Hub application.
 * Manages global application state including deadlines data and filter selections.
 */

class AppState {
    constructor() {
        this.deadlines = [];
        this.selectedTopics = [];
        this.selectedSubmissionTypes = [];
        this.selectedVenueTypes = [];
        this.selectedArchivalTypes = [];
        this.isInitialized = false;
    }

    setDeadlines(data) {
        this.deadlines = data.map((item, index) => ({ ...item, id: index }));
        this.isInitialized = true;
    }

    getDeadlines() {
        return this.deadlines;
    }

    getSelectedTopics() {
        return [...this.selectedTopics];
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

    toggleTopic(topic) {
        const index = this.selectedTopics.indexOf(topic);
        if (index > -1) {
            this.selectedTopics.splice(index, 1);
        } else {
            this.selectedTopics.push(topic);
        }
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
        this.selectedTopics = [];
        this.selectedSubmissionTypes = [];
        this.selectedVenueTypes = [];
        this.selectedArchivalTypes = [];
    }

    isReady() {
        return this.isInitialized;
    }
}

export const appState = new AppState();