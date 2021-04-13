export class TimerTracking {
    // timers: Record<string, number>;
    // times: Record<string, number>;
    timers: any;
    times: any;
    mean: any;

    constructor() {
        this.times = {};
        this.timers = {};
        this.mean = {};
    }

    startTimer(group: string, label: string) {
        // Initialize timer
        if (!this.timers[group]) {
            this.timers[group] = {};
        }
        if (this.timers[group][label] != null) {
            throw new Error(`Starting timer ${group}-${label} but it is already running`);
        }
        this.timers[group][label] = window.performance.now();

        // Initialize time
        if (!this.times[group]) {
            this.times[group] = {};
        }
        if (!this.times[group][label]) {
            this.times[group][label] = 0;
        }

        // Initialize mean calculator
        if (!this.mean[group]) {
            this.mean[group] = {};
        }
        if (!this.mean[group][label]) {
            this.mean[group][label] = {count: 0, mean: 0};
        }
    }

    stopTimer(group: string, label: string) {
        if (!this.timers[group] || !this.timers[group][label]) {
            throw new Error(`Stopping timer ${group}-${label} but it wasn't started`);
        }
        const time = window.performance.now() - this.timers[group][label];
        // Reset timer
        this.timers[group][label] = null;
        // Increment total time
        this.times[group][label] += time;
        // Update mean value
        this.mean[group][label].count += 1;
        const diff = (time - this.mean[group][label].mean) / this.mean[group][label].count;
        this.mean[group][label].mean += diff;
    }

    getGroups() {
        return Object.keys(this.times);
    }

    groupPercentage(group: string) {
        if (!this.times[group]) {
            throw new Error(`Trying to access stats for non existing group ${group}`);
        }
        const stats = {};
        let totalTime = 0;
        for (const action of Object.keys(this.times[group])) {
            const time = this.times[group][action];
            stats[action] = time;
            totalTime += time;
        }

        for (const action of Object.keys(this.times[group])) {
            stats[action] = (stats[action] * 100) / totalTime;
        }

        return stats;
    }

    groupMeanTime(group: string) {
        if (!this.times[group]) {
            throw new Error(`Trying to access stats for non existing group ${group}`);
        }

        const stats = {};
        for (const action of Object.keys(this.times[group])) {
            stats[action] = this.mean[group][action];
        }
        return stats;
    }

    groupStats(group: string) {
        if (!this.times[group]) {
            throw new Error(`Trying to access stats for non existing group ${group}`);
        }

        const percentages = this.groupPercentage(group);
        const means = this.groupMeanTime(group);

        const result = {};
        for (const action of Object.keys(this.times[group])) {
            result[action] = {
                percentage: percentages[action].toFixed(1),
                meanTime: means[action].mean.toFixed(3),
                nbCalls: means[action].count
            };
        }

        return result;
    }

    printGroup(group: string) {
        const stats = this.groupStats(group);

        console.log(`Group ${group}`);
        console.table(stats);
    }
    print() {
        const groups = this.getGroups();

        for (const group of groups) {
            this.printGroup(group);
        }
    }
}

const timers = new TimerTracking();
export default timers;
