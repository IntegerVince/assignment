<?php

session_start(); # Starting the session

if (isset($_SESSION["username"]) and isset($_SESSION["password"])){ # Check if login details are saved in a session to automatically login
            
    if ($_SESSION["username"] != "" and $_SESSION["password"] != ""){ # Check if they are set with actual values, and not just reset
        
        # We have account data stored in the session - good!

        if (isset($_POST["ftask_add"])){

            # We also have the mandatory POST data for the task to add - this URL was not accessed directly

            
        } else {

           require '../required/redirect-to-index.php'; # The link was accessed directly, redirecting to home page..

        }
    
    } else {

        require '../required/redirect-to-index.php'; # The link was accessed directly, redirecting to home page..

    }
} else {

    require '../required/redirect-to-index.php'; # The link was accessed directly, redirecting to home page..

}
?>