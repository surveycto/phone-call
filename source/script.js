/* global getPluginParameter, setAnswer, makePhoneCall, getPhoneCallStatus */

// Get parameters info from the form definition
var phoneNumber = getPluginParameter('phone_number')
var phoneNumberLabel = getPluginParameter('phone_number_label');
var hidePhoneNumber = getPluginParameter('hide_phone_number');

// Get information about the current device
var isAndroid = (document.body.className.indexOf('android-collect') >= 0)

// Get UI elements
var btnCallPhone = document.getElementById('btn-call-phone')
var statusContainer = document.getElementById('status-container')
var errorMsgContainer = document.getElementById('error-message-container')
var errorMsg = document.getElementById('error-message')

// Error cases
if (!isAndroid) { // If the platform is not Android, then the calling function will not be supported.
  btnCallPhone.disabled = true // Disable the call button.
  errorMsg.innerHTML = 'Sorry, the phone call feature is only supported on Android. Please open this form using SurveyCTO Collect for Android.' // Write the appropriate error message
  errorMsgContainer.classList.remove('hidden') // Show the error message.
} else if (!phoneNumber || phoneNumber.length < 1) { // If there is no phone number provided, then we won't be able to make a call.
  btnCallPhone.disabled = true
  errorMsg.innerHTML = 'Sorry, there was no phone number provided, so a call cannot be made.'
  errorMsgContainer.classList.remove('hidden')
}

function setUpCall () {
  btnCallPhone.classList.add('hidden')
}

function updateCallUI () {
  // Get status about the call.
  var phoneCallStatus = getPhoneCallStatus();

  if (phoneCallStatus === null) { // Call is no longer active.
    statusContainer.parentElement.classList.remove('text-green')
    statusContainer.innerHTML = 'Call ended'
    btnCallPhone.classList.remove('hidden')
  } else { // Call is still active.
    if (phoneCallStatus === 'Dialing') {
      statusContainer.parentElement.classList.remove('text-green')
      statusContainer.innerHTML = 'Connecting...'
    } else if (phoneCallStatus === 'Active') {
      statusContainer.parentElement.classList.add('text-green')
      statusContainer.innerHTML = 'Connected'
    }
  }
}

// When loading, if there's an active call in progress, make sure to update UI.
if (getPhoneCallStatus() !== null) {
  setUpCall()
  updateCallUI()
} else {
  statusContainer.parentElement.classList.add('text-green')
  statusContainer.innerHTML = 'Ready to call'
}

// Define what the 'CALL' button does.
btnCallPhone.onclick = function () {
  if (isAndroid) {
    // Set the parameters for the intent.
    var params = {
      phone_number: phoneNumber,
      phone_number_label: phoneNumberLabel,
      hide_phone_number: hidePhoneNumber
    }
    // Make the phone call.
    makePhoneCall(params, function (error) {
      // Some error occurred.
      if (error) {
        statusContainer.parentElement.classList.remove('text-green')
        statusContainer.innerHTML = error
        return
      }
      // Update the UI.
      setUpCall()
      statusContainer.parentElement.classList.remove('text-green')
      statusContainer.innerHTML = 'Connecting...'
    })
  }
}