<?php

if (empty($_SESSION['token'])) { // CSRF Token Check

    $_SESSION['token'] = bin2hex(random_bytes(32)); // No Token was found, assign one
    
}

$pathAppend = ''; # Will append an empty string which keeps the path the same. Will append one directory back if not called from index.php

if (!is_dir('vendor')){ # Not being called from index.php
    $pathAppend = '../';
}

require  $pathAppend . 'vendor/autoload.php'; # Load in required composer packages, including twig

# Load in Twig templates, located in the 'views' folder
$loader = new \Twig\Loader\FilesystemLoader( $pathAppend . 'templates');
$twig = new \Twig\Environment($loader);

#Twiggy template variables that never change

$websiteName = "TrackyTask";

?>