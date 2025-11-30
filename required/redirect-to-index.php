<?php

if (empty($_SESSION['token'])) { // CSRF Token Check

    $_SESSION['token'] = bin2hex(random_bytes(32)); // No Token was found, assign one
    
}

header('Location: ../'); # Redirect to index.php for handling
die(); # Redirected - kill the php script
?>