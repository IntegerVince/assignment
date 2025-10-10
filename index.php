<?php

require 'vendor/autoload.php';

$loader = new \Twig\Loader\FilesystemLoader('views');
$twig = new \Twig\Environment($loader);

echo $twig->render("Signup-Login.html", array(

    "WebsiteName" => "TrackyTask - Your To Do List Tracker!",
    "GreetingMessage" => "Welcome"
    
))

?>