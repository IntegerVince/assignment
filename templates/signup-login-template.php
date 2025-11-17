<!DOCTYPE html>
<html>
    <head>
        <link rel="stylesheet" href="../css/styles.css"> <!-- CSS -->
        {% if templateType == "Login" %}
            <script src="../javascript/login.js" type="text/javascript"></script> <!-- AJAX Logic -->
        {% elseif templateType == "Signup" %}
            <script src="../javascript/signup.js" type="text/javascript"></script> <!-- AJAX Logic -->
        {% endif %}
        <script src="https://www.google.com/recaptcha/api.js" async defer></script> <!-- Google Recaptcha API -->
    </head>

    <body>

        <h1>{{ websiteName }}, Your To Do List Tracker</h1>

        <p id="errorMessage"></p> <!-- If error message exists, it will be shown. -->

        {% if templateType == "Login" %} <!-- Login Template -->

            <h2>Login</h2>

            <form id="loginForm" action="task-list.php" method="post">
                <label for="fname">Username:</label>
                <input type="text" id="fname" name="fusername_login" placeholder="exampleUser" required>
                <label for="fpass">Password:</label>
                <input type="password" id="fpass" name="fpassword_login" required>
                <div class="g-recaptcha" data-sitekey="6LcfrQ0sAAAAAJUtZM7a_YXltio8kG4CsRWa5RF2"></div> <!-- Google Recaptcha -->
                <input class="button displayBlockCenter" type="submit" value="Submit">
            </form>

            <a href="signup.php"><p>No account? Signup</p></a>

        {% elseif templateType == "Signup" %} <!-- Signup Template -->

            <h2>Signup</h2>

            <form id="signupForm" action="task-list.php" method="post">
                <label for="fname">Username:</label>
                <input type="text" id="fname" name="fusername_signup" placeholder="exampleUser" required>
                <label for="fpass">Password:</label>
                <input type="password" id="fpass" name="fpassword_signup" required>
                <div class="g-recaptcha" data-sitekey="6LcfrQ0sAAAAAJUtZM7a_YXltio8kG4CsRWa5RF2"></div> <!-- Google Recaptcha -->
                <input class="button displayBlockCenter" type="submit" value="Submit">
            </form>

            <a href="login.php"><p>Already have an account? Login</p></a>

        {% endif %}
        
    </body>
</html>