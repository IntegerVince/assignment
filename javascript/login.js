document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("loginForm").addEventListener("submit", function (buttonEvent){

        buttonEvent.preventDefault(); // Prevent the button from automatically redirecting

        // Fetch the data from the input forms
        var username = document.getElementById("fname").value;
        var password = document.getElementById("fpass").value;

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

            }).then(function(data){ // // Fetch the result and pass it into data

                if (data != "Valid"){ // A login data was not valid

                    errorMessage = document.getElementById("errorMessage");
                    
                    if (data == "InvalidPassword"){

                        errorMessage.textContent = "Error! That password is incorrect";

                    } else if (data == "InvalidUsername"){

                        errorMessage.textContent = "Error! That username does not exist";

                    } else if (data == "NoAccounts"){

                        errorMessage.textContent = "Error! No accounts currently exist in the database";

                    }

                } else {

                    // The login credentials were valid

                    document.getElementById("loginForm").submit(); // Submit the form for login

                }

            })

        } else {

            errorMessage = document.getElementById("errorMessage");

            errorMessage.textContent = "Error! Invalid characters! Make sure you only include characters, numbers, and \"-\" symbol";
            
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