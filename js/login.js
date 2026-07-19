/******************************************************
 * LOGIN
 ******************************************************/

document
.getElementById("loginForm")
.addEventListener("submit",loginUser);

async function loginUser(e){

    e.preventDefault();

    const username=
        document.getElementById("username").value.trim();

    const password=
        document.getElementById("password").value.trim();

    const msg=
        document.getElementById("loginMessage");

    msg.innerHTML="Checking...";

    msg.className="";

    try{

        const result=await API.login(username,password);

        if(result.success){

            msg.innerHTML="Login Successful";

            msg.className="success";

            sessionStorage.setItem(
                "grantRadarLoggedIn",
                "true"
            );

            setTimeout(()=>{

                window.location="admin.html";

            },700);

        }

        else{

            msg.innerHTML=result.message;

            msg.className="error";

        }

    }

    catch(err){

        msg.innerHTML="Unable to login.";

        msg.className="error";

    }

}