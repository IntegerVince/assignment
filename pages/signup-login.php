<!DOCTYPE html>
<html>
    <head>

    </head>

    <body>
        <h1>{{ websiteName }}, Your To Do List Tracker</h1>
        <h2>{{ greetingMessage }}</h2>

        <form action="pages/task-list.php" method="post">
            <label for="fname">Username:</label>
            <input type="text" id="fname" name="fusername" placeholder="exampleUser">
            <label for="fpass">Password:</label>
            <input type="password" id="fpass" name="fpassword">
            <input type="submit" value="Submit">
        </form> 
    </body>
</html>