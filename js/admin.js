/*******************************************************
 * GRANT RADAR ADMIN
 * admin.js
 *******************************************************/

let grants = [];
let currentEdit = null;

/*******************************************************
 * START
 *******************************************************/
document.addEventListener("DOMContentLoaded", () => {

    checkLogin();

    loadDashboard();

    attachEvents();

});


/*******************************************************
 * LOGIN CHECK
 *******************************************************/
function checkLogin(){

    const loggedIn =
        sessionStorage.getItem("grantRadarLoggedIn");

    if(loggedIn !== "true"){

        window.location = "login.html";

    }

}


/*******************************************************
 * LOGOUT
 *******************************************************/
function logout(){

    sessionStorage.removeItem("grantRadarLoggedIn");

    window.location = "login.html";

}


/*******************************************************
 * EVENTS
 *******************************************************/
function attachEvents(){

    document
        .getElementById("logoutBtn")
        .addEventListener("click",logout);

    document
        .getElementById("grantForm")
        .addEventListener("submit",saveGrant);

    document
        .getElementById("searchGrant")
        .addEventListener("keyup",searchGrant);

    document
        .getElementById("agency")
        .addEventListener("change",toggleOtherAgency);

    document
        .getElementById("updateGrantBtn")
        .addEventListener("click",updateGrant);

}


/*******************************************************
 * OTHER AGENCY
 *******************************************************/
function toggleOtherAgency(){

    const agency =
        document.getElementById("agency").value;

    const div =
        document.getElementById("otherAgencyDiv");

    if(agency==="Other"){

        div.classList.remove("d-none");

    }else{

        div.classList.add("d-none");

    }

}


/*******************************************************
 * LOAD DASHBOARD
 *******************************************************/
async function loadDashboard(){

    try{

        const result =
            await API.getAllGrants();

        if(!result.success){

            showToast(result.message);

            return;

        }

        grants = result.data;

        updateStatistics();

        renderTable(grants);

    }

    catch(err){

        console.log(err);

        showToast("Unable to load grants.");

    }

}


/*******************************************************
 * STATISTICS
 *******************************************************/
function updateStatistics(){

    document.getElementById("totalGrant").innerHTML =
        grants.length;

    const active =
        grants.filter(g=>g.status==="Active");

    const expired =
        grants.filter(g=>g.status==="Expired");

    const featured =
        grants.filter(g=>g.featured==="Yes");

    document.getElementById("activeGrant").innerHTML =
        active.length;

    document.getElementById("expiredGrant").innerHTML =
        expired.length;

    document.getElementById("featuredGrant").innerHTML =
        featured.length;

}


/*******************************************************
 * SEARCH
 *******************************************************/
function searchGrant(){

    const keyword =
        document
            .getElementById("searchGrant")
            .value
            .toLowerCase();

    const filtered =
        grants.filter(g=>{

            return(

                g.agency.toLowerCase().includes(keyword)

                ||

                g.scheme.toLowerCase().includes(keyword)

                ||

                (g.category||"")
                .toLowerCase()
                .includes(keyword)

            );

        });

    renderTable(filtered);

}


/*******************************************************
 * TABLE
 *******************************************************/
function renderTable(data){

    const body =
        document.getElementById("grantTableBody");

    body.innerHTML="";

    if(data.length===0){

        body.innerHTML=

        `<tr>

            <td colspan="7"
                class="text-center">

                No Grants Found

            </td>

        </tr>`;

        return;

    }

    data.forEach(grant=>{

        body.innerHTML+=`

        <tr>

            <td>${grant.id}</td>

            <td>${grant.agency}</td>

            <td>${grant.scheme}</td>

            <td>${formatDisplayDate(grant.deadline)}</td>

            <td>

                <span class="${
                    grant.status==="Active"
                    ?"status-active"
                    :"status-expired"
                }">

                ${grant.status}

                </span>

            </td>

            <td>

                ${
                    grant.featured==="Yes"

                    ?'<span class="status-featured">Yes</span>'

                    :'No'
                }

            </td>

            <td>

                <button

                    class="action-btn edit-btn"

                    onclick="openEdit('${grant.id}')">

                    <i class="bi bi-pencil"></i>

                </button>

            </td>

        </tr>

        `;

    });

}


/*******************************************************
 * TOAST
 *******************************************************/
function showToast(message){

    document.getElementById("toastBody").innerHTML =
        message;

    new bootstrap.Toast(

        document.getElementById("toastMessage")

    ).show();

}


/*******************************************************
 * SAVE NEW GRANT
 *******************************************************/
async function saveGrant(e){

    e.preventDefault();

    let agency = document.getElementById("agency").value;

    if(agency==="Other"){

        agency =
            document.getElementById("otherAgency").value.trim();

    }

    const grant={

        agency:agency,

        scheme:
            document.getElementById("scheme").value.trim(),

        deadline:
            document.getElementById("deadline").value,

        advertisementLink:
            document.getElementById("advertisement").value.trim(),

        applicationLink:
            document.getElementById("application").value.trim(),

        category:
            document.getElementById("category").value,

        description:
            document.getElementById("description").value.trim(),

        featured:
            document.getElementById("featured").checked

    };

    /* Duplicate Check */

    const duplicate = grants.find(g =>

        g.agency.toLowerCase()===grant.agency.toLowerCase()

        &&

        g.scheme.toLowerCase()===grant.scheme.toLowerCase()

    );

    if(duplicate){

        showToast("Grant already exists.");

        return;

    }

    const result = await API.addGrant(grant);

    if(result.success){

        showToast("Grant Added Successfully");

        document.getElementById("grantForm").reset();

        loadDashboard();

    }

    else{

        showToast(result.message);

    }

}


/*******************************************************
 * OPEN EDIT MODAL
 *******************************************************/
function openEdit(id){

    currentEdit =
        grants.find(g=>g.id==id);

    if(!currentEdit){

        showToast("Grant not found.");

        return;

    }

    document.getElementById("editId").value=currentEdit.id;

    document.getElementById("editAgency").value=currentEdit.agency;

    document.getElementById("editScheme").value=currentEdit.scheme;

    document.getElementById("editDeadline").value=
        formatDateForInput(currentEdit.deadline);

    document.getElementById("editAdvertisement").value=
        currentEdit.advertisementLink || "";

    document.getElementById("editApplication").value=
        currentEdit.applicationLink || "";

    document.getElementById("editCategory").value=
        currentEdit.category || "";

    document.getElementById("editDescription").value=
        currentEdit.description || "";

    document.getElementById("editFeatured").checked=
        currentEdit.featured==="Yes";

    new bootstrap.Modal(
        document.getElementById("editModal")
    ).show();

}


/*******************************************************
 * UPDATE GRANT
 *******************************************************/
async function updateGrant(){

    const grant={

        id:
            document.getElementById("editId").value,

        agency:
            document.getElementById("editAgency").value.trim(),

        scheme:
            document.getElementById("editScheme").value.trim(),

        deadline:
            document.getElementById("editDeadline").value,

        advertisementLink:
            document.getElementById("editAdvertisement").value.trim(),

        applicationLink:
            document.getElementById("editApplication").value.trim(),

        category:
            document.getElementById("editCategory").value.trim(),

        description:
            document.getElementById("editDescription").value.trim(),

        featured:
            document.getElementById("editFeatured").checked

    };

    const result = await API.editGrant(grant);

    if(result.success){

        bootstrap.Modal
            .getInstance(
                document.getElementById("editModal")
            )
            .hide();

        showToast("Grant Updated Successfully");

        loadDashboard();

    }

    else{

        showToast(result.message);

    }

}


/*******************************************************
 * FORMAT DATE
 *******************************************************/
function formatDateForInput(date){

    const d = new Date(date);

    if(isNaN(d)) return "";

    return d.toISOString().split("T")[0];

}



function formatDisplayDate(date){

    const d = new Date(date);

    if(isNaN(d)) return date;

    return d.toLocaleDateString("en-IN",{
        day:"2-digit",
        month:"short",
        year:"numeric"
    });

}