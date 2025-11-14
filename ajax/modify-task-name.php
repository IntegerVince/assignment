<?php

# This page shouldn't be accessed directly, but there is no harm if they do. 
# Do not let them view warnings caused from a direct visit to the link.
error_reporting(0);

session_start(); # Starting the session

require '../required/database-functions.php'; # Connection to database & returns data on account session status

$data = file_get_contents("php://input"); // Read request data following headers

$decodedData = json_decode($data, true); // Fetch PHP associative array from the data read

if (checkSessionStatus() == "Valid" and $decodedData["taskName"] != "" and $decodedData["taskID"] != -1){
    
    // User is currenly logged in with valid data + mandatory data [task name] available

    if (isValidInput($decodedData["taskName"]) && isValidInput($decodedData["taskID"])){

        // Input was filtered & checked for invalid characters to prevent XSS attacks - no output escaping required

        // Update the actual database

        $resultOfModification = modifyTaskDescription($_SESSION['username'], $_SESSION['password'], $decodedData["taskID"], $decodedData["taskName"]);
        
        echo $resultOfModification; // Return the status for processing from javascript file

    } else {

        echo "FormatFail"; // Return failure of format checking

    }

} else {

    if ($decodedData["taskName"] == ""){

        echo "Blank";

    } else if ($decodedData["taskID"] == -1){

        echo "BlankTaskID";

    } else {

        echo "AuthFailure";   
    }

}

?>