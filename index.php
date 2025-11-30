<?php

session_start(); # Starting the session

if (empty($_SESSION['token'])) { // CSRF Token Check

    $_SESSION['token'] = bin2hex(random_bytes(32)); // No Token was found, assign one
    
}

require 'required/database-functions.php'; # Connection to database & database functions

if (checkSessionStatus() == "Valid") {

    # We have valid account data stored

    header('Location: pages/task-list.php'); # Redirect to task-list.php so that the user is automatically logged in

    die(); # Kill The PHP Script since there is a redirection

} else if (checkSessionStatus() == "Invalid") { // Invalid Sessions Are Stored

    # Reset the invalid Sessions
    $_SESSION["username"] = "";
    $_SESSION["password"] = "";

}

# At this stage, it means that there were no username and password sessions stored

header('Location: pages/login.php'); # Serve login page
die();

?>