<?php
# Setting where content is allowed from to include APIs like giphy & google fonts & google
header("Content-Security-Policy: default-src 'self'; script-src 'self' https://apis.google.com https://www.google.com/recaptcha/api.js https://www.gstatic.com/recaptcha/releases/TkacYOdEJbdB_JjX802TMer9/recaptcha__en.js; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https://*.giphy.com https://giphy.com https://i.giphy.com https://www.google.com/recaptcha/api.js; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://api.giphy.com https://giphy.com https://www.google.com/recaptcha/api2/clr; frame-src 'self' https://www.google.com https://accounts.google.com https://www.google.com/recaptcha/api.js; frame-ancestors 'self';");

session_start(); # Starting the session

if (empty($_SESSION['token'])) { // CSRF Token Check

    $_SESSION['token'] = bin2hex(random_bytes(32)); // No Token was found, assign one
    
}

require '../required/twig-loader.php'; # Shortcut to load composer, twig & its templates

require '../required/database-functions.php'; # Connection to database & database functions

# First step is to check if there are valid sessions stored - if so, template can be served directly

if (checkSessionStatus() == "Valid") {

    # We have valid account data stored in sessions - render in the logged in template

    echo $twig->render("task-list-template.twig", array(

        "websiteName" => $websiteName,
        "username" => $_SESSION["username"],
        "taskList" => fetchTasks($_SESSION["username"],$_SESSION["password"]),
        "csrfToken" => $_SESSION['token'] // Pass on the generated session csrf token
        
    ));

    die(); # Kill The PHP Script since template was served

} else if (checkSessionStatus() == "Invalid") { // Invalid Sessions Are Stored - this link was accessed directly

    # Reset the invalid Sessions
    $_SESSION["username"] = "";
    $_SESSION["password"] = "";

}

# At this stage, it means no sessions were stored - checking if a login was called

if (isset($_POST["fusername_login"]) and isset($_POST["fpassword_login"])){

    // A login was indeed called

    # Explode is used to seperate status message from user ID
    # Index 0 = Status
    # Index 1 = UserID (If Valid)

    $receivedAccountStatus = explode("-", checkDatabaseAccount($_POST["fusername_login"], $_POST["fpassword_login"]));

    # Username and password provided for login.

    if ($receivedAccountStatus[0] == "Valid"){

        # Outcome 1 - Username and Password Valid - Login!

        # Save the data to sessions so that the user will stay logged in
        $_SESSION["username"] = $_POST["fusername_login"];
        $_SESSION["password"] = $_POST["fpassword_login"];

        # Perform Render of task-list as logged in user

        echo $twig->render("task-list-template.twig", array(

            "websiteName" => $websiteName,
            "username" => $_POST["fusername_login"],
            "taskList" => fetchTasks($_SESSION["username"],$_SESSION["password"]),
            "csrfToken" => $_SESSION['token'] // Pass on the generated session csrf token
        
        ));

        die(); # Logged in - kill the PHP script

    } # Other scenarios (Invalid password, etc.. are checked in the signup/login pages, not here)

# At this stage, it means session was not stored and login wasn't called, so proceeding with checking if signup was called

} else if (isset($_POST["fusername_signup"]) and isset($_POST["fpassword_signup"])) {

    // A signup was indeed called
    
    $receivedAccountStatus = explode("-", checkDatabaseAccount($_POST["fusername_signup"], $_POST["fpassword_signup"]));

    # Username and password provided for signup. Check whether or not there is already an account with that username.
    
    if ($receivedAccountStatus[0] == "InvalidUsername") {

        # Invalid username status means that the username does not exist, so we can proceed

        if (isValidInput($_POST["fusername_signup"])){ // Validate that the username does not have any invalid formatting prior to accepting it

            # Outcome 1 - Username Unique! Create account

            # Save the data to sessions so that the user will stay logged in with this new account
            $_SESSION["username"] = $_POST["fusername_signup"];
            $_SESSION["password"] = $_POST["fpassword_signup"];

            // Hash the password for the user
            $hashedPassword = password_hash($_POST["fpassword_signup"], PASSWORD_DEFAULT);

            // Create New User
            createNewUser($_POST["fusername_signup"], $hashedPassword);

            # Perform Render of task-list as logged in user

            echo $twig->render("task-list-template.twig", array(

                "websiteName" => $websiteName,
                "username" => $_POST["fusername_signup"],
                "taskList" => fetchTasks($_SESSION["username"],$_SESSION["password"]),
                "csrfToken" => $_SESSION['token'] // Pass on the generated session csrf token
            
            ));

            die(); # Logged in - kill the PHP script

        }

    } # Other scenarios (Invalid password, etc.. are checked in the signup/login pages, not here)
}

# If script is still running here, it means something was invalid and the user did not login or signup+login

require '../required/redirect-to-index.php'; # Redirect to index.php for processing without invalid sessions or direct access

?>