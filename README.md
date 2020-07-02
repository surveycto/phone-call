# Phone call

![](extras/phone-call.jpg)

## Description

Use this field plug-in if you would like to make a phone call as part of your form. If you are using Collect v2.70.4 or later for Android, this phone call can be made directly within the app.

[![Download now](extras/download-button.png)](https://github.com/surveycto/phone-call/raw/master/phone-call.fieldplugin.zip)

## Features

* The phone number can be hidden from the user (to protect the identity of the respondent).*
* An alternate label can be supplied to replace the real phone number. This can be helpful if you wish to hide the number, but still want some way to help the enumerator identify the respondent.*
* Supports the `text` field type, but doesn't provide an actual text input.

\* Only available on Android.

## How the response is stored

> [`TIMESTAMP`] The following phone number was called:  `phone_number`.

* This response will use the `phone_number` value from the parameter, and `TIMESTAMP` will be the current date and time.
* If you're using iOS or web forms, this response will be appended to the response (on a new line) whenever the _Call_ button is clicked.
* If you're using Android, this response will be appended to the response (on a new line)

> [`TIMESTAMP`] Failure calling the following phone number: `phone_number`.

* If you're using Android, the above response will be appended to the current response (on a new line) if there was an error launching the dialer app.

## How to use

1. Download the sample form [extras/sample-form](https://github.com/surveycto/phone-call/raw/master/extras/sample-form/Phone%20call%20sample%20form.xlsx) from this repo and upload it to your SurveyCTO server.
1. Download the [phone-call.fieldplugin.zip](https://github.com/surveycto/phone-call/raw/master/phone-call.fieldplugin.zip) file from this repo, and attach it to the test form on your SurveyCTO server.
1. Make sure to provide the correct parameters (see below).

## Parameters

| Key | Value |
| --- | --- |
| `phone_number` (required) | The phone number to dial. |
| `hide_phone_number` (optional) | Set this to `1` to hide the phone number from the user. If this is enabled, calls can only be made on Android while _Collect_ is the default phone app. Setting this to `1` will disable this field for iOS and web. |
| `phone_number_label` (optional) | Supply an alternate label to use for the phone number when `hide_phone_number=1`. |

**Note:** it is suggested to use values stored in other fields for the parameters. Take a look at the test form to see how this is accomplished.

## More resources

* **Sample form**  
[extras/sample-form](https://github.com/surveycto/phone-call/raw/master/extras/sample-form/Phone%20call%20sample%20form.xlsx)
* **Developer documentation**  
Instructions and resources for developing your own field plug-ins.  
[https://github.com/surveycto/Field-plug-in-resources](https://github.com/surveycto/Field-plug-in-resources)
* **User documentation**  
How to get started using field plug-ins in your SurveyCTO form.  
[https://docs.surveycto.com/02-designing-forms/03-advanced-topics/06.using-field-plug-ins.html](https://docs.surveycto.com/02-designing-forms/03-advanced-topics/06.using-field-plug-ins.html)
