<!DOCTYPE html>
<html>
    <head>

    </head>

    <body>

        <?php
            # Data fetched here will be connected to a database, processed, and depending on results, serve either an incorrect template or authorise the user

            if (isset($_POST["fusername"]) and isset($_POST["fpassword"])){

                # Username and password provided. Connect to database to check whether or not the credentials exist.
               
                $server = "localhost";
                $username = "root";
                $password = "";  # By default, XAMPP password is empty

                # Variable for connection
                $connection = new mysqli($server, $username, $password);

                #  Check if connection is good, if not, terminate the PHP script and give the error
                if (mysqli_connect_error()) {
                    die($connection->connect_error);
                }

                # Good connection

                echo "Successful Connection";

            } else {
                # Check if login session is stored, otherwise serve the signup-login-template.php
                 print("session check and serve 'please login' or logged in task list recursively");
            }
            
        ?>

        <h1>{{ websiteName }}, Your To Do List Tracker</h1>
        <h2>Welcome Back, {{ username }}</h2>
    </body>
</html>