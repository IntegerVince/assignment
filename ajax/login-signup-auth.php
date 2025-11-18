<?php

# This page shouldn't be accessed directly, but there is no harm if they do. 
# Do not let them view warnings caused from a direct visit to the link.
error_reporting(0);

require '../required/database-functions.php'; # Connection to database & database functions

$data = file_get_contents("php://input"); // Read request data following headers

$decodedData = json_decode($data, true); // Fetch PHP associative array from the data read

# Prevent unneccessry database load if the data is blank
# The data is already checked if blank in javascript prior to fetching, but if it's bypassed, it's checked here too
if ($decodedData["username"] != "" && $decodedData["password"] != ""){ 

    if (isValidInput($decodedData["username"])){

        if (strlen($decodedData["username"]) <= 32){ // Username does not exceed character limit

            if (strlen($decodedData["password"]) <= 32){

                // Input was filtered & checked for invalid characters to prevent XSS attacks - no output escaping required

                # Explode is used to seperate status message from user ID
                # Index 0 = Status
                # Index 1 = UserID (If Valid)

                // No Htmlentities conversion is done here as this is just a fetcher of database content

                $accountResult = explode("-", checkDatabaseAccount($decodedData["username"], $decodedData["password"]));

                echo $accountResult[0]; // Return the result of the login attempt which will be caught from the fetch request

            } else {

                echo "LengthFailPassword"; // Password exceeds character limit

            }

        } else {
            
            echo "LengthFailUsername"; // Username exceeds character limit

        }

    } else {

        echo "FormatFail"; // Return failure of format checking

    }

}

?>