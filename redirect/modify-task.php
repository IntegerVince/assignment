<?php

session_start(); # Starting the session

require '../required/database-functions.php'; # Connection to database & returns data on account session status

if (isset($_POST['taskDescription']) && $_POST['taskDescription'] != "" && isset($_POST['taskID']) && $_POST['taskID'] != "") {

    // Task Description Data & taskID Data Recieved - Can Proceed

    echo 'Description Change';

} else if (isset($_POST['taskDueDate']) && $_POST['taskDueDate'] != "" && isset($_POST['taskID']) && $_POST['taskID'] != "") {

    // Task Due Date taskID Data Recieved - Can Proceed

    echo 'Due Date Change';

} else if (isset($_POST['taskStatusAction']) && $_POST['taskStatusAction'] == "true" && isset($_POST['taskID']) && $_POST['taskID'] != "") {

    // Task Swap Called & taskID Data Recieved - Can Proceed

    echo 'Status Swap';

} else {

    $_SESSION['errorMessage'] = "Modify_Task_Failure";

    header('Location: ../pages/task-list.php'); # Redirect to task-list.php so it can be proccessed

}

?>