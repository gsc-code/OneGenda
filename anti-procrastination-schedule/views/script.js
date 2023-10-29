// gary's variables
const dayHours = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
var availableHours = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
var occupiedHours = [];
var scheduledTasks = []; //format is [task-name, start-hour, end-hour, etc.]
var tasks = []; //format is [task-name, hours, etc.]
var dailySchedule = [];

// ruohan's variables
// User Info
var userFullName;
var userImageURL;
var userEmail;

// HTML Elements
const googleSignin = document.getElementById("google-signin");
const dashboardButton = document.getElementById("dashboard");
const calendarButton = document.getElementById("calendar");
const profileIcon = document.getElementById("profile-icon"); 
const notSignedIn = document.getElementById("not-signed-in");
const dashboardContent = document.getElementById("dashboard-content");
const calendarContent = document.getElementById("calendar-content");
const userCalendar = document.getElementById("gcalendar");
const submitBtn = document.getElementById("submit-button");
const addedTasksUl = document.getElementById("added-tasks");
const scheduledTasksUl = document.getElementById("scheduled-tasks");
const updateCalendarBtn = document.getElementById("update-calendar");


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
    setWithExpiry("userFullName", userFullName, 3600000);
    setWithExpiry("userImageURL", userImageURL, 3600000);
    setWithExpiry("userEmail", userEmail, 3600000);

    // const request = {
    //     'calendarId': 'primary',
    //     'timeMin': (new Date()).toISOString(),
    //     'singleEvents': true,
    //     'orderBy': 'startTime',
    //     'maxResults': 10,
    // };

    // const response = await gapi.client.calendar.events.list(request);
    // console.log(response);

    /*
    const events = response.result.dashboardContent;

    events[i].start.date // event start date
    events[i].summary // event description

    // Test
    for (var i = 0; i < events.length; i++) {
        var li = document.createElement('li');
        li.appendChild(document.createTextNode(`${events[i].start.date} ${events[i].summary}`));
        document.getElementById('events').appendChild(li);
    }

    const freeBusy = await gapi.client.calendar.freebusy.query({ 'timeMin': (new Date()).toISOString(), 'timeMax': (new Date().addDays(1)).toISOString(), 'dashboardContent': [{ 'id': 'primary' }] })
    */

}

// Handle response from Google
async function handleCredentialResponse(response) {
    if (response) {
        // signed in
        console.log(response);
        setWithExpiry("RESPONSE", response, 3599000); // actual Google token expires in 3599 seconds (~ 1 hr) = 3599000 ms
        gapi.client.setToken(response);
        await makeApiCall();
        googleSignin.hidden = true;
        dashboardButton.hidden = false;
        calendarButton.hidden = false;
        console.log("signed in");
        if (googleSignin.getAttribute("data-target") == "dashboard") {
            // if target page is dashboard, redirect to dashboard page
            window.location.replace("/dashboard.html");
        } else if (googleSignin.getAttribute("data-target") == "calendar") {
            // if target page is calendar, redirect to calendar page
            window.location.replace("/calendar.html");
        } else {
            // otherwise, redirect to dashboard page
            window.location.replace("/dashboard.html");
        }
    } else {
        // not signed in, redirect to home page
        console.log("not signed in");
        window.location.replace("/");
        dashboardButton.hidden = true;
        calendarButton.hidden = true;
        googleSignin.hidden = false;
        googleSignin.click = signIn();
    }    
}

function updateHome() {
    if (getWithExpiry("RESPONSE")) {
        // signed in
        dashboardButton.hidden = false;
        profileIcon.hidden = false;
        profileIcon.setAttribute("src", getWithExpiry("userImageURL"));
        calendarButton.hidden = false;
        googleSignin.hidden = true;
    } else {
        // not signed in
        dashboardButton.hidden = true;
        profileIcon.hidden = true;
        calendarButton.hidden = true;
        googleSignin.hidden = false;
    }
}

function updateDashboard() {
    if (getWithExpiry("RESPONSE")) {
        // signed in
        googleSignin.hidden = true;
        dashboardButton.hidden = false;
        dashboardButton.className = "active";
        profileIcon.hidden = false;
        profileIcon.setAttribute("src", getWithExpiry("userImageURL"));
        calendarButton.hidden = false;
        notSignedIn.setAttribute("style", "display: none");
        dashboardContent.setAttribute("style", "display: block");
    } else {
        // not signed in
        dashboardButton.hidden = true;
        calendarButton.hidden = true;
        notSignedIn.setAttribute("style", "display: block");
        dashboardContent.setAttribute("style", "display: none");
        profileIcon.hidden = true;
        googleSignin.hidden = false;
    }
}

// when user clicks on Update Calendar after adding all tasks
async function updateSched() {
    await updateGCalendar();
    // window.location.replace("/calendar.html");
}

function addTask() {
    const task = document.getElementById("task-name");
    const taskName = task.value;
    const length = document.getElementById("task-length");
    const taskLength = parseInt(length.value);
    // const taskDueDate = document.getElementById("task-duedate").value;

    newTask(taskName, taskLength);
    addTaskToDB(taskName, taskLength, false);

    task.innerHTML = "";
    length.innerHTML = "";
}

function addScheduledTask() {
    const task = document.getElementById("sched-task-name");
    const taskName = task.value;
    const start = document.getElementById("sched-task-start");
    const startHour = parseInt(start.value);
    const end = document.getElementById("sched-task-end");
    const endHour = parseInt(end.value);
    var taskLength = 0;

    if (endHour < startHour) {
        newScheduledTask(taskName, 1, endHour);
        newScheduledTask(taskName, startHour, 24);
        taskLength = (endHour) + (24 - startHour);
    } else {
        newScheduledTask(taskName, startHour, endHour);
        taskLength = endHour - startHour;
    }

    addTaskToDB(taskName, taskLength, true);

    task.innerHTML = "";
    start.innerHTML = "";
    end.innerHTML = "";
}

function addTaskToDB(taskName, taskLength, scheduled) {
    var task = document.createElement("li");
    task.innerHTML = taskName + ": " + taskLength + " hours";
    if (scheduled) {
        scheduledTasksUl.appendChild(task);
    } else {
        addedTasksUl.appendChild(task);
    }
}

function updateCalendar() {
    if (getWithExpiry("RESPONSE")) {
        // signed in
        googleSignin.hidden = true;
        dashboardButton.hidden = false;
        profileIcon.hidden = false;
        profileIcon.setAttribute("src", getWithExpiry("userImageURL"));
        calendarButton.hidden = false;
        calendarButton.className = "active";
        notSignedIn.setAttribute("style", "display: none");
        calendarContent.setAttribute("style", "display: block");

        userCalendar.setAttribute("src", "https://calendar.google.com/calendar/embed?src=" + encodeURIComponent(getWithExpiry("userEmail")) + "&ctz=America%2FLos_Angeles");

    } else {
        // not signed in
        dashboardButton.hidden = true;
        calendarButton.hidden = true;
        notSignedIn.setAttribute("style", "display: block");
        calendarContent.setAttribute("style", "display: none");
        profileIcon.hidden = true;
        googleSignin.hidden = false;
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

// 10/2 Update: implemented GCalendar event creation and complete schedule generation process
//              still need to debug GCalendar event creation for any errors
// also I didnt include than many comments on how the algo works or console logs yet cus messy so sry if its hard to understand

// SEE VARIABLES AT VERY TOP

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
    tasks.push(taskName, hours);
}

function removeTask(index) {
    var firstHalf = tasks.splice(0, index);
    var secondHalf = tasks.splice(2, tasks.length - 1);

    tasks = firstHalf.concat(secondHalf);
}

function sortHours(array) {
    array.sort((a, b) => a - b);
    console.log(array);
}

function newScheduledTask(taskName, startHour, endHour) {
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

function removeScheduledTask(index) {
    var firstHalf = scheduledTasks.splice(0, index);
    var secondHalf = scheduledTasks.splice(3, scheduledTasks.length - 1);

    scheduledTasks = firstHalf.concat(secondHalf);
}

// min and max parameters are both inclusive
function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
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

async function updateGCalendar() {
    dailySchedule = [];

    availableHours = dayHours;
    occupiedHours = [];

    injectScheduledTasks();

    console.log(newSchedule());

    for (let a = 0; a < dailySchedule.length/3; a++) {
        await addGEvent(a*3, a*3 + 1, a*3 + 2);
    }
}

function injectScheduledTasks() {
    for (let b = 0; b < scheduledTasks.length/3; b++) {

        const taskName = scheduledTasks[b*3];
        const startHour = scheduledTasks[b*3];
        const endHour = scheduledTasks[b*3];
        const taskLength = endHour - startHour;

        const index = availableHours.indexOf(startHour)

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

        // removes assigned scheduled task hours from availableHours array
        availableHours = firstHalf.concat(secondHalf);

        // appends scheduled task's name, start, and end-hour to tasks list
        dailySchedule.push(taskName);
        dailySchedule.push(startHour);
        dailySchedule.push(endHour - 1);
    }
}

async function addGEvent(taskName, startHour, endHour) {
    await gapi.client.load('https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest');
    const token = getWithExpiry("RESPONSE");
    gapi.client.setToken(token);

    var start = startHour;
    var end = endHour;

    // Create a new instance of Intl.DateTimeFormat
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Print the user's timezone
    console.log("User's Timezone: " + userTimeZone);

    // Create a new Date object
    const currentDate = new Date();

    // Print the current date and time
    console.log("Current date: " + currentDate);

    const initialTimeInfo = currentDate.getFullYear() + '-' + currentDate.getMonth() + '-' + currentDate.getDay()

    // adjusts numerical syntax of hours
    if (start <= 9) {
        start = '0' + start;
    }

    if (end <= 9) {
        end = '0' + end;
    }

    const event = {
        'summary': taskName,
        'start': {
          'dateTime': initialTimeInfo + 'T' + (end + ':00:00') + '-00:00',
          'timeZone': userTimeZone
        },
        'end': {
          'dateTime': initialTimeInfo + 'T' + (end + ':00:00') + '-00:00',
          'timeZone': userTimeZone
        },
      };
      
      const request = gapi.client.calendar.events.insert({
        'calendarId': 'primary',
        'resource': event
      });

      request.execute(function(event) {
        console.log('Event created: ' + event.htmlLink);
      });
}

// console.log(calendarList.get());