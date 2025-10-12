<?php

    require '../required/twig-loader.php'; # Shortcut to load composer, twig & its templates

    if (isset($_POST["fusername"]) and isset($_POST["fpassword"])){

        # Username and password provided. Connect to database to check whether or not the credentials exist.
        
        $server = "localhost";
        $username = "root";
        $password = "";  # By default, XAMPP password is empty
        $database = "trackytaskdb";

        # Variable for connection
        $connection = new mysqli($server, $username, $password, $database);

        #  Check if connection is good, if not, terminate the PHP script and give the error
        if (mysqli_connect_error()) {
            die($connection->connect_error);
        }

        # Good connection
        
        $getAccountQuery = "SELECT id, username, password FROM account"; # Query to fetch all accounts

        $queryResult = mysqli_query($connection, $getAccountQuery); # Data from query

        if (mysqli_num_rows($queryResult) > 0) { # There is at least 1 account in the databse
            
            $accountFound = false; # Breaks the while loop if an account is found

            while($row = mysqli_fetch_assoc($queryResult) and !$accountFound) {

                # Iterate through the accounts until the account is found

                if ($row["username"] == $_POST["fusername"]){

                    if ($row["password"] == $_POST["fpassword"]){

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
                echo "Username not found";
                # Serve username does not exist login template
                
            } else {
                echo "Wrong password";
                # Serve wrong password login template
            }
        } else {
            echo "Error: No accounts in database";
        }

    } else {
        
        # Check if login session is stored, otherwise serve the signup-login-template.php
            print("session check and serve 'please login' or logged in task list recursively");
    }
    
?>
