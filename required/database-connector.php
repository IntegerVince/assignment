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

?>