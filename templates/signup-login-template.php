<!DOCTYPE html>
<html>
    <head>

    </head>

    <body>

        {% if templateType == "Login" %}

            <h1>{{ websiteName }}, Your To Do List Tracker</h1>
            <h2>Login</h2>

            <form action="pages/task-list.php" method="post">
                <label for="fname">Username:</label>
                <input type="text" id="fname" name="fusername" placeholder="exampleUser">
                <label for="fpass">Password:</label>
                <input type="password" id="fpass" name="fpassword">
                <input type="submit" value="Submit">
            </form>

            <a href="redirect/signup-redirector.php"><p>No account? Signup</p></a>

        {% elseif templateType == "Signup" %}

            <h1>{{ websiteName }}, Your To Do List Tracker</h1>
            <h2>Signup</h2>

            <form action="pages/task-list.php" method="post">
                <label for="fname">Username:</label>
                <input type="text" id="fname" name="fusername" placeholder="exampleUser">
                <label for="fpass">Password:</label>
                <input type="password" id="fpass" name="fpassword">
                <input type="submit" value="Submit">
            </form>

            <!-- Empty "" will refresh the page, which will serve index.php again, which will load in the login template by default -->
            <a href=""><p>Already have an account? Login</p></a>

        {% endif %}
        
    </body>
</html>