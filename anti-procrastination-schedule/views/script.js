// Lines 1-115: ruohan's workspace
// Lines 120-175: gary's workspace

var responsePayload = {};
var userID;
var userFullName;
var userGivenName;
var userFamilyName;
var userImageURL;
var userEmail;
const googleSignin = document.getElementById("google-signin");
const dashboardButton = document.getElementById("dashboard");

// Function to decode Google token
function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

// Decode and separate user's credentials
function handleCredentialResponse(response) {
    responsePayload = parseJwt(response.credential);
    console.log(responsePayload);
    userID = responsePayload.sub;
    userFullName = responsePayload.name;
    userGivenName = responsePayload.given_name;
    userFamilyName = responsePayload.family_name;
    userImageURL = responsePayload.picture;
    userEmail = responsePayload.email;
    
    setWithExpiry("userID", userID, 3600000); // 1 hr = 3600000
    setWithExpiry("userFullName", userFullName, 3600000);
    setWithExpiry("userGivenName", userGivenName, 3600000);
    setWithExpiry("userFamilyName", userFamilyName, 3600000);
    setWithExpiry("userImageURL", userImageURL, 10000); // test - 10 sec
    setWithExpiry("userEmail", userEmail, 3600000);

    console.log("ID: " + userID);
    console.log("Full Name: " + userFullName);
    console.log("Given Name: " + userGivenName);
    console.log("Family Name: " + userFamilyName);
    console.log("Image URL: " + userImageURL);
    console.log("Email: " + userEmail);

    googleSignin.hidden = true;
    dashboardButton.hidden = false;
}


function updateSignedIn() {
    if (window.location.href == "https://unique-pixel-396900.uw.r.appspot.com/index.html" || window.location.href == "https://unique-pixel-396900.uw.r.appspot.com") {
        var profileIcon1 = document.getElementById("profile-icon1");    
        if (localStorage.getItem("userImageURL")) {
            googleSignin.hidden = true;
            dashboardButton.hidden = false;
            profileIcon1.setAttribute("src", JSON.parse(localStorage.getItem("userImageURL")).value);
            profileIcon1.hidden = false;
        } else {
            googleSignin.hidden = false;
            dashboardButton.hidden = true;
            profileIcon1.hidden = true;
        }
        
    } else if (window.location.href == "https://unique-pixel-396900.uw.r.appspot.com/dashboard.html") {
        var profileIcon2 = document.getElementById("profile-icon2");
        if (localStorage.getItem("userImageURL")) {
            profileIcon2.setAttribute("src", JSON.parse(localStorage.getItem("userImageURL")).value);
            profileIcon2.hidden = false;
        } else {
            window.location.replace("https://unique-pixel-396900.uw.r.appspot.com");
        }
    }
}


// Set expiration time for items in the browser's local storage
function setWithExpiry(key, value, ttl) {
	const now = new Date();
	const item = {
		value: value,
		expiry: now.getTime() + ttl,
	};

	localStorage.setItem(key, JSON.stringify(item));
}

// Check if an item has expired and delete if so
function getWithExpiry(key) {
	const itemStr = localStorage.getItem(key);
	if (!itemStr) {
		return null;
	}
	const item = JSON.parse(itemStr);
	const now = new Date();
	if (now.getTime() > item.expiry) {
		localStorage.removeItem(key);
        googleSignin.hidden = false;
        dashboardButton.hidden = true;
        profileIcon.hidden = true;
		return null;
	}

	return item.value;
}




// data-login_uri="https://unique-pixel-396900.uw.r.appspot.com/dashboard.html"
// data-scope="https://www.googleapis.com/auth/calendar"




// Pre-algorithmic backend work (gary)
// NOTE: pls replace the proper user-id info for variables and data cus idk how to do it

const dayHours = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
var availableHours = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
var occupiedHours = [];
var tasks = []; //format is [task-name, start-hour, end-hour, etc.]

// Function for creating new task
// checks if task hours overlaps with any previous tasks
// returns [task-name, start-hour, end-hour] if hours don't overlap
function newTask(taskName, startHour, endHour) {
    var taskHours = [];
    // creates array of occupying hours of new task
    for (let i = startHour; i < endHour+1; i++) {
        taskHours.push(i);
    }
    // checks for any overlapping hours
    for (let i = 0; i < taskHours.length/3; i++) {
        let item = taskHours[i];
        for (let j = 0; j < occupiedHours.length; j++) {
            if (item == occupiedHours[j]) {
                // returns "unavailable" if hours overlap
                return "unavailable";
            }
        }

    }
    // updates list of occupied hours
    occupiedHours = occupiedHours.concat(taskHours);
    sortHours(occupiedHours);
    // updates list of available hours
    for (let i = 0; i < taskHours.length; i++) {
        let item = taskHours[i];
        for (let j = 0; j < availableHours.length; j++) {
            if (item == availableHours[j]) {
                availableHours.splice(j, 1);
            }

        }

    }
    return [taskName, startHour, endHour];
}

function sortHours(array) {
    array.sort((a, b) => a - b);
    console.log(array);
}

function newSchedule() {

}


