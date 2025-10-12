<?php

session_start(); # Starting the session

require 'required/twig-loader.php'; # Shortcut to load composer, twig & its templates

if (isset($_SESSION['errorMessage'])) { # Index.php was redirected with an error from another place

    if ($_SESSION['errorMessage'] == 'Username_Error'){ # Wrong username error

        $_SESSION['errorMessage'] = ""; # Reset error message

        # Redirect to login page with error message

        echo $twig->render("signup-login-template.php", array(

            "websiteName" => $websiteName,
            "templateType" => "Login",
            "errorMessage" => "That username does not exist, please check and try again."
        
        ));

        die(); # Kill the current PHP script since it was served

    } else if ($_SESSION["errorMessage"] == "Password_Error"){

        $_SESSION['errorMessage'] = ""; # Reset error message

        # Redirect to login page with error message

        echo $twig->render("signup-login-template.php", array(

            "websiteName" => $websiteName,
            "templateType" => "Login",
            "errorMessage" => "The password is incorrect, please try again."
        
        ));

        die(); # Kill the current PHP script since it was served

    } else if ($_SESSION["errorMessage"] == "UsernameCreation_Error"){

        $_SESSION['errorMessage'] = ""; # Reset error message

        # Redirect to signup page with error message

        echo $twig->render("signup-login-template.php", array(

            "websiteName" => $websiteName,
            "templateType" => "Signup",
            "errorMessage" => "There is already an account with that username, please try something else."
        
        ));

        die(); # Kill the current PHP script since it was served

    }

}

if (isset($_SESSION["username"]) and isset($_SESSION["password"])){ # Check if login details are saved in a session to automatically login
            
    if ($_SESSION["username"] != "" and $_SESSION["password"] != ""){ # Check if they are set with actual values, and not just reset

        # We have account data stored

        header('Location: pages/task-list.php'); # Redirect to task-list.php so it can be proccessed

        die(); # Kill the current PHP script since it was served
    }
}
   
# User is not logged in. Render in the signup/login page

    if (isset($_SESSION["signupRequested"])) { # Checking if session is set which could mean a signup redirect was called

        if ($_SESSION["signupRequested"]) { # A signup redirect was indeed called, signupRequested is true. Serving signup page.

            echo $twig->render("signup-login-template.php", array(

                "websiteName" => $websiteName,
                "templateType" => "Signup"
        
            ));

            $_SESSION["signupRequested"] = false; # Reset it for future redirections.

        } else { # Session exists but signup redirect was not called, serving login

            echo $twig->render("signup-login-template.php", array(

                "websiteName" => $websiteName,
                "templateType" => "Login"
        
            ));
        }

    } else { # Session was never set because the user never used the redirect feature, serving login as default

        echo $twig->render("signup-login-template.php", array(

            "websiteName" => $websiteName,
            "templateType" => "Login"
        
        ));

    }

?>