<?php

require 'required/twig-loader.php'; # Shortcut to load composer, twig & its templates

$loggedIn = false; # Placeholder variable until a login system with detection is implemented.

if ($loggedIn){ # User is logged in. Render their task list with login session details

    echo $twig->render("task-list-template.php", array(

        "websiteName" => $websiteName,
        "username" => "Nicholai" # Placeholder. data will be fetched from session in this case.
        
    ));
   
} else { # User is not logged in. Render in the signup/login page

     echo $twig->render("signup-login-template.php", array(

        "websiteName" => $websiteName,
        "greetingMessage" => "Please Signup Or Login"
        
    ));
}

?>