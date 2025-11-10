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


    # Explode is used to seperate status message from user ID
    # Index 0 = Status
    # Index 1 = UserID (If Valid)

    $accountResult = explode("-", checkDatabaseAccount($decodedData["username"], $decodedData["password"]));

}

echo $accountResult[0]; // Return the result of the login attempt which will be caught from the fetch request

?>