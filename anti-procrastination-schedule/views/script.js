// Lines 1-170: ruohan's workspace
// Lines 170+: gary's workspace

var userFullName;
var userImageURL;
var userEmail;

// HTML Elements
const googleSignin = document.getElementById("google-signin");
const googleSignin2 = document.getElementById("google-signin-2");
const dashboardButton = document.getElementById("dashboard");
const profileIcon = document.getElementById("profile-icon"); 
const notSignedIn = document.getElementById("not-signed-in");
const dashboardContent = document.getElementById("items");

const clientId = '314363292248-t98fvdcsa4nmf3nnpetvlusg69n8k0bm.apps.googleusercontent.com';
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

    const events = response.result.dashboardContent;
    // events[i].start.date // event start date
    // events[i].summary // event description

    // Test
    // for (var i = 0; i < events.length; i++) {
    //     var li = document.createElement('li');
    //     li.appendChild(document.createTextNode(`${events[i].start.date} ${events[i].summary}`));
    //     document.getElementById('events').appendChild(li);
    // }

    // const freeBusy = await gapi.client.calendar.freebusy.query({ 'timeMin': (new Date()).toISOString(), 'timeMax': (new Date().addDays(1)).toISOString(), 'dashboardContent': [{ 'id': 'primary' }] })
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
        googleSignin2.hidden = true;
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
        googleSignin2.hiddn = false;
    }
}

// Set expiration time for dashboardContent in the browser's local storage
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
	const dashboardContenttr = localStorage.getItem(key);
	if (!dashboardContenttr) {
		return null;
	}
	const item = JSON.parse(dashboardContenttr);
	const now = new Date();
	if (now.getTime() > item.expiry) {
        localStorage.clear();
		return null;
	}

	return item.value;
}






// Algorithmic backend work (gary)

// 8/31 Update: created schedule-generating algorithm (not including preset tasks yet)
// WARNING: algorithm currently does NOT have a way to check if such available consecutive hours exists and if not will get stuck in an infinite loop. Will try to fix soon :P
// also I didnt include than many comments on how the algo works or console logs yet cus messy so sry if its hard to understand

// NOTE: pls replace the proper user-id info for variables and data cus idk how to do it

const dayHours = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
var availableHours = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
var occupiedHours = [];
var scheduledTasks = []; //format is [task-name, start-hour, end-hour, etc.]
var tasks = []; //format is [task-name, hours, etc.]
var dailySchedule = [];

// Test code:
/*
    tasks = ["food", 1, "hw", 2, "play", 1];
    availableHours = [16,17,18,19,20,21];
    occupiedHours = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,22,23,24]
*/

// Function for creating new scheduled/daily task
// checks if task hours overlaps with any previous tasks
// returns [task-name, start-hour, end-hour] if hours don't overlap
function newSchedule() {
    dailySchedule = [];
    var count = 0;
    for (let i = 0; i < tasks.length/2; i++) {
        var noConflict = false;

        // pulls name and duration of task from tasks array
        var taskName = tasks[i*2];
        var taskLength = tasks[i*2+1];

        // declare task variables
        var index;
        var startHour;
        var endHour;

        count++;
        console.log("count: " + count);

        console.log("taskName: " + taskName);
        console.log("taskLength: " + taskLength);

        // re-generates assigned hours until sutible hours are found

        // fail-safe to prevent infinite loop in next while-loop

        var isSafe = false;

        for (let h = 0; h < availableHours.length; h++) {
            if (hasConsecutiveHours(availableHours, availableHours[h], taskLength)) {
                isSafe = true;
            }
            
        }
        if (isSafe == true) {
            while (noConflict == false) {
                // selects random available hour to start task
                index = randomNumber(0, availableHours.length - 1);
                startHour = availableHours[index];

                // identifies ending hour of task based on inputted duration
                endHour = startHour + taskLength - 1;

                console.log("index: " + index);
                console.log("startHour: " + startHour);
                console.log("endHour: " + endHour);

                // checks if consecutive hours are available
                noConflict = hasConsecutiveHours(availableHours, startHour, taskLength);
                
            }
        } else {
            return "error";
        }
       
        // updates occupiedHours array with new assigned hours
        if (taskLength <= 1) {
            occupiedHours.push(startHour);
            sortHours(occupiedHours);
        } else {
            occupiedHours = occupiedHours.concat(availableHours.slice(index, index + taskLength));
            sortHours(occupiedHours);        
        }

        
        var firstHalf = availableHours.splice(0, index);
        var secondHalf = availableHours.splice(taskLength, availableHours.length - 1);

        console.log("parts: " + firstHalf + " + " + secondHalf);

        // removes assigned task hours from availableHours array
        availableHours = firstHalf.concat(secondHalf);
        

        //availableHours = availableHours.splice(index, index + tasklength - 1);

        // appends task's name, start, and end hour to new schedule
        dailySchedule.push(taskName);
        dailySchedule.push(startHour);
        dailySchedule.push(endHour);

        console.log ("Schedule: " + dailySchedule);
        console.log ("occupiedHours: " + occupiedHours);
        console.log ("availableHours: " + availableHours);
    }
    return dailySchedule;
}

function newTask(taskName, hours) {
    task.push(taskName, hours);
}

function sortHours(array) {
    array.sort((a, b) => a - b);
    console.log(array);
}

function newSchedule() {
    dailySchedule = [];
    var noConflict = true;
    for (let i = 0; i < tasks.length/2; i++) {
        // pulls name and duration of task from tasks array
        var taskName = tasks[i*2-1];
        var taskLength = tasks[i*2];

        // re-generates assigned hours until sutible hours are found
        while (noConflict == false) {
            // selects random available hour to start task
            var index = randomNumber(0, availableHours.length);
            var startHour = availableHours[index];

            // identifies ending hour of task based on inputted duration
            var endHour = startHour + taskLength;

            // checks if consecutive hours are available
            noConflict = hasConsecutiveHours(availableHours, startHour, taskLength);
            
        }
        // updates occupiedHours array with new assigned hours
        occupiedHours = occupiedHours.concat(availableHours.slice(index, index + taskLength));
        
        // removes assigned task hours from availableHours array
        availableHours = availableHours.splice(index, index + taskLength);
        
        // appends task's name, start, and end hour to new schedule
        dailySchedule.push(taskName);
        dailySchedule.push(startHour);
        dailySchedule.push(endHour);
    }
}

function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1));
}

function hasConsecutiveHours(array, start, sequenceLength) {
    for (let j = 0; j < array.length; j++) {
      var temp = array[j];
      if (temp == start) {
        startIndex = j;
        for (let k = 0; k < sequenceLength; k++) {
            if (array[startIndex + k] != (start + k)) {
                return false;
            }
        }
        return true;
      }
    }
    return false;
}