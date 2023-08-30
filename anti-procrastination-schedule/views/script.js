// Lines 1-165: ruohan's workspace
// Lines 170-225+: gary's workspace

var userFullName;
var userImageURL;
var userEmail;

// HTML Elements
const googleSignin = document.getElementById("google-signin");
const dashboardButton = document.getElementById("dashboard");
const profileIcon = document.getElementById("profile-icon"); 
const notSignedIn = document.getElementById("not-signed-in");
const dashboardContent = document.getElementById("dashboard-content");

const clientId = '314363292248-0hkj8at161r1o3og4fgqjs604s35e9m5.apps.googleusercontent.com';
const scopes = 'https://www.googleapis.com/auth/calendar';
const client = google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: scopes,
    prompt: '',
    login_hint: getWithExpiry('userEmail'),
    callback: (response) => {
        handleCredentialResponse(response);
    }
});

function signIn() {
    client.requestAccessToken();
}

async function makeApiCall() {
    await gapi.client.load('https://www.googleapis.com/discovery/v1/apis/people/v1/rest');
    await gapi.client.load('https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest');

    const myProfile = await gapi.client.people.people.get({resourceName: 'people/me', personFields: 'names,photos,emailAddresses'});

    console.log(myProfile);

    userImageURL = myProfile.result.photos[0].url;
    userFullName = myProfile.result.names[0].displayName;
    userEmail = myProfile.result.emailAddresses[0].value;

    console.log("Full Name: " + userFullName);
    console.log("Image URL: " + userImageURL);
    console.log("Email: " + userEmail);
    
    // 1 hr = 3600000
    // test - 1 min = 60000
    setWithExpiry("userFullName", userFullName, 60000);
    setWithExpiry("userImageURL", userImageURL, 60000);
    setWithExpiry("userEmail", userEmail, 60000);

    const request = {
        'calendarId': 'primary',
        'timeMin': (new Date()).toISOString(),
        'singleEvents': true,
        'orderBy': 'startTime',
        'maxResults': 10,
    };

    const response = await gapi.client.calendar.events.list(request);
    console.log(response);

    const events = response.result.items;
    // events[i].start.date // event start date
    // events[i].summary // event description

    // Test
    // for (var i = 0; i < events.length; i++) {
    //     var li = document.createElement('li');
    //     li.appendChild(document.createTextNode(`${events[i].start.date} ${events[i].summary}`));
    //     document.getElementById('events').appendChild(li);
    // }

    // const freeBusy = await gapi.client.calendar.freebusy.query({ 'timeMin': (new Date()).toISOString(), 'timeMax': (new Date().addDays(1)).toISOString(), 'items': [{ 'id': 'primary' }] })
}

// Handle response from Google
async function handleCredentialResponse(response) {
    if (response) {
        console.log(response);
        setWithExpiry("RESPONSE", response, 60000); // actual Google token expires in 3599 seconds (~ 1 hr) = 3599000 ms
        gapi.client.setToken(response);
        await makeApiCall();
        googleSignin.hidden = true;
        dashboardButton.hidden = false;
        console.log("signed in");
        if (window.location.href != "/dashboard.html") {
            window.location.replace("/dashboard.html");
        } else {
            window.location.reload();
            profileIcon.hidden = false;
            profileIcon.setAttribute("src", getWithExpiry("userImageURL"));
            notSignedIn.setAttribute("style", "visibility: hidden");
            dashboardContent.setAttribute("style", "visibility: visible");
            dashboardButton.className = "active";
        }
    } else {
        console.log("not signed in");
        window.location.replace("/");
        dashboardButton.hidden = true;
        googleSignin.hidden = false;
        googleSignin.click = signIn();
    }    
}

function updateHome() {
    if (getWithExpiry("RESPONSE")) {
        dashboardButton.hidden = false;
        profileIcon.hidden = false;
        profileIcon.setAttribute("src", getWithExpiry("userImageURL"));
        googleSignin.hidden = true;
    } else {
        dashboardButton.hidden = true;
        profileIcon.hidden = true;
        googleSignin.hidden = false;
    }
}

function updateDashboard() {
    if (getWithExpiry("RESPONSE")) {
        googleSignin.hidden = true;
        dashboardButton.hidden = false;
        dashboardButton.setAttribute("class", "active");
        profileIcon.hidden = false;
        profileIcon.setAttribute("src", getWithExpiry("userImageURL"));
        notSignedIn.setAttribute("style", "visibility: hidden");
        dashboardContent.setAttribute("style", "visibility: visible");
    } else {
        dashboardButton.hidden = true;
        notSignedIn.setAttribute("style", "visibility: visible");
        dashboardContent.setAttribute("style", "visibility: hidden");
        profileIcon.hidden = true;
        googleSignin.hidden = false;
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
        localStorage.clear();
		return null;
	}

	return item.value;
}






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


