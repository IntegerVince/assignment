<!DOCTYPE html>
<html>
    <head>

    </head>

    <body>

        <?php
            # Data fetched here will be connected to a database, processed, and depending on results, serve either an incorrect template or authorise the user

            if (isset($_POST["fusername"]) and isset($_POST["fpassword"])){
                # Username and password provided. connect to database and serve accordingly.
                print("authenticate and handle serve either login page with error or task list recursively");
            } else {
                # Check if login session is stored, otherwise serve the signup-login-template.php
                 print("session check and serve 'please login' or logged in task list recursively");
            }
            
        ?>

        <h1>{{ websiteName }}, Your To Do List Tracker</h1>
        <h2>Welcome Back, {{ username }}</h2>
    </body>
</html>