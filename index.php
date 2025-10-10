<?php

require 'vendor/autoload.php'; # Load in required composer packages, including twig

# Load in Twig templates, located in the 'views' folder
$loader = new \Twig\Loader\FilesystemLoader('views');
$twig = new \Twig\Environment($loader);

$loggedIn = true; # Placeholder variable until a login system with detection is implemented.

#Twiggy template variables that never change
$websiteName = "TrackyTask";

if ($loggedIn){ # User is logged in. Render their task list

    echo $twig->render("Task-List.html", array(

        "websiteName" => $websiteName,
        "username" => "Nicholai"
        
    ));
   
} else { # User is not logged in. Render in the signup/login page

     echo $twig->render("Signup-Login.html", array(

        "websiteName" => $websiteName,
        "greetingMessage" => "Please Signup Or Login"
        
    ));
}

?>