const isURL = (str) => {
  try {
    new URL(str);
    return true;
  } catch (error) {
    return false;
  }
}

// Lambda function to get URL parameters
const getURLParams = () => Object.fromEntries(new URLSearchParams(window.location.search));

// Lambda function to set URL parameters
const setURLParam = (key, value) => {
  const urlParams = new URLSearchParams(window.location.search);
  urlParams.set(key, value);
  window.location.search = urlParams.toString();
};

// Function to set a cookie
const setCookie = (name, value, days) => {
  var expires = "";
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

// Function to get a cookie
const getCookie = (name) => {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for(var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1, c.length);
    }
    if (c.indexOf(nameEQ) == 0) {
      return c.substring(nameEQ.length, c.length);
    }
  }
  return null;
}
