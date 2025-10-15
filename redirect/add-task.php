<?php

session_start(); # Starting the session

require '../required/database-functions.php'; # Connection to database & returns data on account session status

if (checkSessionStatus() == "Valid" and isset($_POST["ftask_add"])){ # User is currenly logged in with valid data + mandatory POST data

   # Process recieved information

   echo(addTaskToUser($_SESSION["username"], $_SESSION["password"],"temp1","temp2"));


} else {

    require '../required/redirect-to-index.php'; # The link was accessed directly, redirecting to home page..

}

?>