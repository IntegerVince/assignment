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
    
    // Fetch the result of whether or not the task matches the filter

    if (isValidInput($decodedData["taskName"]) && isValidInput($decodedData["taskDate"]) && isValidInput($decodedData["taskStatus"])){

        // Input was filtered & checked for invalid characters to prevent XSS attacks - no output escaping required

        // No Htmlentities conversion is done here as this is just a filter, not adding content to a database
        $result = matchWithFilter($decodedData["taskName"], $decodedData["taskDate"], $decodedData["taskStatus"], $decodedData["statusFilter"],  $decodedData["nameFilter"], $decodedData["dateStartFilter"], $decodedData["dateEndFilter"]);

        echo $result;

    } else {

        echo "FormatFail"; // Return failure of format checking

    }

} else {

    echo "Fail"; // Auth fail

}

?>