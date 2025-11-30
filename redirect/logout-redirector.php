<?php

session_start(); # Starting the session

if (empty($_SESSION['token'])) { // CSRF Token Check

    $_SESSION['token'] = bin2hex(random_bytes(32)); // No Token was found, assign one
    
}

# Remove sessions so the user does not get automatically logged in
$_SESSION["username"] = "";
$_SESSION["password"] = "";

require '../required/redirect-to-index.php'; # Redirect to index.php for rendering

?>