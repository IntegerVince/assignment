document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("signupForm").addEventListener("submit", function (buttonEvent){

        buttonEvent.preventDefault(); // Prevent the button from automatically redirecting

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

                fetch("../ajax/login-signup-auth.php", { // Send a fetch request where to send the data in for validation

                    "method": "POST", // // Specify that the data will be passed as POST

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

                    } else {

                        errorMessage = document.getElementById("errorMessage");

                        errorMessage.textContent = "Error! That username is not unique!";
                        
                    }
                })

            } else {

                errorMessage = document.getElementById("errorMessage");

                errorMessage.textContent = "Error! Invalid characters! Make sure you only include characters, numbers, and \"-\" symbol";
            }
        }
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
                
                characterAllowed = true; // Charcter is allowed

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