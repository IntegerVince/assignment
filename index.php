<?php

session_start(); # Starting the session

require 'required/twig-loader.php'; # Shortcut to load composer, twig & its templates

$loggedIn = false; # Placeholder variable until a login system with detection is implemented.

if (isset($_SESSION['errorMessage'])) { # Index.php was redirecte with an error from another place

    if ($_SESSION['errorMessage'] == 'Username_Error'){ # Wrong username error

        $_SESSION['errorMessage'] = ""; # Reset error message

        # Redirect to login page with error message

        echo $twig->render("signup-login-template.php", array(

            "websiteName" => $websiteName,
            "templateType" => "Login",
            "errorMessage" => "That username does not exist, please try again."
        
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

    }

}

if ($loggedIn){ # User is logged in. Render their task list with login session details

    echo $twig->render("task-list-template.php", array(

        "websiteName" => $websiteName,
        "username" => "Nicholai" # Placeholder. data will be fetched from session in this case.
        
    ));
   
} else { # User is not logged in. Render in the signup/login page

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
}

?>