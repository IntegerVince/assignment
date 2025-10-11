<?php

require 'vendor/autoload.php'; # Load in required composer packages, including twig

# Load in Twig templates, located in the 'views' folder
$loader = new \Twig\Loader\FilesystemLoader('pages');
$twig = new \Twig\Environment($loader);

$loggedIn = false; # Placeholder variable until a login system with detection is implemented.

#Twiggy template variables that never change
$websiteName = "TrackyTask";

if ($loggedIn){ # User is logged in. Render their task list

    echo $twig->render("task-list.php", array(

        "websiteName" => $websiteName,
        "username" => "Nicholai" # Placeholder. data will be fetched.
        
    ));
   
} else { # User is not logged in. Render in the signup/login page

     echo $twig->render("signup-login.php", array(

        "websiteName" => $websiteName,
        "greetingMessage" => "Please Signup Or Login"
        
    ));
}

?>