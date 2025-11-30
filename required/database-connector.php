<?php
$server = "localhost";
$username = "root";
$password = "";  # By default, XAMPP password is empty
$database = "trackytaskdb";

# Variable for connection
$connection = new mysqli($server, $username, $password, $database);

#  Check if connection is good, if not, terminate the PHP script and give the error
if (mysqli_connect_error()) {
    die($connection->connect_error);
}

# Good connection

if (empty($_SESSION['token'])) { // CSRF Token Check

    $_SESSION['token'] = bin2hex(random_bytes(32)); // No Token was found, assign one
    
}

?>