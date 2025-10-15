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


function addTaskToUser($accountUsername, $accountPassword, $taskName, $taskDate){


    # Fetch account status with explode for seperation of status and UserID
    
    $accountData = explode("-",checkDatabaseAccount($accountUsername, $accountPassword));

    if ($accountData[0] == "Valid"){ # Account username and password were valid, authenticated

        $userID = $accountData[1];

        return $userID;

    } else {

        return "Fail"; # Return information that the execution was a failure (for any reason) for proper handling from the caller
        
    }

}

?>