<?php

session_start(); # Starting the session

require '../required/database-functions.php'; # Connection to database & returns data on account session status

if (isset($_POST['taskID']) && $_POST['taskID'] != "") {

    deleteTaskAndReload($_SESSION['username'], $_SESSION['password'], $_POST['taskID']);

} else {

    $_SESSION['errorMessage'] = "Delete_Task_Failure";

    header('Location: ../pages/task-list.php'); # Redirect to task-list.php so it can be proccessed

}

?>