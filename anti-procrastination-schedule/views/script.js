var responsePayload = {};
const googleSignin = document.getElementById("google-signin");
const dashboardButton = document.getElementById("dashboard");
const profileIcon = document.getElementById("profile-icon");

// Function to decode Google token
function parseJwt (token) {
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
    console.log("ID: " + responsePayload.sub);
    console.log('Full Name: ' + responsePayload.name);
    console.log('Given Name: ' + responsePayload.given_name);
    console.log('Family Name: ' + responsePayload.family_name);
    console.log("Image URL: " + responsePayload.picture);
    console.log("Email: " + responsePayload.email);

    googleSignin.hidden = true;
    dashboardButton.hidden = false;
    profileIcon.setAttribute("src", responsePayload.picture);
    profileIcon.hidden = false;
}

// Set expiration time for itmes in the browser's local storage
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
        profileIcon.hidden = false;
		return null;
	}

	return item.value;
}

const userID = responsePayload.sub;
const userFullName = responsePayload.name;
const userGivenName = responsePayload.given_name;
const userFamilyName = responsePayload.family_name;
const userImageURL = responsePayload.picture;
const userEmail = responsePayload.email;

setWithExpiry("userID", userID, 3600000);
setWithExpiry("userFullName", userFullName, 3600000);
setWithExpiry("userGivenName", userGivenName, 3600000);
setWithExpiry("userFamilyName", userFamilyName, 3600000);
setWithExpiry("userImageURL", userImageURL, 3600000);
setWithExpiry("userEmail", userEmail, 3600000);
