<?php

session_start(); # Starting the session

require '../required/twig-loader.php'; # Shortcut to load composer, twig & its templates

require '../required/database-functions.php'; # Connection to database & database functions

if (checkSessionStatus() == "Valid") {

    # We have valid account data stored - this link was accessed directly

    header('Location: pages/task-list.php'); # Redirect to task-list.php so that the user is automatically logged in

    die(); # Kill The PHP Script since there is a redirection

} else if (checkSessionStatus() == "Invalid") { // Invalid Sessions Are Stored - this link was accessed directly

    # Reset the invalid Sessions
    $_SESSION["username"] = "";
    $_SESSION["password"] = "";

}

# At this stage, it means that there were no username and password sessions stored

# Render in the login page
echo $twig->render("signup-login-template.php", array(

    "websiteName" => $websiteName,
    "templateType" => "Login"

));

die(); # Kill The PHP Script since template was served

?>