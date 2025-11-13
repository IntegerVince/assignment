document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("loginForm").addEventListener("submit", function (buttonEvent){

        buttonEvent.preventDefault(); // Prevent the button from automatically redirecting

        // Fetch the data from the input forms
        var username = document.getElementById("fname").value;
        var password = document.getElementById("fpass").value;

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

    });
});