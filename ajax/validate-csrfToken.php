<?php

# This page shouldn't be accessed directly, but there is no harm if they do. 
# Do not let them view warnings caused from a direct visit to the link.
error_reporting(0);

session_start(); # Starting the session

require '../required/database-functions.php'; # Connection to database & returns data on account session status

$data = file_get_contents("php://input"); // Read request data following headers

$decodedData = json_decode($data, true); // Fetch PHP associative array from the data read

// Check if the passed csrf Token matches the one stored in the session and return the status

if ($decodedData["csrfToken"] == $_SESSION["token"]){

    echo "Valid";

} else {

    echo "Fail";

}

?>