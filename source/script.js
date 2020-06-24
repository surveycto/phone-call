/* global getPluginParameter, setAnswer, makePhoneCall, getPhoneCallStatus */

// Get parameters info from the form definition
var phoneNumber = getPluginParameter('phone_number')

// Get information about the current device
var isAndroid = (document.body.className.indexOf('android-collect') >= 0)

// Get UI elements
var btnCallPhone = document.getElementById('btn-call-phone')
var statusContainer = document.getElementById('status-container')
var callDurationContainer = document.getElementById('call-duration')
var featureNotSupportedContainer = document.getElementById('feature-not-supported-container')

// Set up other vars
var timer = null
var lastDurationSeconds = null

// If the platform is not Android, then the calling function will not be supported.
if (!isAndroid) {
  btnCallPhone.disabled = true // Disable the call button.
  featureNotSupportedContainer.classList.remove('hidden') // Show the warning message.
}

// Format seconds in the mm:ss or hh:mm:ss format.
function formatDuration (totalSeconds) {
  var hours = Math.floor(totalSeconds / 3600)
  var minutes = Math.floor((totalSeconds - (hours * 3600)) / 60)
  var seconds = totalSeconds - (hours * 3600) - (minutes * 60)

  if (minutes < 10) {
    minutes = '0' + minutes
  }
  if (seconds < 10) {
    seconds = '0' + seconds
  }

  if (hours > 0) {
    if (hours < 10) {
      hours = '0' + hours
    }
    return hours + ':' + minutes + ':' + seconds
  } else {
    return minutes + ':' + seconds
  }
}

function setUpCall () {
  btnCallPhone.classList.add('hidden')
  lastDurationSeconds = 0
  timer = setInterval(updateCallUI, 1000)
}

function updateCallUI () {
  // Get status about the call.
  var callInfo = getOnGoingCallInfo()

  if (callInfo === null) { // Call is no longer active.
    clearInterval(timer)
    timer = null
    statusContainer.parentElement.classList.remove('text-green')
    statusContainer.innerHTML = 'Call ended'
    callDurationContainer.innerHTML = ' (' + formatDuration(lastDurationSeconds) + ')'
    btnCallPhone.classList.remove('hidden')
  } else { // Call is still active.
    lastDurationSeconds = callInfo.durationInSeconds
    if (callInfo.status === 'Dialing') {
      statusContainer.parentElement.classList.remove('text-green')
      statusContainer.innerHTML = 'Connecting...'
    } else if (callInfo.status === 'Active') {
      statusContainer.parentElement.classList.add('text-green')
      statusContainer.innerHTML = 'Connected'
    }
    callDurationContainer.innerHTML = ' (' + formatDuration(lastDurationSeconds) + ')'
  }
}

// When loading, if there's an active call in progress, make sure to update UI.
if (getOnGoingCallInfo() !== null) {
  setUpCall()
  updateCallUI()
} else {
  statusContainer.parentElement.classList.add('text-green')
  statusContainer.innerHTML = 'Ready to call'
  callDurationContainer.innerHTML = ''
}

// Define what the 'CALL' button does.
btnCallPhone.onclick = function () {
  if (isAndroid) {
    // There's already an ongoing call, so do nothing.
    if (timer !== null) {
      return
    }
    // Set the parameters for the intent.
    var params = {
      phone_number: phoneNumber
    }
    // Make the phone call.
    makePhoneCall(params, function (error) {
      // Some error occurred.
      if (error) {
        statusContainer.parentElement.classList.remove('text-green')
        statusContainer.innerHTML = error
        callDurationContainer.innerHTML = ''
        return
      }
      // Update the UI.
      setUpCall()
      statusContainer.parentElement.classList.remove('text-green')
      statusContainer.innerHTML = 'Connecting...'
      callDurationContainer.innerHTML = ' (' + formatDuration(lastDurationSeconds) + ')'
    })
  }
}