<?php

require 'vendor/autoload.php'; # Load in required composer packages, including twig

# Load in Twig templates, located in the 'views' folder
$loader = new \Twig\Loader\FilesystemLoader('pages');
$twig = new \Twig\Environment($loader);

?>