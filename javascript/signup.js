document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("signupForm").addEventListener("submit", function (buttonEvent){

        buttonEvent.preventDefault(); // Prevent the button from automatically redirecting

        // Validate the CSRF Token before anything else
        fetch("../ajax/validate-csrfToken.php", { // Send a fetch request where to send the data in for validation

            "method": "POST", // Specify that the data will be passed as POST

            "headers": {

                "Content-Type": "application/json; charset=utf8" // Specify the type of data that will be passed

            },

            "body": JSON.stringify( // Convert the JSON Object to a JSON string before passing

                // The actual data being passed [A JSON Object]

                {
                    "csrfToken": document.getElementById("csrfToken").value,
                }
            )
        }).then(function(response){ // Catch the response

            return response.text(); // Return the response

        }).then(function(csrfTokenData){ // Fetch the result and pass it into data

            if (csrfTokenData == "Valid"){ // Token is valid so we can proceed

                // Verify captcha data before putting additional load on the database through ajax checking

                if (grecaptcha.getResponse() == ""){

                    // Recaptcha field was left blank

                    errorMessage = document.getElementById("errorMessage");

                    errorMessage.textContent = "Error! Recaptcha is blank! Please fill it out before submitting";

                } else {

                    // Can validate captcha information

                    fetch("../ajax/verify-captcha.php", { // Send a fetch request where to send the data in for validation

                        "method": "POST", // Specify that the data will be passed as POST

                        "headers": {

                            "Content-Type": "application/json; charset=utf8" // Specify the type of data that will be passed

                        },

                        "body": JSON.stringify( // Convert the JSON Object to a JSON string before passing

                            // The actual data being passed [A JSON Object]

                            {
                                "captchaToken": grecaptcha.getResponse()
                            }
                        )
                    }).then(function(response){ // Catch the response

                        return response.text(); // Return the response

                    }).then(function(data){ // Fetch the result and pass it into data

                        if (data == "Success"){

                            // Successful captcha - can proceed with processing provided information

                            // Fetch the data from the input forms
                            var username = document.getElementById("fname").value;
                            var password = document.getElementById("fpass").value;

                            if (username == "" && password == ""){

                                errorMessage = document.getElementById("errorMessage");

                                errorMessage.textContent = "Error! Username and Password cannot be left blank!";

                            } else if (username == ""){

                                errorMessage = document.getElementById("errorMessage");

                                errorMessage.textContent = "Error! Username cannot be left blank!";

                            } else if (password == ""){

                                errorMessage = document.getElementById("errorMessage");

                                errorMessage.textContent = "Error! Password cannot be left blank!";

                            } else { // No data was left blank

                                if (isValidInput(username)){

                                    // Input was filtered & checked for invalid characters to prevent XSS attacks - no output escaping required

                                    if (username.length <= 32){ // Username limit not exceeded

                                        if (password.length <= 32){ // Password limit not exceeded

                                            // All checks made - can procceed

                                            fetch("../ajax/login-signup-auth.php", { // Send a fetch request where to send the data in for validation

                                                "method": "POST", // Specify that the data will be passed as POST

                                                "headers": {

                                                    "Content-Type": "application/json; charset=utf8" // Specify the type of data that will be passed

                                                },

                                                "body": JSON.stringify( // Convert the JSON Object to a JSON string before passing

                                                    // The actual data being passed [A JSON Object]

                                                    {
                                                        "username": username,
                                                        "password": password
                                                    }
                                                )
                                            }).then(function(response){ // Catch the response

                                                return response.text(); // Return the response

                                            }).then(function(data){ // Fetch the result and pass it into data

                                                if (data == "InvalidUsername" || data == "NoAccounts"){ // Username is unique or no accounts in database, so we can proceed

                                                    // The username is unique so we can create an account for the user

                                                    document.getElementById("signupForm").submit(); // Submit the form for login

                                                } else if (data == "FormatFail"){

                                                    errorMessage = document.getElementById("errorMessage");

                                                    errorMessage.textContent = "Error! Invalid characters! Make sure you only include letters, numbers, and \"-\" symbol";

                                                }  else if (data == "LengthFailUsername"){

                                                    errorMessage = document.getElementById("errorMessage");

                                                    errorMessage.textContent = "Error! Username has exceeded character limit! Make sure it is 32 characters or less";

                                                }  else if (data == "LengthFailPassword"){

                                                    errorMessage = document.getElementById("errorMessage");

                                                    errorMessage.textContent = "Error! Password has exceeded character limit! Make sure it is 32 characters or less";

                                                } else {

                                                    errorMessage = document.getElementById("errorMessage");

                                                    errorMessage.textContent = "Error! That username is not unique!";
                                                    
                                                }
                                            })

                                        } else {

                                            errorMessage = document.getElementById("errorMessage");

                                            errorMessage.textContent = "Error! Password has exceeded character limit! Make sure it is 32 characters or less";

                                        }

                                    } else {

                                        errorMessage = document.getElementById("errorMessage");

                                        errorMessage.textContent = "Error! Username has exceeded character limit! Make sure it is 32 characters or less";

                                    }

                                } else {

                                    errorMessage = document.getElementById("errorMessage");

                                    errorMessage.textContent = "Error! Invalid characters! Make sure you only include letters, numbers, and \"-\" symbol";
                                }
                            }

                        } else {

                            errorMessage = document.getElementById("errorMessage");

                            errorMessage.textContent = "Error! Invalid Recaptcha! Please Try Again";

                        }
                    })
                    
                    // In all instances, the recaptcha needs to be reset after a check is done so the user can't spam the server

                    grecaptcha.reset();

                }
            }
        });
    });
});

// Checks if an input respects the allowedCharacters criteria -> Input filtering + Output Escaping two-in-one function
// (rejects special characters)

function isValidInput(input){

    var allowedCharacters = "abcdefghijklmnopqrstuvwxyz1234567890-"; // Stores allowed characters - reject other characters to prevent any XSS attacks
    var characterAllowed = false;

    for (x = 0; x != input.length; x++){ // Iterate through input characters

        for (y = 0; y != allowedCharacters.length; y++){ // Iterate through allowed characters

            if (input[x].toLowerCase() == allowedCharacters[y]){
                
                characterAllowed = true; // Character is allowed

                break; // Escape the loop

            }

        }

        if (characterAllowed){ // Character was allowed

            characterAllowed = false; // Reset character for next check

        } else {

            return false; // Character was not allowed - reject the string for this reason
            
        }
    }

    return true; // No disallowed characters were spotted - accept the input

}