<?php

    session_start(); # Starting the session

    require '../required/twig-loader.php'; # Shortcut to load composer, twig & its templates

    require '../required/database-connector.php'; # Shortcut to connect to database

    $getAccountQuery = "SELECT id, username, password FROM account"; # Query to fetch all accounts

    $accountsQueryResult = mysqli_query($connection, $getAccountQuery); # Data from query. This will be used below.

    if (isset($_POST["fusername_login"]) and isset($_POST["fpassword_login"])){

        # Username and password provided for login. Check whether or not the credentials exist from the query result that was processed.
        
        if (mysqli_num_rows($accountsQueryResult) > 0) { # There is at least 1 account in the database
            
            $accountFound = false; # Breaks the while loop if an account is found

            while($row = mysqli_fetch_assoc($accountsQueryResult) and !$accountFound) {

                # Iterate through the accounts until the account is found

                if ($row["username"] == $_POST["fusername_login"]){

                    if ($row["password"] == $_POST["fpassword_login"]){

                        # Outcome 1 - Username and Password Valid - Login!


                        # Save the data to sessions so that the user will stay logged in
                        $_SESSION["username"] = $_POST["fusername_login"];
                        $_SESSION["password"] = $_POST["fpassword_login"];

                        # Perform Render of task-list as logged in user

                            echo $twig->render("task-list-template.php", array(

                                "websiteName" => $websiteName,
                                "username" => $row["username"]
                            
                            ));

                            die(); # Logged in - kill the PHP script
                    }

                    $accountFound = true;

                }
            }

            if (!$accountFound) {

                # Outcome 2 - Username Not Found!

                $_SESSION["errorMessage"] = "Username_Error";

                header('Location: ../'); # Redirect to index.php for rendering
                
                die();

                
            } else {
                
                # Outcome 3 - Password Not Found!

                $_SESSION["errorMessage"] = "Password_Error";

                header('Location: ../'); # Redirect to index.php for rendering
                
                die();

            }
        } else {
            echo "Error: No accounts in database"; # Serve this error directly
        }

    } else if (isset($_POST["fusername_signup"]) and isset($_POST["fpassword_signup"])) {

        # Username and password provided for signup. Check whether or not there is already an account with that username.
        
        if (mysqli_num_rows($accountsQueryResult) > 0) { # There is at least 1 account in the database
            
            $accountFound = false; # Breaks the while loop if an account is found

            while($row = mysqli_fetch_assoc($accountsQueryResult) and !$accountFound) {

                # Iterate through the accounts until the account is found (if it exists)

                if ($row["username"] == $_POST["fusername_signup"]){
                    $accountFound = true;
                }
            }

            if (!$accountFound) { # The username is unique, so it can be created

                # Outcome 1 - Username Unique! Create account

                # Save the data to sessions so that the user will stay logged in with this new account
                $_SESSION["username"] = $_POST["fusername_signup"];
                $_SESSION["password"] = $_POST["fpassword_signup"];

                # Query to create account
                $accountCreationSQL = "INSERT INTO account (username, password) VALUES ('" . $_POST["fusername_signup"] . "', '" . $_POST["fpassword_signup"] . "')";

                # Create account with the query
                $connection->query($accountCreationSQL);

                # Perform Render of task-list as logged in user

                    echo $twig->render("task-list-template.php", array(

                        "websiteName" => $websiteName,
                        "username" => $_POST["fusername_signup"]
                    
                    ));

                    die(); # Logged in - kill the PHP script

            } else {

                # Outcome 2 - Username already exists!

                $_SESSION["errorMessage"] = "UsernameCreation_Error";

                header('Location: ../'); # Redirect to index.php for rendering
                
                die(); # Redirected - kill the PHP script

            }

        }  else {
            echo "Error: No accounts in database"; # Serve this error directly
        }
        
    } else {

        # Check if login session is stored, otherwise serve the signup-login-template.php
        print("session check and serve 'please login' or logged in task list recursively");

    }
    
?>
