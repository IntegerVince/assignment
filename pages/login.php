<?php

# Setting where content is allowed from to include APIs like giphy & google fonts & google
header("Content-Security-Policy: default-src 'self'; script-src 'self' https://apis.google.com https://www.google.com/recaptcha/api.js https://www.gstatic.com/recaptcha/releases/TkacYOdEJbdB_JjX802TMer9/recaptcha__en.js; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https://*.giphy.com https://giphy.com https://i.giphy.com https://www.google.com/recaptcha/api.js; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://api.giphy.com https://giphy.com https://www.google.com/recaptcha/api2/clr; frame-src 'self' https://www.google.com https://accounts.google.com https://www.google.com/recaptcha/api.js; frame-ancestors 'self';");

session_start(); # Starting the session

if (empty($_SESSION['token'])) { // CSRF Token Check

    $_SESSION['token'] = bin2hex(random_bytes(32)); // No Token was found, assign one
    
}

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
echo $twig->render("signup-login-template.twig", array(

    "websiteName" => $websiteName,
    "templateType" => "Login",
    "csrfToken" => $_SESSION['token'] // Pass on the generated session csrf token

));

die(); # Kill The PHP Script since template was served

?>