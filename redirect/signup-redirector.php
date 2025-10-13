<?php

session_start(); # Starting the session
$_SESSION["signupRequested"] = true; # Set signup request to true, wich will be checked if is_set in index.php

require '../required/redirect-to-index.php'; # Redirect to index.php for rendering

?>