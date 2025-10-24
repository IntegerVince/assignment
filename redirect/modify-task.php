<?php

session_start(); # Starting the session

require '../required/database-functions.php'; # Connection to database & returns data on account session status

if (isset($_POST['taskDescription']) && $_POST['taskDescription'] != "" && isset($_POST['taskID']) && $_POST['taskID'] != "") {

    // Task Description Data & taskID Data Recieved - Can Proceed

    modifyTaskDescription($_SESSION['username'], $_SESSION['password'], $_POST['taskID'], $_POST['taskDescription']);

} else if (isset($_POST['taskDueDateModification']) && $_POST['taskDueDateModification'] == "true" && isset($_POST['taskID']) && $_POST['taskID'] != "") {

     // Task Due Date Modification Called & taskID Data Recieved - Can Proceed

    if (isset($_POST['taskDueDate']) and $_POST["taskDueDate"] != ""){

        // Date was not left as blank - update new date value

        modifyTaskDate($_SESSION['username'], $_SESSION['password'], $_POST['taskID'], $_POST['taskDueDate']);

    } else {

        // Date was left as blank - update to have no due date (0000-00-00)
        
        modifyTaskDate($_SESSION['username'], $_SESSION['password'], $_POST['taskID'], "0000-00-00");

    }

} else if (isset($_POST['taskStatusAction']) && $_POST['taskStatusAction'] == "true" && isset($_POST['taskID']) && $_POST['taskID'] != "") {

    // Task Swap Called & taskID Data Recieved - Can Proceed

    modifyTaskStatus($_SESSION['username'], $_SESSION['password'], $_POST['taskID']);

} else {

    $_SESSION['errorMessage'] = "Modify_Task_Failure";

    header('Location: ../pages/task-list.php'); # Redirect to task-list.php so it can be proccessed

}

?>