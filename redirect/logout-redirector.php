<?php

session_start(); # Starting the session

# Remove sessions so the user does not get automatically logged in
$_SESSION["username"] = "";
$_SESSION["password"] = "";

header('Location: ../'); # Redirect to index.php for rendering
die();

?>