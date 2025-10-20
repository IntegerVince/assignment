<?php

session_start(); # Starting the session

require '../required/database-functions.php'; # Connection to database & returns data on account session status

if (isset($_POST['taskID'])) {

    deleteTaskAndReload($_SESSION['username'], $_SESSION['password'], $_POST['taskID']);

} else {

    require '../required/redirect-to-index.php'; # The link was accessed directly, redirecting to home page..

}

?>