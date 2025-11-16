<?php

# This page shouldn't be accessed directly, but there is no harm if they do. 
# Do not let them view warnings caused from a direct visit to the link.
error_reporting(0);

session_start(); # Starting the session

require '../required/database-functions.php'; # Connection to database & returns data on account session status

$data = file_get_contents("php://input"); // Read request data following headers

$decodedData = json_decode($data, true); // Fetch PHP associative array from the data read

if (checkSessionStatus() == "Valid" and $decodedData["taskName"] != ""){
    
    // User is currenly logged in with valid data + mandatory data [Task name] available

    if (isValidInput($decodedData["taskName"]) && isValidInput($decodedData["taskDate"])){

        // Input was filtered & checked for invalid characters to prevent XSS attacks - no output escaping required

        // Update the actual database
    
        // Htmlentities conversion is still done as another failproof method
        addTaskToUser($_SESSION["username"], $_SESSION["password"],htmlentities($decodedData["taskName"]),htmlentities($decodedData["taskDate"]));

        $userTasks = fetchTasks($_SESSION["username"], $_SESSION["password"]); // Get a list of the tasks again

        $lastTask = end($userTasks); // Get the last of the task list

        echo $lastTask["taskID"]; // Return task ID so it can be injected through javascript without refreshing the page

    } else {

        echo "FormatFail"; // Return failure of format checking

    }
    
} else {

    echo "Fail"; // Task Name Is Blank or Auth Fail

}

?>