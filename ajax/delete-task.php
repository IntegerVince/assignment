<?php

# This page shouldn't be accessed directly, but there is no harm if they do. 
# Do not let them view warnings caused from a direct visit to the link.
error_reporting(0);

session_start(); # Starting the session

require '../required/database-functions.php'; # Connection to database & returns data on account session status

$data = file_get_contents("php://input"); // Read request data following headers

$decodedData = json_decode($data, true); // Fetch PHP associative array from the data read

if (checkSessionStatus() == "Valid" and $decodedData["taskID"] != -1){
    
    // User is currenly logged in with valid data + mandatory data [Task ID] available
    
    // Update the actual database
   
   $deletionResult = DeleteTask($_SESSION["username"], $_SESSION["password"],$decodedData["taskID"]);

   echo $deletionResult; // Return the status for processing from javascript file

} else {

    echo "Fail"; // Task ID is missing or auth fail

}

?>