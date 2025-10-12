<!DOCTYPE html>
<html>
    <head>
        <script src="../javascript/task-list.js" type="text/javascript"></script>
    </head>

    <body>

        <h1>{{ websiteName }}, Your To Do List Tracker</h1>
        <h2>Hello, {{ username }}</h2>

        <a href="../redirect/logout-redirector.php"><button>Logout</button></a>

        <!-- Task list table -->
        <table>
            <tr>
                <th>Task</th>
                <th>Due Date</th>
                <th>Status</th>
            </tr>
        </table>

        <button id="addTask">Add Task</button>
        <button id="deleteTask">Delete Task</button>
        <button id="modifyTask">Modify Task</button>

    </body>
</html>