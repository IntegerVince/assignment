<?php

# session_start(); is not included here because the caller script already does this



# Checks the status of the current sessions for username and password (if set) and returns a status
#
# Valid - Account session data is valid
# Invalid - Account session data is invalid
# SetAsBlank - There are no sessions as they were set to be blank (thus exist but empty), such as through a logout
# NotSet - Sessions are not set
function checkSessionStatus() {

    if (isset($_SESSION["username"]) and isset($_SESSION["password"])){
                
        if ($_SESSION["username"] != "" and $_SESSION["password"] != ""){ # Check if they are set with actual values, and not just reset

            # We have account data stored - will be checked with database & processed accordingly

            if (explode("-",checkDatabaseAccount($_SESSION["username"], $_SESSION["password"]))[0] == "Valid"){

                # Username and Password From Session Valid

                return "Valid";

            } else {

                # No matching account from the session was found

                return "Invalid";

            }

        } else {

            # Sessions were set as blank (such as through a logout) 

            return "SetAsBlank";

        }

    } else {

        # Sessions are not set

        return "NotSet";

    }

}

# Given a username and password, goes through the database and returns a status
#
# Valid-UserID (Example: Valid-5) - Username and password valid + UserID of the account
# InvalidPassword-null - Account password is incorrect
# InvalidUsername-null - Account username does not exist
# NoAccounts-null - No accounts were found

function checkDatabaseAccount($accountUsername, $accountPassword){

    require '../required/database-connector.php'; # Shortcut to connect to database

    $getAccountQuery = "SELECT id, username, password FROM account"; # Query to fetch all accounts

    $accountsQueryResult = mysqli_query($connection, $getAccountQuery); # Data from query.

    if (mysqli_num_rows($accountsQueryResult) > 0) { # There is at least 1 account in the database

        while($row = mysqli_fetch_assoc($accountsQueryResult)) {

            # Iterate through the accounts until the account is found

            if ($row["username"] == $accountUsername){
                

                if ($row["password"] == $accountPassword){

                    # Username and Password Valid
                    
                    return "Valid-".(string)$row["id"]; # Return ID data too as it might be needed from the caller

                } else {

                    # An account was found but password did not match

                    return "InvalidPassword-null"; # returning that the password was invalid

                }
            }
        }

        return "InvalidUsername-null"; # returning that the username was not found

    } else {

        return "NoAccounts-null"; # Returning that there are no accounts

    }
}

# Function to create a new user in the database
function createNewUser($usernameSignup, $passwordSignup){

    require '../required/database-connector.php'; # Shortcut to connect to database

    # Query to create account
    $accountCreationSQL = "INSERT INTO account (username, password) VALUES ('" . $usernameSignup . "', '" . $passwordSignup . "')";

    # Create account with the query
    $connection->query($accountCreationSQL);

}

# Function to add a task linked to a user

function addTaskToUser($accountUsername, $accountPassword, $taskName, $taskDate){

    # Fetch account status with explode for seperation of status and UserID
    
    $accountData = explode("-",checkDatabaseAccount($accountUsername, $accountPassword));

    if ($accountData[0] == "Valid"){ # Account username and password were valid, authenticated

        $userID = $accountData[1];

        require '../required/database-connector.php'; # Shortcut to connect to database

        # Query to insert task - build query according to whether or not task deadline was specified
        
        if ($taskDate == ""){

            # Task Date Not Specified

            $taskInsertSQL = "INSERT INTO task (userID, task) VALUES ('" . $userID . "', '" . $taskName . "')";

        } else {

            # Task Date Specified

            $taskInsertSQL = "INSERT INTO task (userID, task, deadline) VALUES ('" . $userID . "', '" . $taskName . "', '" . $taskDate . "')";

        }
        
        # Create task with the query
        $connection->query($taskInsertSQL);

    } else {

        return "Fail"; # Return information that the execution was a failure (for any reason) for proper handling from the caller if needed
        
    }

}

# Given a username and password, authenticates the user, and returns all tasks relating to that userID.

function fetchTasks($accountUsername, $accountPassword) {

    # Fetch account status with explode for seperation of status and UserID
    
    $accountData = explode("-",checkDatabaseAccount($accountUsername, $accountPassword));

    if ($accountData[0] == "Valid"){ # Account username and password were valid, authenticated

        $userID = $accountData[1];

        require '../required/database-connector.php'; # Shortcut to connect to database

        $userTaskListQuery = "SELECT taskID, userID, task, deadline, pending FROM task WHERE userID=".$userID;

        $userTaskListResult = mysqli_query($connection, $userTaskListQuery); # Data from query.

        $returnList = [];

        # Iterate through the list, append all fetched data into the array, and then return the array for the caller to handle

        while($row = mysqli_fetch_assoc($userTaskListResult)) {

            array_push($returnList, ["taskID" => $row["taskID"], "taskName" => $row["task"], "taskDeadline" => $row["deadline"], "pending" => $row["pending"]]);
            

        }

        return $returnList;

    }

    return "Fail"; # Return information that the execution was a failure (for any reason) for proper handling from the caller if needed
}

function fetchTasksAndFilter($accountUsername, $accountPassword, $statusFilter, $nameFilter, $dateStartFilter, $dateEndFilter) {

    # Fetch account status with explode for seperation of status and UserID
    
    $accountData = explode("-",checkDatabaseAccount($accountUsername, $accountPassword));

    if ($accountData[0] == "Valid"){ # Account username and password were valid, authenticated

        $userID = $accountData[1];

        require '../required/database-connector.php'; # Shortcut to connect to database

        // Filters will be constructed to this query according to what was provided
        $taskListQueryFiltered = "SELECT taskID, userID, task, deadline, pending FROM task WHERE userID=".$userID;

        if ($statusFilter == "Pending Only"){

            $taskListQueryFiltered = $taskListQueryFiltered . " AND pending=TRUE"; // Append Filter To Only Catch Pending

        } else if ($statusFilter == "Completed Only"){

            $taskListQueryFiltered = $taskListQueryFiltered . " AND pending=FALSE"; // Append Filter To Only Catch Completed

        } // else it is set to 'Any Status' which has no additional filter requirements

        if ($nameFilter != ""){

            // A name filter needs to be applied too.

            $taskListQueryFiltered = $taskListQueryFiltered . " AND LOWER(task) LIKE '%" . $nameFilter . "%'";

        }

        if ($dateStartFilter != "" and $dateEndFilter != ""){

            if (dateValid($dateStartFilter) and dateValid($dateEndFilter)){

                if ($dateStartFilter < $dateEndFilter){

                    // Get all tasks within range

                    $taskListQueryFiltered = $taskListQueryFiltered . " AND deadline>='" . $dateStartFilter . "' AND deadline<='" . $dateEndFilter . "'";

                } else if ($dateStartFilter > $dateEndFilter){

                    // The End Date is before the start date which doesn't make sense -> pass the error to be handled by the caller

                    return "InvalidDateRange";
                    
                } else if ($dateStartFilter == $dateEndFilter){

                    // Get all tasks on that specific date

                    $taskListQueryFiltered = $taskListQueryFiltered . " AND deadline='" . $dateStartFilter . "'";

                }

            } else {

                return "InvalidDates"; // The dates were injected by the user and are in an invalid format - pass on an error

            }

        } else if ($dateStartFilter != ""){

            if (dateValid(date($dateStartFilter))){

                // Get all tasks following the provided Start Date

                $taskListQueryFiltered = $taskListQueryFiltered . " AND deadline>='" . $dateStartFilter . "'";

            } else {
                
                return "InvalidDates"; // The dates were injected by the user and are in an invalid format - pass on an error

            }

        } else if ($dateEndFilter != ""){

            if (dateValid(date($dateEndFilter))){

                // Get all tasks prior to the provided End Date

                // Eliminate those with date set to 0000-00-00 since that means no deadline

                $taskListQueryFiltered = $taskListQueryFiltered . " AND deadline>'0000-00-00' AND deadline<='" . $dateEndFilter . "'";

            } else {
                
                return "InvalidDates"; // The dates were injected by the user and are in an invalid format - pass on an error

            }

        }

        $userTaskListResult = mysqli_query($connection, $taskListQueryFiltered); # Data from query.

        $returnList = [];

        # Iterate through the list, append all fetched data into the array, and then return the array for the caller to handle

        while($row = mysqli_fetch_assoc($userTaskListResult)) {

            array_push($returnList, ["taskID" => $row["taskID"], "taskName" => $row["task"], "taskDeadline" => $row["deadline"], "pending" => $row["pending"]]);

        }

        return $returnList;

    }

    return "Fail"; # Return information that the execution was a failure (for any reason) for proper handling from the caller if needed
}

# Function to delete a task linked to a user by taskID

function deleteTask($accountUsername, $accountPassword, $taskIndex){

    $result = fetchTasks($accountUsername, $accountPassword);

    if (gettype($result) == "array") { # The returned data is a list of tasks (even if empty), so user was authenticated

        $foundMatch = false;

        foreach ($result as $task){
            if ($task["taskID"] == $taskIndex) {

                $foundMatch = true; // The taskID in the function is of the authenticed user

            }
        }

        if ($foundMatch){
            
            require '../required/database-connector.php'; # Shortcut to connect to database

            # Query to delete task
            $deleteTaskQuery = "DELETE FROM task WHERE taskID='" . $taskIndex . "';";

            # Delete task
            $connection->query($deleteTaskQuery);

            return "Success"; // The task was successfully deleted

        } else {

            return "Mismatch"; // the TaskID does not correspond to the user

        }
        
    } else {

        return "AuthFailure"; // Could not authenticate user

    }
    
}

# Function to modify a task linked to a user by taskID's status

function modifyTaskStatus($accountUsername, $accountPassword, $taskIndex){
    
    $result = fetchTasks($accountUsername, $accountPassword);

    if (gettype($result) == "array") { # The returned data is a list of tasks (even if empty), so user was authenticated

        $foundMatch = false;

        foreach ($result as $task){
            if ($task["taskID"] == $taskIndex) {

                $foundMatch = true; // The taskID in the function is of the authenticed user

            }
        }

        if ($foundMatch){

            require '../required/database-connector.php'; # Shortcut to connect to database

            # Query to fetch task's current status

            $fetchStatusQuery = "SELECT pending FROM task WHERE taskID='" . $taskIndex . "';";

            $statusResult = mysqli_fetch_assoc(mysqli_query($connection, $fetchStatusQuery))["pending"]; # Data from query.

            if ($statusResult == 1) {

                // Currently 'Pending' -> Change To 'Completed'

                $updateQuery = "UPDATE task SET pending = FALSE WHERE taskID='" . $taskIndex . "';"; // Set Pending To False

                # Take action on the query
                $connection->query($updateQuery);

                return "Completed"; // Return the value for the caller to know what it was changed to

            } else {

                // Currently 'Completed' -> Change To 'Pending'

                $updateQuery = "UPDATE task SET pending = TRUE WHERE taskID='" . $taskIndex . "';"; // Set Pending To True

                # Take action on the query
                $connection->query($updateQuery);

                return "Pending"; // Return the value for the caller to know what it was changed to

            }

        } else {

            return "Mismatch"; // the TaskID does not correspond to the user
        
        }
    } else {

        return "AuthFailure"; // The user was not authenticated

    }
}

# Function to modify a task linked to a user by taskID's name
function modifyTaskDescription($accountUsername, $accountPassword, $taskIndex, $description){

    # Query to fetch task's current status
    
    $result = fetchTasks($accountUsername, $accountPassword);

    if (gettype($result) == "array") { # The returned data is a list of tasks (even if empty), so user was authenticated

        $foundMatch = false;

        foreach ($result as $task){
            if ($task["taskID"] == $taskIndex) {

                $foundMatch = true; // The taskID in the function is of the authenticed user

            }
        }

        if ($foundMatch){

            if ($description != ""){ // New task name was not left blank

                require '../required/database-connector.php'; # Shortcut to connect to database

                # Query to update the task name per the description

                $updateQuery = "UPDATE task SET task = '" . $description . "' WHERE taskID='" . $taskIndex . "';";

                # Take action on the query
                $connection->query($updateQuery);

                return "Success"; // The task name was successfully updated

            } else {

                return "Blank"; // The task name was left blank

            }     

        } else {

            return "Mismatch"; // the TaskID does not correspond to the user

        }

    } else {

        return "AuthFailure"; // The user was not authenticated

    }

}

// Validates dates and returns the result. used in some database functions.
function dateValid($date){

    $splitDate = explode("-",$date);

    $splitCount = count($splitDate);

    if ($splitCount == 3) { // The date format is correct, split into 3 pieces of format X-X-X

        if (strlen($splitDate[0]) == 4 && strlen($splitDate[1]) == 2 && strlen($splitDate[2]) == 2){

            // The lengths of the format is current, being YYYY-MM-DD

            if (ctype_digit($splitDate[0]) && ctype_digit($splitDate[1]) && ctype_digit($splitDate[2])){

                return true; // Each character is also a valid integer. This is a correct date!

            } else {

                return false; // Wrong Format

            }

        } else {

            return false; // Wrong Format

        }

    } else {

        return false; // Wrong Format

    }

}

# Function to modify a task linked to a user by taskID's date

function modifyTaskDate($accountUsername, $accountPassword, $taskIndex, $date){

    $result = fetchTasks($accountUsername, $accountPassword);

    if (gettype($result) == "array") { # The returned data is a list of tasks (even if empty), so user was authenticated

        $foundMatch = false;

        foreach ($result as $task){
            if ($task["taskID"] == $taskIndex) {

                $foundMatch = true; // The taskID in the function is of the authenticed user

            }
        }

        if ($foundMatch){ // Task to be modified is of the authenticated user

            if(dateValid($date)){ // Check if the date passed is valid

                require '../required/database-connector.php'; # Shortcut to connect to database

                # Query to update the task deadline

                $updateQuery = "UPDATE task SET deadline = '" . $date . "' WHERE taskID='" . $taskIndex . "';";

                # Take action on the query

                $connection->query($updateQuery);

                return "ValidDate";

            } else {

                return "InvalidDate";

            }
        } else {

            return "Mismatch"; // the TaskID does not correspond to the user

        }

    } else {

        return "AuthFailure";

    }
}

?>