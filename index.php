<?php

require 'vendor/autoload.php';

$loader = new \Twig\Loader\FilesystemLoader('views');
$twig = new \Twig\Environment($loader);

echo $twig->render("hello.html", array(
    "Name"=> "Nicholai",
    "ID"=> "85904L"
))

?>