/* global getPluginParameter, setAnswer, makePhoneCall, getPhoneCallStatus, fieldProperties */

// Get parameters info from the form definition
var phoneNumber = getPluginParameter('phone_number')
var phoneNumberLabel = getPluginParameter('phone_number_label')
var hidePhoneNumberParam = getPluginParameter('hide_phone_number')

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
var hidePhoneNumberBool = (hidePhoneNumberParam === 1 || hidePhoneNumberParam === '1')

// Error cases (cases in which a call cannot be made)
if (!isAndroid && hidePhoneNumberBool) { // If the platform is not Android, then we cannot support making phone calls with the number hidden.
  btnCallPhone.disabled = true // Disable the call button.
  btnCallPhone.classList.add('disabled')
  currentCallStatus = ''
  errorMsg.innerHTML = 'Sorry, this phone call cannot be made using this platform. Please open this form using SurveyCTO Collect for Android.' // Write the appropriate error message
  errorMsgContainer.classList.remove('hidden') // Show the error message.
} else if (!phoneNumber || phoneNumber.length < 1) { // If there is no phone number provided, then we won't be able to make a call.
  btnCallPhone.disabled = true
  btnCallPhone.classList.add('disabled')
  currentCallStatus = ''
  errorMsg.innerHTML = 'Sorry, there was no phone number provided, so a call cannot be made.'
  errorMsgContainer.classList.remove('hidden')
} else if (fieldProperties.READONLY === true) {
  btnCallPhone.disabled = true
  btnCallPhone.classList.add('disabled')
  currentCallStatus = 'This field is currently read-only.'
}

// Show where the call is going. Hide the phone number as needed, based on the parameters.
if (phoneNumber) {
  if (hidePhoneNumberBool) {
    if (!phoneNumberLabel || phoneNumberLabel.length < 1) {
      targetPhoneNum.innerHTML = '(Number hidden)' // If hide_phone_number is set to 1 but there is no phone_number_label provided, show '(Number hidden)'.
    } else {
      targetPhoneNum.innerHTML = phoneNumberLabel // Otherwise, show the phone_number_label.
    }
  } else {
    targetPhoneNum.innerHTML = phoneNumber // The default case is to just show the destination phone number.
  }
}

// For non-Android platforms, set up the button to use a structured URL (as long as we're allowed to make a call).
if (!isAndroid && !hidePhoneNumberBool && btnCallPhone.disabled !== true) {
  btnCallPhone.setAttribute('href', 'tel:' + phoneNumber)
}

function setUpCall () {
  btnCallPhone.classList.add('hidden')
  timer = setInterval(updateCallUI, 1000)
}

function updateCallUI () {
	if(isAndroid) {
		// If the platform is Android, we can update the UI based on the current call status.
		updateCurrentCallStatus()
		statusContainer.innerHTML = currentCallStatus
		var currentCallStatusCode = getPhoneCallStatus()
		if (currentCallStatusCode === -1) {
			clearInterval(timer) // If there's no active call, we no longer need to update the UI every second.
			callBtnTxt.innerHTML = 'CALL' // Set the button text back to normal, in case it had been changed to 'ADD CALL'
			btnCallPhone.classList.remove('hidden')
		}
	} else {
		// For platforms other than Android, the call status is unavailable, so we just set it statically
		clearInterval(timer)
		callBtnTxt.innerHTML = 'CALL'
		btnCallPhone.classList.remove('hidden')
    statusContainer.innerHTML = currentCallStatus
	}
}

// When loading, if the platform is Android, we should check the call status to see if we need to update the UI right away.
if(isAndroid) {
	if (getPhoneCallStatus() !== -1) {
		//  If there's an active call in progress, set up the call and update the UI
		setUpCall()
		updateCallUI()
		callBtnTxt.innerHTML = 'ADD CALL'
		btnCallPhone.classList.remove('hidden')
	} else {
    // If there's no active call in progress, just set the status text
		statusContainer.innerHTML = currentCallStatus
	}
} else {
  // If the platform is not Android, then call status is unavailable, so no need to check it. Just update the UI.
  updateCallUI ()
}

// Define what the 'CALL' button does.
if (btnCallPhone.disabled !== true) {
  btnCallPhone.onclick = function () {
    if (isAndroid) {
      makeAndroidCall()
    } else {
      makeGenericCall()
    }
  }
}

// Define how Android devices should make calls.
function makeAndroidCall () {
  // Set the parameters for the call.
  var params = {
    phone_number: phoneNumber,
    phone_number_label: phoneNumberLabel,
    hide_phone_number: hidePhoneNumberParam
  }
  // Make the phone call.
  makePhoneCall(params, function (error) {
    // Some error occurred.
    if (error) {
      saveResponse(error)
      statusContainer.innerHTML = error
      return
    } else {
      saveResponse('success')
    }
    // Update the call UI every second.
    setUpCall()
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
  if (result === 'success' && !hidePhoneNumberBool) {
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
    var failResponse = '[' + new Date().toLocaleString() + '] Failure calling the following phone number: '
    if (!hidePhoneNumberBool) {
      failResponse += phoneNumber + '.\n'
    } else if (phoneNumberLabel) {
      failResponse += phoneNumberLabel + '.\n'
    } else {
      failResponse += '(Number hidden) .\n'
    }
    currentAnswer += failResponse
    setAnswer(currentAnswer)
  }
}

// Translate phone states
function updateCurrentCallStatus () {
	if(isAndroid && fieldProperties.READONLY === false) {
		// If the platform is Android, the call state can be accessed via getPhoneCallStatus().
		// Since getPhoneCallStatus() will return integer values, we need to provide human-readable translations. 
		// See https://developer.android.com/reference/android/telecom/Call#STATE_ACTIVE for more details.
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
	} else if (fieldProperties.READONLY === true) {
		currentCallStatus = 'This field is currently read-only.'
	}
}