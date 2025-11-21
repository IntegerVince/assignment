<?php

# This page shouldn't be accessed directly, but there is no harm if they do. 
# Do not let them view warnings caused from a direct visit to the link.
error_reporting(0);

session_start(); # Starting the session

require '../required/database-functions.php'; # Connection to database & returns data on account session status

$data = file_get_contents("php://input"); // Read request data following headers

$decodedData = json_decode($data, true); // Fetch PHP associative array from the data read

if (checkSessionStatus() == "Valid" and $decodedData["taskID"] != -1){
    
    // User is currenly logged in with valid data + mandatory data [task ID] available

    if (isValidInput($decodedData["taskID"]) and isValidInput($decodedData["textAreaInput"])){

        // Input was filtered & checked for invalid characters to prevent XSS attacks - no output escaping required

        if (strlen($decodedData["textAreaInput"]) <= 176){

            // Length is valid

            // Update the actual database

            // Htmlentities conversion is still done as another failproof method

            $resultOfUpdate = setTaskAdditionalText($_SESSION['username'], $_SESSION['password'], $decodedData["taskID"], htmlentities($decodedData["textAreaInput"]));
            
            echo $resultOfUpdate; // Return the status for processing from javascript file

        } else {

            // Length is invalid

            echo "LengthFail";
            
        }

    } else {

        echo "FormatFail"; // Return failure of format checking

    }
    
} else {

    echo "Fail"; // Task ID Is Blank or Auth Fail

}

?>