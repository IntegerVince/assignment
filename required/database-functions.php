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

    // No SQL Injection Can Take Place Since User Input Is Not Involved
    $getAccountQuery = "SELECT id, username, password FROM account"; # Query to fetch all accounts

    $accountsQueryResult = mysqli_query($connection, $getAccountQuery); # Data from query.

    if (mysqli_num_rows($accountsQueryResult) > 0) { # There is at least 1 account in the database

        while($row = mysqli_fetch_assoc($accountsQueryResult)) {

            # Iterate through the accounts until the account is found

            if ($row["username"] == $accountUsername){
                
                if (password_verify($accountPassword, $row["password"])){

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
    
    $statement = $connection->prepare("INSERT INTO account (username, password) VALUES (?, ?)");

    $statement->bind_param("ss", $userSignup, $passSignup); // Specify the statement parameters

    // Specify the parameter values for the prepared statement
    $userSignup = $usernameSignup;
    $passSignup = $passwordSignup;

    $statement->execute(); // Execute the prepared statement

    $statement->close(); // Close the statement

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

            $taskInsertStatement = $connection->prepare("INSERT INTO task (userID, task) VALUES (?, ?)");

            $taskInsertStatement->bind_param("is", $userIDstatement, $taskNameStatement); // Specify the statement parameters

            // Specify the parameter values for the prepared statement
            $userIDstatement = $userID;
            $taskNameStatement = $taskName;

        } else {

            # Task Date Specified

            $taskInsertStatement = $connection->prepare("INSERT INTO task (userID, task, deadline) VALUES (?, ?, ?)");

            $taskInsertStatement->bind_param("iss", $userIDstatement, $taskNameStatement, $deadlineStatement); // Specify the statement parameters

            // Specify the parameter values for the prepared statement
            $userIDstatement = $userID;
            $taskNameStatement = $taskName;
            $deadlineStatement = $taskDate;

        }

        $taskInsertStatement->execute(); // Execute the prepared statement

        $taskInsertStatement->close(); // Close the statement
        
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

        $userTaskListStatement = $connection->prepare("SELECT taskID, userID, task, deadline, pending FROM task WHERE userID = ?");

        $userTaskListStatement->bind_param("i", $userIDstatement); // Specify the statement parameters

        // Specify the parameter values for the prepared statement
        $userIDstatement = $userID;

        $userTaskListStatement->execute(); // Execute the prepared statement

        $userTaskListResult = $userTaskListStatement->get_result(); // Fetch result of the prepared statement

        $returnList = [];

        # Iterate through the list, append all fetched data into the array, and then return the array for the caller to handle

        while($row = $userTaskListResult->fetch_assoc()) {

            array_push($returnList, ["taskID" => $row["taskID"], "taskName" => $row["task"], "taskDeadline" => $row["deadline"], "pending" => $row["pending"]]);
            
        }

        $userTaskListStatement->close(); // Close the statement

        return $returnList;

    }

    return "Fail"; # Return information that the execution was a failure (for any reason) for proper handling from the caller if needed
}

// Function to return tasks list with the passed filters
function fetchTasksAndFilter($accountUsername, $accountPassword, $statusFilter, $nameFilter, $dateStartFilter, $dateEndFilter) {

    # Fetch account status with explode for seperation of status and UserID
    
    $accountData = explode("-",checkDatabaseAccount($accountUsername, $accountPassword));

    if ($accountData[0] == "Valid"){ # Account username and password were valid, authenticated

        $userID = $accountData[1];

        require '../required/database-connector.php'; # Shortcut to connect to database

        // Filters will be constructed to this query according to what was provided
        $taskListQueryFiltered = "SELECT taskID, userID, task, deadline, pending FROM task WHERE userID=?";

        $parameterTypes = "i"; // parameter types will be added here on prepared statement construction and injected into the bind_param
        // Expecting userID (integer)

        if ($statusFilter == "Pending Only"){

            $taskListQueryFiltered = $taskListQueryFiltered . " AND pending=TRUE"; // Append Filter To Only Catch Pending

        } else if ($statusFilter == "Completed Only"){

            $taskListQueryFiltered = $taskListQueryFiltered . " AND pending=FALSE"; // Append Filter To Only Catch Completed

        } // else it is set to 'Any Status' which has no additional filter requirements

        if ($nameFilter != ""){

            $lowerNameFilter = strtolower($nameFilter);

            // A name filter needs to be applied too.

            $taskListQueryFiltered = $taskListQueryFiltered . " AND LOWER(task) LIKE ?";

            $parameterTypes = $parameterTypes . "s";
            // Expecting nameFilter (string)

        }

        if ($dateStartFilter != "" and $dateEndFilter != ""){

            if (dateValid($dateStartFilter) and dateValid($dateEndFilter)){

                if ($dateStartFilter < $dateEndFilter){

                    // Get all tasks within range

                    $taskListQueryFiltered = $taskListQueryFiltered . " AND deadline>=? AND deadline<=?";

                    $parameterTypes = $parameterTypes . "ss";
                    // Expecting two dates (strings)

                } else if ($dateStartFilter > $dateEndFilter){

                    // The End Date is before the start date which doesn't make sense -> pass the error to be handled by the caller

                    return "InvalidDateRange";
                    
                } else if ($dateStartFilter == $dateEndFilter){

                    // Get all tasks on that specific date

                    $taskListQueryFiltered = $taskListQueryFiltered . " AND deadline=?";

                    $parameterTypes = $parameterTypes . "s";
                    // Expecting a date (string)

                }

            } else {

                return "InvalidDates"; // The dates were injected by the user and are in an invalid format - pass on an error

            }

        } else if ($dateStartFilter != ""){

            if (dateValid($dateStartFilter)){

                // Get all tasks following the provided Start Date

                $taskListQueryFiltered = $taskListQueryFiltered . " AND deadline>=?";

                $parameterTypes = $parameterTypes . "s";
                // Expecting a date (string)

            } else {
                
                return "InvalidDates"; // The dates were injected by the user and are in an invalid format - pass on an error

            }

        } else if ($dateEndFilter != ""){

            if (dateValid($dateEndFilter)){

                // Get all tasks prior to the provided End Date

                // Eliminate those with date set to 0000-00-00 since that means no deadline

                $taskListQueryFiltered = $taskListQueryFiltered . " AND deadline>'0000-00-00' AND deadline<=?";

                $parameterTypes = $parameterTypes . "s";
                // Expecting a date (string)

            } else {
                
                return "InvalidDates"; // The dates were injected by the user and are in an invalid format - pass on an error

            }

        }

        // The prepared statement from the constructed query
        $taskListFilteredStatement = $connection->prepare($taskListQueryFiltered);

        // Binding parameters depending on the number of filters chosen
        if (strlen($parameterTypes) == 1){
            
            $taskListFilteredStatement->bind_param($parameterTypes, $A); // Specify the statement parameters

            $A = $userID; // First is always userID irrespective of filter

        } else if (strlen($parameterTypes) == 2){

            $taskListFilteredStatement->bind_param($parameterTypes, $A, $B); // Specify the statement parameters

            $A = $userID; // First is always userID irrespective of filter

            if ($nameFilter != ""){

                // Wildcard is appended in the name, not in the prepared statement

                $B = "%" . $nameFilter . "%"; // nameFilter is defined - this is what the second parameter is

            } else {

                // not nameFilter - check which one of the dates is specified

                if ($dateStartFilter != ""){

                    $B = $dateStartFilter; // dateStartFilter is defined - this is what the second parameter is

                } else {

                    $B = $dateEndFilter; // dateEndFilter (last remaining filter type) is defined - this is what the second parameter is

                }

            }

        } else if (strlen($parameterTypes) == 3){

            $taskListFilteredStatement->bind_param($parameterTypes, $A, $B, $C); // Specify the statement parameters

            $A = $userID; // First is always userID irrespective of filter

            if ($nameFilter != ""){

                $B = "%" . $nameFilter . "%"; // nameFilter is defined - this is what the second parameter is

                if ($dateStartFilter != ""){

                    $C = $dateStartFilter; // dateStartFilter is defined - this is what the third parameter is

                } else {

                    $C = $dateEndFilter; // dateEndFilter (last remaining filter type) is defined - this is what the third parameter is

                }

            } else {

                // Name parameter not valid - the other two are the dates

                $B = $dateStartFilter; // dateStartFilter is defined - this is what the second parameter is
                $C = $dateEndFilter; // dateEndFilter is defined - this is what the third parameter is

            }

        } else if (strlen($parameterTypes) == 4){

            $taskListFilteredStatement->bind_param($parameterTypes, $A, $B, $C, $D); // Specify the statement parameters

            $A = $userID; // First is always userID irrespective of filter

            // All filter options were defined so we know what each parameter is already
            $B = "%" . $nameFilter . "%";
            $C = $dateStartFilter;
            $D = $dateEndFilter;

        }
        
        $taskListFilteredStatement->execute(); // Execute the prepared statement

        $userTaskListFilteredResult = $taskListFilteredStatement->get_result(); // Fetch result of the prepared statement

        $returnList = [];

        # Iterate through the list, append all fetched data into the array, and then return the array for the caller to handle

        while($row = $userTaskListFilteredResult->fetch_assoc()) {

            array_push($returnList, ["taskID" => $row["taskID"], "taskName" => $row["task"], "taskDeadline" => $row["deadline"], "pending" => $row["pending"]]);

        }

        return $returnList;

    }

    return "Fail"; # Return information that the execution was a failure (for any reason) for proper handling from the caller if needed
}

// function which, given a task and the current filter settings, returns whether or not it matches the current filter settings
function matchWithFilter($taskName, $taskDate, $taskStatus, $statusFilter, $nameFilter, $dateStartFilter, $dateEndFilter){

    if ($taskName != "N-A"){ // Task name needs to be checked as it is a new task or it was the modified value

        // Name Filter Checking
    
        if ($nameFilter != ""){

            // A name filter is active

            $lowerTaskName = strtolower($taskName);
            $lowerNameFilter = strtolower($nameFilter);

            if (str_contains($lowerTaskName, $lowerNameFilter) != true){ // Check for substring in string
                
                return false; // Name criteria is not met - return mismatch

            }

        }

    }

    if ($taskStatus != "N-A"){ // Task status needs to be checked as it was the modified value

        // Status Filter Checking

        if ($statusFilter == "Pending Only"){

            if ($taskStatus != "Pending"){

                return false; // Status criteria is not met - return mismatch

            }

        } else if ($statusFilter == "Completed Only"){

            if ($taskStatus != "Completed"){

                return false; // Status criteria is not met - return mismatch

            }

        } // else it is set to 'any status' so it cannot be a mismatch

    }
    
    if ($taskDate != "N-A"){ // Task date needs to be checked as it is a new task or it was the modified value

        // Date Filter Checking

        if ($dateStartFilter != "" and $dateEndFilter != ""){

            if (dateValid($dateStartFilter) and dateValid($dateEndFilter)) {

                if ($dateStartFilter < $dateEndFilter){

                    // Check if the date is within range

                    if ($taskDate < $dateStartFilter or $taskDate > $dateEndFilter){

                        return false; // Date is out of range - reject

                    }

                } else if ($dateStartFilter > $dateEndFilter){

                    // The End Date is before the start date which doesn't make sense -> reject

                    return false;
                    
                } else if ($dateStartFilter == $dateEndFilter){

                    // Check if the task falls under that specific date

                    if ($taskDate != $dateStartFilter){

                        return false; // Does not fall under that specific date - reject

                    }

                }

            } else {

                return false; // The date is invalid which means that the user injected another date format - reject

            }

        } else if ($dateStartFilter != ""){

            if (dateValid($dateStartFilter)){

                if ($taskDate < $dateStartFilter){
                    
                    return false; // Out of range

                }

            } else {

                return false; // The date is invalid which means that the user injected another date format - reject

            }
    
        } else if ($dateEndFilter != ""){

            if (dateValid($dateEndFilter)){

                if ($taskDate > $dateEndFilter){

                    return false; // Out of range

                }
                
            } else {

                return false; // The date is invalid which means that the user injected another date format - reject

            }

        }

        if ($taskDate == "" and ($dateStartFilter != "" or $dateEndFilter != "")){

            return false; // No date was specified so it shouldn't be shown here

        }

    }
    
    return true; // All possible scenarios leading to a filter mismatch were checked - returning true

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

            # Prepared statement to delete task
            $deleteTaskStatement = $connection->prepare("DELETE FROM task WHERE taskID = ?");

            $deleteTaskStatement->bind_param("i", $taskIndexParameter); // Specify the statement parameters

            // Specify the parameter values for the prepared statement
            $taskIndexParameter = $taskIndex;

            $deleteTaskStatement->execute(); // Execute the prepared statement

            $deleteTaskStatement->close(); // Close the statement

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

            # Statement to fetch task's current status

            $fetchStatusStatement = $connection->prepare("SELECT pending FROM task WHERE taskID = ?");

            $fetchStatusStatement->bind_param("i", $taskIndexParameter); // Specify the statement parameters

            // Specify the parameter values for the prepared statement
            $taskIndexParameter = $taskIndex;

            $fetchStatusStatement->execute(); // Execute the prepared statement

            $statusResult = $fetchStatusStatement->get_result(); # Data from statement;

            $statusResultRow = $statusResult->fetch_assoc()["pending"]; // Fetch the row of the returned data;

            $fetchStatusStatement->close(); // Close the statement

            if ($statusResultRow == 1) {

                // Currently 'Pending' -> Change To 'Completed'

                $updateStatement = $connection->prepare("UPDATE task SET pending = FALSE WHERE taskID = ?"); // Set Pending To False

                $updateStatement->bind_param("i", $taskIndexParameter2); // Specify the statement parameters

                // Specify the parameter values for the prepared statement
                $taskIndexParameter2 = $taskIndex;

                $updateStatement->execute(); // Execute the prepared statement

                $updateStatement->close(); // Close the statement

                return "Completed"; // Return the value for the caller to know what it was changed to

            } else {

                // Currently 'Completed' -> Change To 'Pending'

                $updateStatement = $connection->prepare("UPDATE task SET pending = TRUE WHERE taskID = ?"); // Set Pending To False

                $updateStatement->bind_param("i", $taskIndexParameter2); // Specify the statement parameters

                // Specify the parameter values for the prepared statement
                $taskIndexParameter2 = $taskIndex;

                $updateStatement->execute(); // Execute the prepared statement

                $updateStatement->close(); // Close the statement

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

                $updateStatement = $connection->prepare("UPDATE task SET task = ? WHERE taskID = ?");

                $updateStatement->bind_param("si", $taskDescriptionStatement, $taskIDstatement); // Specify the statement parameters

                // Specify the parameter values for the prepared statement
                $taskDescriptionStatement = $description;
                $taskIDstatement = $taskIndex;

                $updateStatement->execute(); // Execute the prepared statement

                $updateStatement->close(); // Close the statement

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

                $updateStatement = $connection->prepare("UPDATE task SET deadline = ? WHERE taskID = ?");

                $updateStatement->bind_param("si", $deadlineStatement, $taskIndexStatement); // Specify the statement parameters

                // Specify the parameter values for the prepared statement
                $deadlineStatement = $date;
                $taskIndexStatement = $taskIndex;

                $updateStatement->execute(); // Execute the prepared statement

                $updateStatement->close(); // Close the statement

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

// Checks if an input respects the allowedCharacters criteria -> Input filtering + Output Escaping two-in-one function
// (rejects special characters)
function isValidInput($input){

    $allowedCharacters = "abcdefghijklmnopqrstuvwxyz1234567890-"; // Stores allowed characters - reject other characters to prevent any XSS attacks
    $characterAllowed = false;

    for ($x = 0; $x != strlen($input); $x++){  // Iterate through input characters
        
        for ($y = 0; $y != strlen($allowedCharacters); $y++){ // Iterate through allowed characters

            if (strtolower($input[$x]) == $allowedCharacters[$y]){

                $characterAllowed = true; // Character is allowed

                break; // Escape the loop

            }

        }

        if ($characterAllowed){ // Character was allowed

            $characterAllowed = false; // Reset character for next check

        } else {

            return false; // Character was not allowed - reject the string for this reason
            
        }
    }

    return true; // No disallowed characters were spotted - accept the input

}

?>