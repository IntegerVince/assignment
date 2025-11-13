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

        } else { // No data was left blank, can proceed with database check

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
        }
    });
});