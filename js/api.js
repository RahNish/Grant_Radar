/******************************************************
 * GRANT RADAR API
 ******************************************************/

class GrantRadarAPI {

    constructor() {
        this.baseURL = CONFIG.API_URL;
    }

    // ---------- GET REQUEST ----------
    async get(action) {

        try {

            const response = await fetch(
                `${this.baseURL}?action=${action}`
            );

            return await response.json();

        } catch (error) {

            console.error(error);

            return {
                success: false,
                message: error.message
            };

        }

    }

    // ---------- POST REQUEST ----------
    async post(action, data = {}) {

    try {

        const formData = new URLSearchParams();

        formData.append(
            "data",
            JSON.stringify({
                action,
                ...data
            })
        );

        const response = await fetch(this.baseURL, {

            method: "POST",

            body: formData

        });

        return await response.json();

    }

    catch(error){

        console.error(error);

        return {

            success:false,

            message:error.message

        };

    }

}

    // ============================
    // PUBLIC METHODS
    // ============================

    getGrants() {
        return this.get("grants");
    }

    getAllGrants() {
        return this.get("all");
    }

    getExpiredGrants() {
        return this.get("expired");
    }

    getStats() {
        return this.get("stats");
    }

    getVisitors() {
        return this.get("visitors");
    }

    getVisitorCount() {
        return this.get("visitorCount");
    }

    ping() {
        return this.get("ping");
    }

    login(username, password) {

        return this.post("login", {

            username,

            password

        });

    }

    addGrant(grant) {

        return this.post("addGrant", {

            grant

        });

    }

    editGrant(grant) {

        return this.post("editGrant", {

            grant

        });

    }

    toggleFeatured(id) {

        return this.post("toggleFeatured", {

            id

        });

    }

}

/******************************************************
 * Global API Object
 ******************************************************/

const API = new GrantRadarAPI();