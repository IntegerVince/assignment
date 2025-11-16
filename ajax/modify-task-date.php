<?php

# This page shouldn't be accessed directly, but there is no harm if they do. 
# Do not let them view warnings caused from a direct visit to the link.
error_reporting(0);

session_start(); # Starting the session

require '../required/database-functions.php'; # Connection to database & returns data on account session status

$data = file_get_contents("php://input"); // Read request data following headers

$decodedData = json_decode($data, true); // Fetch PHP associative array from the data read

if (checkSessionStatus() == "Valid" and $decodedData["taskID"] != -1){
    
    // User is currenly logged in with valid data + mandatory data [task ID] available

    if (isValidInput($decodedData["taskID"])){

        // Input was filtered & checked for invalid characters to prevent XSS attacks - no output escaping required

        // Update the actual database

        if ($decodedData["taskDueDate"] == ""){ // Date is Blank, so no deadline (0000-00-00)

            // Htmlentities conversion is not required here because the data inputted is by the system

            $resultOfModification = modifyTaskDate($_SESSION['username'], $_SESSION['password'], $decodedData["taskID"], "0000-00-00");
            echo $resultOfModification; // Return the status for processing from javascript file

        } else { // Date is set, so pass that on

            if (isValidInput($decodedData["taskDueDate"])){ // Also check for due date validity

                // Input was filtered & checked for invalid characters to prevent XSS attacks - no output escaping required

                // Htmlentities conversion is still done as another failproof method

                $resultOfModification = modifyTaskDate($_SESSION['username'], $_SESSION['password'], htmlentities($decodedData["taskID"]), htmlentities($decodedData["taskDueDate"]));
                echo $resultOfModification; // Return the status for processing from javascript file

            } else {

                echo "FormatFail"; // Return failure of format checking

            }

        }

    } else {

        echo "FormatFail"; // Return failure of format checking

    }

} else {

    echo "Fail"; // Task ID Is Blank or Auth Fail

}

?>