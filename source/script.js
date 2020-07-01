/* global getPluginParameter, setAnswer, makePhoneCall, getPhoneCallStatus */

// Get parameters info from the form definition
var phoneNumber = getPluginParameter('phone_number')
var phoneNumberLabel = getPluginParameter('phone_number_label')
var hidePhoneNumber = getPluginParameter('hide_phone_number')

// Get information about the current device
var isAndroid = (document.body.className.indexOf('android-collect') >= 0)

// Get UI elements
var targetPhoneNum = document.getElementById('target-phone-number')
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

// Show where the call is going. Hide the phone number as needed, based on the parameters.
if (phoneNumber) {
  if (hidePhoneNumber === 1 || hidePhoneNumber === '1') {
    if (!phoneNumberLabel || phoneNumberLabel.length < 1) {
      targetPhoneNum.innerHTML = '(Number hidden)' // If hide_phone_number is set to 1 but there is no phone_number_label provided, show '(Number hidden)'.
    }
  } else if (phoneNumberLabel) {
    targetPhoneNum.innerHTML = phoneNumberLabel // Otherwise, show the phone_number_label.
  } else {
    targetPhoneNum.innerHTML = phoneNumber // The default case is to just show the destination phone number.
  }
}

function setUpCall () {
  btnCallPhone.classList.add('hidden')
}

function updateCallUI () {
  var phoneCallStatus = getPhoneCallStatus() // Get the current call status.
  if (phoneCallStatus === null) { // There is no active phone call.
    statusContainer.parentElement.classList.remove('text-green')
    statusContainer.innerHTML = 'Call ended'
    btnCallPhone.classList.remove('hidden')
  } else { // There is an active phone call.
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
    // Set the parameters for the call.
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
      // Update the call UI every second.
      setUpCall()
      statusContainer.parentElement.classList.remove('text-green')
      statusContainer.innerHTML = 'Connecting...'
    })
  }
}
