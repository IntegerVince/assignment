<?php

# This page shouldn't be accessed directly, but there is no harm if they do. 
# Do not let them view warnings caused from a direct visit to the link.
error_reporting(0);

session_start(); # Starting the session

require '../required/database-functions.php'; # Connection to database & returns data on account session status

$data = file_get_contents("php://input"); // Read request data following headers

$decodedData = json_decode($data, true); // Fetch PHP associative array from the data read

if (checkSessionStatus() == "Valid"){
    
    // User is currenly logged in with valid data
    
    // Update the actual database
   
   $filteredTasks = fetchTasksAndFilter($_SESSION["username"], $_SESSION["password"], $decodedData["statusFilter"], $decodedData["nameFilter"], $decodedData["dateStartFilter"], $decodedData["dateEndFilter"]);

   echo json_encode($filteredTasks); // Return the tasks as a JSON string for processing from javascript file

} else {

    echo "Fail"; // Auth fail

}

?>