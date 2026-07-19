/******************************************************
 * GRANT RADAR
 * APP.JS
 ******************************************************/

let allGrants = [];
let filteredGrants = [];

document.addEventListener("DOMContentLoaded", () => {
    initialize();
});

/******************************************************
 * INITIALIZE
 ******************************************************/
async function initialize() {

    showLoading(true);

    try {

        const response = await API.getGrants();

        if (!response.success) {
            throw new Error("Unable to load funding calls.");
        }


        allGrants = response.data;

        // Sort grants by nearest deadline
        allGrants.sort((a, b) => {
            return new Date(a.deadline) - new Date(b.deadline);
        });

        filteredGrants = [...allGrants];

        loadStatistics();
        populateAgencyFilter();
        populateCategoryFilter();

        renderFeatured();
        renderGrants();

        document
            .getElementById("updatedDate")
            .innerHTML = new Date().toLocaleDateString();

    } catch (err) {

        console.error(err);

        document.getElementById("grantContainer").innerHTML =
            `<div class="col-12">
                <div class="alert alert-danger">
                    Unable to load funding calls.
                </div>
            </div>`;

    }

    showLoading(false);

    attachEvents();

}

/******************************************************
 * LOAD STATISTICS
 ******************************************************/
function loadStatistics() {

    document.getElementById("totalCalls").innerHTML =
        allGrants.length;

    const featured =
        allGrants.filter(g => g.featured === "Yes");

    document.getElementById("featuredCalls").innerHTML =
        featured.length;

    const agencies =
        [...new Set(allGrants.map(g => g.agency))];

    document.getElementById("agencyCount").innerHTML =
        agencies.length;

}

/******************************************************
 * FILTERS
 ******************************************************/
function populateAgencyFilter() {

    const select =
        document.getElementById("agencyFilter");

    const agencies =
        [...new Set(allGrants.map(g => g.agency))];

    agencies.sort();

    agencies.forEach(a => {

        const option =
            document.createElement("option");

        option.value = a;
        option.textContent = a;

        select.appendChild(option);

    });

}

function populateCategoryFilter() {

    const select =
        document.getElementById("categoryFilter");

    const categories =
        [...new Set(allGrants.map(g => g.category))];

    categories.sort();

    categories.forEach(c => {

        if (!c) return;

        const option =
            document.createElement("option");

        option.value = c;
        option.textContent = c;

        select.appendChild(option);

    });

}

/******************************************************
 * EVENTS
 ******************************************************/
function attachEvents() {

    document
        .getElementById("searchBox")
        .addEventListener("keyup", applyFilters);

    document
        .getElementById("agencyFilter")
        .addEventListener("change", applyFilters);

    document
        .getElementById("categoryFilter")
        .addEventListener("change", applyFilters);

}

/******************************************************
 * SEARCH + FILTER
 ******************************************************/
function applyFilters() {

    const keyword =
        document
            .getElementById("searchBox")
            .value
            .toLowerCase();

    const agency =
        document
            .getElementById("agencyFilter")
            .value;

    const category =
        document
            .getElementById("categoryFilter")
            .value;

    filteredGrants = allGrants.filter(g => {

        const matchKeyword =
            g.scheme.toLowerCase().includes(keyword) ||

            g.agency.toLowerCase().includes(keyword) ||

            (g.category || "")
                .toLowerCase()
                .includes(keyword);

        const matchAgency =
            agency === "" ||
            g.agency === agency;

        const matchCategory =
            category === "" ||
            g.category === category;

        return (
            matchKeyword &&
            matchAgency &&
            matchCategory
        );

    });

    renderFeatured();
    renderGrants();

}

/******************************************************
 * LOADING
 ******************************************************/
function showLoading(show) {

    document.getElementById("loading").style.display =
        show ? "flex" : "none";

}



/******************************************************
 * RENDER FEATURED GRANTS
 ******************************************************/
function renderFeatured() {

    const container = document.getElementById("featuredContainer");

    container.innerHTML = "";

    const featured = filteredGrants.filter(g => g.featured === "Yes");

    if (featured.length === 0) {

        container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-light border">
                    No featured funding opportunities available.
                </div>
            </div>
        `;

        return;
    }

    featured.forEach(grant => {

        container.innerHTML += createGrantCard(grant, true);

    });

}

/******************************************************
 * RENDER ALL GRANTS
 ******************************************************/
function renderGrants() {

    const container = document.getElementById("grantContainer");

    container.innerHTML = "";

    if (filteredGrants.length === 0) {

        container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-warning">
                    No funding opportunities found.
                </div>
            </div>
        `;

        return;
    }

    filteredGrants.forEach(grant => {

        container.innerHTML += createGrantCard(grant, false);

    });

}

/******************************************************
 * CREATE CARD
 ******************************************************/
function createGrantCard(grant, featured = false) {

    const days = getDaysLeft(grant.deadline);

    let badge = "bg-success";
    let text = days + " Days Left";

    if (days <= 30)
        badge = "bg-warning text-dark";

    if (days <= 15)
        badge = "bg-danger";

    const notificationLink =
        grant.advertisementLink || "#";

    const applicationLink =
        grant.applicationLink ||
        grant.advertisementLink ||
        "#";

    return `

<div class="col-lg-6 mb-4">

<div class="grant-card ${featured ? 'featured' : ''}">

<div class="grant-body">

<div class="agency">

<i class="bi bi-bank"></i>

${grant.agency}

${featured ? '<span class="badge bg-warning text-dark ms-2">Featured</span>' : ''}

</div>

<div class="scheme">

${grant.scheme}

</div>

<div class="meta">

<i class="bi bi-calendar-event"></i>

<strong>Deadline:</strong>

${formatDate(grant.deadline)}

</div>

<div class="meta">

<i class="bi bi-tag"></i>

<strong>Category:</strong>

${grant.category || "-"}

</div>

<div class="mt-3">

<span class="badge ${badge} badge-days">

${text}

</span>

</div>

<div class="d-grid gap-2 d-md-flex mt-4">

<a

href="${notificationLink}"

target="_blank"

class="btn btn-notification flex-fill">

<i class="bi bi-file-earmark-text"></i>

View Notification

</a>

<a

href="${applicationLink}"

target="_blank"

class="btn btn-apply flex-fill">

<i class="bi bi-box-arrow-up-right"></i>

Apply Now

</a>

</div>

</div>

</div>

</div>

`;

}

/******************************************************
 * DAYS LEFT
 ******************************************************/
function getDaysLeft(deadline) {

    const today = new Date();

    const end = new Date(deadline);

    today.setHours(0,0,0,0);

    end.setHours(0,0,0,0);

    const diff = end - today;

    return Math.max(
        0,
        Math.ceil(diff / (1000*60*60*24))
    );

}


/******************************************************
 * FORMAT DATE
 ******************************************************/
function formatDate(date){

    return new Date(date).toLocaleDateString(
        "en-IN",
        {
            day:"2-digit",
            month:"short",
            year:"numeric"
        }
    );

}