var isAndroid = (document.body.className.indexOf("android-collect") >= 0);
var phoneNumber = getPluginParameter('phone_number');
var btnCallPhone = document.getElementById('btn-call-phone');
var btnHangUp = document.getElementById('btn-hang-up');
var statusContainer = document.getElementById('status-container');
var featureNotSupportedContainer = document.getElementById('feature-not-supported-container');
var timer = null;

// If the platform is not Android, then the calling function will not be supported.
if (!isAndroid) {
    btnCallPhone.disabled = true; // disable the call button
    featureNotSupportedContainer.classList.remove("hidden"); // show the warning message
}

function setUpCall() {
    btnCallPhone.classList.add("hidden");
    btnHangUp.classList.remove("hidden");
    timer = setInterval(updateCallUI, 1000);
}

function updateCallUI() {
    // get status about the call.
    var callInfo = getOnGoingCallInfo();
    console.log(callInfo);

    // call no longer active.
    if (callInfo === null) {
        clearInterval(timer);
        timer = null;
        statusContainer.innerHTML = "";
        btnCallPhone.classList.remove("hidden");
        btnHangUp.classList.add("hidden");
    }
    // call still active.
    else {
        statusContainer.innerHTML = "CallInfo:" + JSON.stringify(callInfo);
    }

}

// when loading, if there's an active call in progress, make sure to update UI.
if (getOnGoingCallInfo() !== null) {
    setUpCall();
}

// define what the "CALL" button does
btnCallPhone.onclick = function () {
    if (isAndroid) {
        // There's already an on-going call, so do nothing.
        if (timer !== null) {
            console.log("Call already active. Skipping...");
            return;
        }
        // set the parameters for the intent
        var params = {
            phone_number: phoneNumber
        };
        // make the phone call.
        makePhoneCall(params, function (error) {
            // some error occurred.
            if (error) {
                statusContainer.innerHTML = error;
                return;
            }
            // update the UI.
            setUpCall();
        });
    }
};

// define what the "END CALL" button does
btnHangUp.onclick = function () {
    hangUpOnGoingCall();
};
