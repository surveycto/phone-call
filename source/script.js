var isAndroid = (document.body.className.indexOf("android-collect") >= 0)
var phoneNumber = getPluginParameter('phone_number')
var btnCallPhone = document.getElementById('btn-call-phone')
var btnHangUp = document.getElementById('btn-hang-up')
var statusContainer = document.getElementById('status-container')
var callDurationContainer = document.getElementById('call-duration')
var featureNotSupportedContainer = document.getElementById('feature-not-supported-container')
var timer = null
var lastDurationSeconds = null

// If the platform is not Android, then the calling function will not be supported.
if (!isAndroid) {
    btnCallPhone.disabled = true // Disable the call button.
    featureNotSupportedContainer.classList.remove("hidden") // Show the warning message.
}

// Format seconds in the mm:ss or hh:mm:ss format.
function formatDuration(total_seconds) {
    var hours = Math.floor(total_seconds / 3600)
    var minutes = Math.floor((total_seconds - (hours * 3600)) / 60)
    var seconds = total_seconds - (hours * 3600) - (minutes * 60)

    if (minutes < 10) {
        minutes = "0" + minutes
    }
    if (seconds < 10) {
        seconds = "0" + seconds
    }

    if (hours > 0) {
        if (hours < 10) {
            hours = "0" + hours
        }
        return hours + ':' + minutes + ':' + seconds

    } else {
        return minutes + ':' + seconds
    }
}

function setUpCall() {
    btnCallPhone.classList.add("hidden")
    btnHangUp.classList.remove("hidden")
    lastDurationSeconds = 0
    timer = setInterval(updateCallUI, 1000)
}

function updateCallUI() {
    // Get status about the call.
    var callInfo = getOnGoingCallInfo()

    // Call is no longer active.
    if (callInfo === null) {
        clearInterval(timer)
        timer = null
        statusContainer.parentElement.classList.remove("text-green")
        statusContainer.innerHTML = "Call ended"
        callDurationContainer.innerHTML = " (" + formatDuration(lastDurationSeconds) + ")"
        btnCallPhone.classList.remove("hidden")
        btnHangUp.classList.add("hidden")
    }
    // Call is still active.
    else {
        lastDurationSeconds = callInfo.durationInSeconds
        if (callInfo.status === "Dialing") {
            statusContainer.parentElement.classList.remove("text-green")
            statusContainer.innerHTML = "Connecting..."
        } else if (callInfo.status === "Active") {
            statusContainer.parentElement.classList.add("text-green")
            statusContainer.innerHTML = "Connected"
        }
        callDurationContainer.innerHTML = " (" + formatDuration(lastDurationSeconds) + ")"
    }
}

// When loading, if there's an active call in progress, make sure to update UI.
if (getOnGoingCallInfo() !== null) {
    setUpCall()
    updateCallUI()
} else {
    statusContainer.parentElement.classList.add("text-green")
    statusContainer.innerHTML = "Ready to call"
    callDurationContainer.innerHTML = ""
}

// Define what the "CALL" button does.
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
                statusContainer.parentElement.classList.remove("text-green")
                statusContainer.innerHTML = error
                callDurationContainer.innerHTML = ""
                return
            }
            // Update the UI.
            setUpCall()
            statusContainer.parentElement.classList.remove("text-green")
            statusContainer.innerHTML = "Connecting..."
            callDurationContainer.innerHTML = " (" + formatDuration(lastDurationSeconds) + ")"
        })
    }
}

// Define what the "END CALL" button does.
btnHangUp.onclick = function () {
    hangUpOnGoingCall()
}
