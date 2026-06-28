// db.js

const API_BASE_URL = "http://127.0.0.1:8000";

const DB = {
    getToken() {
        return localStorage.getItem("token");
    },

    async request(endpoint, options = {}) {
        const token = this.getToken();

        const headers = {
            "Content-Type": "application/json",
            ...(options.headers || {})
        };

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });

        if (!response.ok) {
            let error = "Request failed";

            try {
                const data = await response.json();
                error = data.detail || error;
            } catch {}

            throw new Error(error);
        }

        if (response.status === 204) {
            return null;
        }

        return await response.json();
    },

    async getActivities(date) {
        return await this.request(`/activities/${date}`);
    },

    async addActivity(date, activity) {
        return await this.request(`/activities/${date}`, {
            method: "POST",
            body: JSON.stringify(activity)
        });
    },

    async updateActivity(date, id, updates) {
        return await this.request(`/activities/${date}/${id}`, {
            method: "PUT",
            body: JSON.stringify(updates)
        });
    },

    async deleteActivity(date, id) {
        return await this.request(`/activities/${date}/${id}`, {
            method: "DELETE"
        });
    },

    async getTotalMinutes(date) {
        const activities = await this.getActivities(date);

        return activities.reduce((sum, activity) => {
            return sum + (activity.duration || 0);
        }, 0);
    },

    subscribeToActivities(date, callback) {
        let stopped = false;

        const load = async () => {
            if (stopped) return;

            try {
                const activities = await this.getActivities(date);

                if (!stopped) {
                    callback(activities);
                }
            } catch (err) {
                console.error(err);
            }
        };

        load();

        const interval = setInterval(load, 3000);

        return () => {
            stopped = true;
            clearInterval(interval);
        };
    }
};