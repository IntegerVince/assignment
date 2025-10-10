<?php

require 'vendor/autoload.php'; # Load in required composer packages, including twig

# Load in Twig templates, located in the 'views' folder
$loader = new \Twig\Loader\FilesystemLoader('views');
$twig = new \Twig\Environment($loader);


# Render in the signup/login page
echo $twig->render("Signup-Login.html", array(

    "WebsiteName" => "TrackyTask - Your To Do List Tracker!",
    "GreetingMessage" => "Welcome"
    
))

?>