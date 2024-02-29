const isURL = (str) => {
  try {
    new URL(str);
    return true;
  } catch (error) {
    return false;
  }
}

const updateData = (obj, newdata) => {
  return Object.keys(newdata).forEach(key => {
    obj[key] = newdata[key];
  });
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

const copyAddress = (htmlId) => {
  // Get the text content of the Ethereum address span
  var addressText = document.getElementById(`${htmlId}Address`).innerText;

  // Create a temporary input element
  var tempInput = document.createElement("input");

  // Set the input value to the Ethereum address text
  tempInput.value = addressText;

  // Append the input element to the document body
  document.body.appendChild(tempInput);

  // Select the input field's content
  tempInput.select();
  tempInput.setSelectionRange(0, 99999); /* For mobile devices */

  // Copy the selected content
  document.execCommand("copy");

  // Remove the temporary input element
  document.body.removeChild(tempInput);

  var copyButton = document.getElementById(`${htmlId}CopyButton`);
  copyButton.innerHTML = '<i class="fas fa-check"></i> Copied!';
  copyButton.style.color = '#00ff00';
  setTimeout(() => {
    copyButton.innerHTML = '<i class="fas fa-copy"></i>';
  }, 1000)
}

const toHumanReadable = (name) => {
    var words = name.match(/[A-Za-z][a-z]*/g) || [];
    return words.map(capitalize).join(" ");
}
const fromHumanReadable = (name) => {
    var words = name.match(/[A-Za-z][a-z]*/g) || [];
    return words.map(
		(x,index) => (index > 0) ? x.toUpperCase() : x.toLowerCase()
	).join("");
}

const capitalize = (word) => {
    return word.charAt(0).toUpperCase() + word.substring(1);
}
