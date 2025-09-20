import { LightningElement, track, wire } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import startTimerApex from '@salesforce/apex/TimeEntryController.startTimer';
import stopTimerApex from '@salesforce/apex/TimeEntryController.stopTimer';
import getTodayEntries from '@salesforce/apex/TimeEntryController.getTodayEntries';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getProjects from '@salesforce/apex/ProjectController.getProjects';

export default class TimeTracker extends LightningElement {

    @track selectedProject;
    @track task = '';
    @track timeEntries;
    @track columns = [
        { label: 'Project', fieldName: 'ProjectName' },
        { label: 'Task', fieldName: 'Task__c' },
        { label: 'Start Time', fieldName: 'Start_Time_Formatted' },
        { label: 'End Time', fieldName: 'End_Time_Formatted' },
        { label: 'Duration', fieldName: 'Duration_Display__c' }
    ];

    @track projectOptions = [];
    @track wiredDataResult;
    @track runningEntry;
    @track elapsedTime = '00:00:00';
    timerInterval;

    @wire(getTodayEntries)
    wiredEntries(result) {
        this.wiredDataResult = result; // store wired result for refresh
        if (result.data) {
            this.timeEntries = result.data.map(row => ({
                ...row,
                ProjectName: row.Project__r ? row.Project__r.Name : '',
                Start_Time_Formatted: this.formatDateTime(row.Start_Time__c),
                End_Time_Formatted: this.formatDateTime(row.End_Time__c)
            }));
            this.checkRunningTimer();
        }
    }
    connectedCallback() {
        this.loadProjects();
    }

    formatDateTime(dateTimeStr) {
        if (!dateTimeStr) return '';
        const dt = new Date(dateTimeStr);

        // Format: DD-MM-YYYY HH:MM
        const day = String(dt.getDate()).padStart(2, '0');
        const month = String(dt.getMonth() + 1).padStart(2, '0'); // months 0-11
        const year = dt.getFullYear();
        const hours = String(dt.getHours()).padStart(2, '0');
        const minutes = String(dt.getMinutes()).padStart(2, '0');

        return `${day}-${month}-${year} ${hours}:${minutes}`;
    }

    
    checkRunningTimer() {
        this.runningEntry = this.timeEntries.find(e => e.Is_Running__c === true);
        if (this.runningEntry) {
            this.startElapsedTimer();
        } else {
            this.stopElapsedTimer();
        }
    }

    startElapsedTimer() {
        this.stopElapsedTimer(); // clear previous interval if any
        this.updateElapsedTime();
        this.timerInterval = setInterval(() => {
            this.updateElapsedTime();
        }, 1000);
    }

    stopElapsedTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
            this.elapsedTime = '00:00:00';
        }
    }

    updateElapsedTime() {
        if (!this.runningEntry || !this.runningEntry.Start_Time__c) return;

        const start = new Date(this.runningEntry.Start_Time__c);
        const now = new Date();
        let diff = Math.floor((now - start) / 1000); // seconds

        const hours = String(Math.floor(diff / 3600)).padStart(2, '0');
        diff %= 3600;
        const minutes = String(Math.floor(diff / 60)).padStart(2, '0');
        const seconds = String(diff % 60).padStart(2, '0');

        this.elapsedTime = `${hours}:${minutes}:${seconds}`;
    }
    loadProjects() {
        getProjects()
            .then(result => {
                this.projectOptions = result.map(proj => ({
                    label: proj.Name,
                    value: proj.Id
                }));
            })
            .catch(error => {
                this.showToast('Error', error.body.message, 'error');
            });
    }
    
    handleProjectChange(event) {
        this.selectedProject = event.detail.value;
    }

    handleTaskChange(event) {
        this.task = event.target.value;
    }

    startTimer() {
        if (!this.selectedProject || !this.task) {
            this.showToast('Error', 'Please select project and enter task', 'error');
            return;
        }
        let running = this.runningEntry;
        if (running) {
            this.showToast('Error', 'Only one timer can run at a time', 'error');
            return;
        }
        startTimerApex({ projectId: this.selectedProject, task: this.task })
            .then(() => {
                this.showToast('Success', 'Timer started', 'success');
                return refreshApex(this.wiredDataResult); 
            })
            .catch(error => {
                this.showToast('Error', error.body.message, 'error');
            });
    }

    stopTimer() {
        // Stop the first running entry
        let runningEntry = this.runningEntry;
        if (!runningEntry) {
            this.showToast('Info', 'No running timer found', 'info');
            return;
        }
        stopTimerApex({ entryId: runningEntry.Id })
            .then(() => {
                this.showToast('Success', 'Timer stopped', 'success');
                return refreshApex(this.wiredDataResult);
            })
            .catch(error => {
                this.showToast('Error', error.body.message, 'error');
            });
    }
    get totalTime() {
        if (!this.timeEntries || this.timeEntries.length === 0) return '00:00';

        // Sum Duration in hours
        let totalHours = this.timeEntries.reduce((sum, entry) => {
            return sum + (entry.Duration_Hours__c || 0);
        }, 0);

        // Convert to HH:MM format
        const hours = Math.floor(totalHours);
        const minutes = Math.round((totalHours - hours) * 60);

        return `${hours.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}`;
    }

    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant
            })
        );
    }
}
