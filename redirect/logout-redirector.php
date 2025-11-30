<?php

# Setting where content is allowed from to include APIs like giphy & google fonts & google
header("Content-Security-Policy: default-src 'self'; script-src 'self' https://apis.google.com https://www.google.com/recaptcha/api.js https://www.gstatic.com/recaptcha/releases/TkacYOdEJbdB_JjX802TMer9/recaptcha__en.js; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https://*.giphy.com https://giphy.com https://i.giphy.com https://www.google.com/recaptcha/api.js; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://api.giphy.com https://giphy.com https://www.google.com/recaptcha/api2/clr; frame-src 'self' https://www.google.com https://accounts.google.com https://www.google.com/recaptcha/api.js;");

session_start(); # Starting the session

if (empty($_SESSION['token'])) { // CSRF Token Check

    $_SESSION['token'] = bin2hex(random_bytes(32)); // No Token was found, assign one
    
}

# Remove sessions so the user does not get automatically logged in
$_SESSION["username"] = "";
$_SESSION["password"] = "";

require '../required/redirect-to-index.php'; # Redirect to index.php for rendering

?>