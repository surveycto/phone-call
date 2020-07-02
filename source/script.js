/* global getPluginParameter, setAnswer, makePhoneCall, getPhoneCallStatus, fieldProperties */

// Get parameters info from the form definition
var phoneNumber = getPluginParameter('phone_number')
var phoneNumberLabel = getPluginParameter('phone_number_label')
var hidePhoneNumber = getPluginParameter('hide_phone_number')

// Get information about the current device
var isAndroid = (document.body.className.indexOf('android-collect') >= 0)

// Get UI elements
var targetPhoneNum = document.getElementById('target-phone-number')
var btnCallPhone = document.getElementById('btn-call-phone')
var callBtnTxt = document.getElementById('call-btn-txt')
var statusContainer = document.getElementById('status-container')
var currentCallStatus = 'Ready to call'
var errorMsgContainer = document.getElementById('error-message-container')
var errorMsg = document.getElementById('error-message')

// Set up other vars
var timer = null
var currentAnswer = fieldProperties.CURRENT_ANSWER || ''

// Error cases
if (!isAndroid && (hidePhoneNumber === 1 || hidePhoneNumber === '1')) { // If the platform is not Android, then we cannot support making phone calls with the number hidden.
  btnCallPhone.disabled = true // Disable the call button.
  errorMsg.innerHTML = 'Sorry, this phone call cannot be made using this platform. Please open this form using SurveyCTO Collect for Android.' // Write the appropriate error message
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
    } else {
      targetPhoneNum.innerHTML = phoneNumberLabel // Otherwise, show the phone_number_label.
    }
  } else {
    targetPhoneNum.innerHTML = phoneNumber // The default case is to just show the destination phone number.
  }
}

// For non-Android platforms, set up the button to use a structured URL (as long as we're allowed to show the phone number).
if (!isAndroid && (hidePhoneNumber !== 1 && hidePhoneNumber !== '1')) {
  btnCallPhone.setAttribute('href', 'tel:' + phoneNumber)
}

function setUpCall () {
  btnCallPhone.classList.add('hidden')
  timer = setInterval(updateCallUI, 1000)
}

function updateCallUI () {
  updateCurrentCallStatus()
  statusContainer.innerHTML = currentCallStatus
  var currentCallStatusCode = getPhoneCallStatus()
  if (currentCallStatusCode === 1 || currentCallStatusCode === 2 || currentCallStatusCode === 8 || currentCallStatusCode === 9 || currentCallStatusCode === 10 || currentCallStatusCode === 11 || currentCallStatusCode === 13) {
    btnCallPhone.classList.add('hidden') // If the call state is dialing, connecting, or disconnecting, then hide the Call button.
  } else {
    btnCallPhone.classList.remove('hidden') // If the call state is not one of those three, make sure the call button is shown.
    if (currentCallStatusCode === 0 || currentCallStatusCode === 3 || currentCallStatusCode === 4 || currentCallStatusCode === 12) {
      callBtnTxt.innerHTML = 'ADD CALL' // If there is an ongoing call, change the button text to 'ADD CALL'
    } else {
      callBtnTxt.innerHTML = 'CALL' // Otherwise, revert the button text to 'CALL'
    }
  }
  if (currentCallStatusCode === 7) {
    clearInterval(timer) // If the call is disconnected, we no longer need to update the UI every second.
  }
}

// When loading, if there's an active call in progress, make sure to update UI.
if (getPhoneCallStatus() !== -1) {
  setUpCall()
  updateCallUI()
} else {
  statusContainer.parentElement.classList.add('text-green')
  statusContainer.innerHTML = 'Ready to call'
}

// Define what the 'CALL' button does.
btnCallPhone.onclick = function () {
  if (isAndroid) {
    makeAndroidCall()
  } else {
    makeGenericCall()
  }
}

// Define how Android devices should make calls.
function makeAndroidCall () {
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
      saveResponse(error)
      statusContainer.parentElement.classList.remove('text-green')
      statusContainer.innerHTML = error
      return
    } else {
      saveResponse('success')
    }
    // Update the call UI every second.
    setUpCall()
    statusContainer.parentElement.classList.remove('text-green')
    statusContainer.innerHTML = 'Connecting...'
  })
}

// Define what happens when non-Android platforms make calls.
function makeGenericCall () {
  btnCallPhone.onclick = function () {
    saveResponse('success')
  }
}

// Define how to store the response
function saveResponse (result) {
  if (result === 'success' && (hidePhoneNumber !== 1 && hidePhoneNumber !== '1')) {
    var successResponse = '[' + new Date().toLocaleString() + '] The following phone number was called: ' + phoneNumber + '.\n'
    currentAnswer += successResponse
    setAnswer(currentAnswer)
  } else if (result === 'success' && phoneNumberLabel) {
    var successResponse = '[' + new Date().toLocaleString() + '] The following phone number was called: ' + phoneNumberLabel + '.\n'
    currentAnswer += successResponse
    setAnswer(currentAnswer)
  } else if (result === 'success') {
    var successResponse = '[' + new Date().toLocaleString() + '] The following phone number was called: (Number hidden).\n'
    currentAnswer += successResponse
    setAnswer(currentAnswer)
  } else {
    var failResponse = '[' + new Date().toLocaleString() + '] Failure calling the following phone number: ' + phoneNumber + '.\n'
    currentAnswer += failResponse
    setAnswer(currentAnswer)
  }
}

// Translate phone states
// Since getPhoneCallStatus() will return integer values, we need to provide human-readable translations. See https://developer.android.com/reference/android/telecom/Call#STATE_ACTIVE for more details.
function updateCurrentCallStatus () {
  switch (getPhoneCallStatus()) {
    case -1: // Collect will return -1 when there is no call state
      currentCallStatus = 'Ready to make a call'
      break
    case 8: // STATE_SELECT_PHONE_ACCOUNT
    case 9: // STATE_CONNECTING
    case 11: // STATE_PULLING_CALL
      currentCallStatus = 'Connecting...'
      break
    case 1: // STATE_DIALING
      currentCallStatus = 'Dialing...'
      break
    case 2: // STATE_RINGING
    case 13: // STATE_SIMULATED_RINGING
      currentCallStatus = 'Ringing...'
      break
    case 0: // STATE_NEW
    case 3: // STATE_HOLDING
    case 4: // STATE_ACTIVE
    case 12: // STATE_AUDIO_PROCESSING
      currentCallStatus = 'Connected'
      break
    case 10: // STATE_DISCONNECTING
      currentCallStatus = 'Disconnecting...'
      break
    case 7: // STATE_DISCONNECTED
      currentCallStatus = 'Disconnected'
      break
    default:
      currentCallStatus = 'Unable to retrieve call status'
  }
}
