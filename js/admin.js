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
        .getElementById("deadlineType")
        .addEventListener("change", toggleDeadlineType);

    document
        .getElementById("importantUpdate")
        .addEventListener("change", toggleRemark);

    document
        .getElementById("editDeadlineType")
        .addEventListener("change", toggleEditDeadlineType);

    document
        .getElementById("editImportantUpdate")
        .addEventListener("change", toggleEditRemark);

    document
        .getElementById("updateGrantBtn")
        .addEventListener("click",updateGrant);

    toggleDeadlineType();

}


function toggleDeadlineType(){

    const type =
        document.getElementById("deadlineType").value;

    const deadlineDiv =
        document.getElementById("deadlineDiv");

    const deadline =
        document.getElementById("deadline");

    if(type === "rolling"){

        deadlineDiv.classList.add("d-none");
        deadline.required = false;
        deadline.value = "";

    }else{

        deadlineDiv.classList.remove("d-none");
        deadline.required = true;

    }

}

function toggleRemark() {

    const important =
        document.getElementById("importantUpdate").checked;

    const remarkDiv =
        document.getElementById("remarkDiv");

    const remark =
        document.getElementById("remark");

    if (important) {

        remarkDiv.classList.remove("d-none");

    } else {

        remarkDiv.classList.add("d-none");

        remark.value = "";

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

    const agency =
    document.getElementById("agency")
    .value
    .trim();

    const grant = {

    agency: agency,

    scheme:
        document.getElementById("scheme").value.trim(),

    deadline:
        document.getElementById("deadline").value,

    deadlineType:
        document.getElementById("deadlineType").value,

    advertisementLink:
        document.getElementById("advertisement").value.trim(),

    applicationLink:
        document.getElementById("application").value.trim(),

    category:
        document.getElementById("category").value,

    description:
        document.getElementById("description").value.trim(),

    importantUpdate:
        document.getElementById("importantUpdate").checked,

    remark:
        document.getElementById("remark").value.trim(),

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

    document.getElementById("editDeadlineType").value =
        currentEdit.deadlineType || "fixed";

    document.getElementById("editAdvertisement").value=
        currentEdit.advertisementLink || "";

    document.getElementById("editApplication").value=
        currentEdit.applicationLink || "";

    document.getElementById("editCategory").value=
        currentEdit.category || "";

    document.getElementById("editDescription").value=
        currentEdit.description || "";

    document.getElementById("editImportantUpdate").checked =
        currentEdit.importantUpdate === "Yes" ||
        currentEdit.importantUpdate === true;

    document.getElementById("editRemark").value =
        currentEdit.remark || "";

    document.getElementById("editFeatured").checked=
        currentEdit.featured==="Yes";

    const remarkDiv =
        document.getElementById("editRemarkDiv");

    if (document.getElementById("editImportantUpdate").checked) {

        remarkDiv.classList.remove("d-none");

    } else {

        remarkDiv.classList.add("d-none");

    }

    new bootstrap.Modal(
        document.getElementById("editModal")
    ).show();

}


/*******************************************************
 * UPDATE GRANT
 *******************************************************/
async function updateGrant(){

    const grant = {

    id:
        document.getElementById("editId").value,

    agency:
        document.getElementById("editAgency").value.trim(),

    scheme:
        document.getElementById("editScheme").value.trim(),

    deadline:
        document.getElementById("editDeadline").value,

    deadlineType:
        document.getElementById("editDeadlineType").value,

    advertisementLink:
        document.getElementById("editAdvertisement").value.trim(),

    applicationLink:
        document.getElementById("editApplication").value.trim(),

    category:
        document.getElementById("editCategory").value.trim(),

    description:
        document.getElementById("editDescription").value.trim(),

    importantUpdate:
        document.getElementById("editImportantUpdate").checked,

    remark:
        document.getElementById("editRemark").value.trim(),

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


function toggleEditDeadlineType() {

    const type = document.getElementById("editDeadlineType").value;

    const deadlineDiv = document.getElementById("editDeadlineDiv");

    if (type === "rolling") {

        deadlineDiv.classList.add("d-none");
        document.getElementById("editDeadline").value = "";

    } else {

        deadlineDiv.classList.remove("d-none");

    }

}

function toggleEditRemark() {

    const checked =
        document.getElementById("editImportantUpdate").checked;

    const remarkDiv =
        document.getElementById("editRemarkDiv");

    if (checked) {

        remarkDiv.classList.remove("d-none");

    } else {

        remarkDiv.classList.add("d-none");
        document.getElementById("editRemark").value = "";

    }

}