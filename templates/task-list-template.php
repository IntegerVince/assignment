<!DOCTYPE html>
<html>
    <head>
        <link rel="stylesheet" href="../css/task-list.css">
        <script src="../javascript/task-list.js" type="text/javascript"></script>
    </head>

    <body>

        <h1>{{ websiteName }}, Your To Do List Tracker</h1>
        <h2>Hello, {{ username }}</h2>

        <a href="../redirect/logout-redirector.php"><button>Logout</button></a>

        <!-- Task list table -->
        <table>
            <thead>
                <tr>
                    <th>Task</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th hidden>taskID</th>
                </tr>
            </thead>
            <tbody>
                {% for task in taskList %}
                    <tr class="task">
                            <td>{{ task.taskName }}</td>
                        {% if task.taskDeadline == "0000-00-00" %}
                            <td> No Deadline </td>
                        {% else %}
                            <td>{{ task.taskDeadline }}</td>
                        {% endif %}
                        <td>[Pending]</td>
                        <td hidden>{{ task.taskID }}</td> <!-- Hidden task ID is used for handling selection -->
                    </tr>
                {% else %}
                    <tr>
                        <td colspan="3">No tasks yet</td>
                    </tr>
                {% endfor %}
            </tbody>

        </table>

        <button id="addTask">Add Task</button>
        <button id="modifyTask">Modify Task</button>
        <button id="deleteTask">Delete Task</button>

        <div id="menuContainer"></div>

        <!-- Template content for menuContainer which is controlled with javascript -->
        
        <template id="addTaskMenuTemplate"> <!-- Add Task Menu-->
            <p>Add A Task</p>
            <form action="../redirect/add-task.php" method="post">
                <label for="fname">Task:</label>
                <input type="text" id="fname" name="ftask_add" placeholder="exampleUser" required>
                <label for="fpass">Due Date:</label>
                <input type="date" id="fpass" name="fdate_add">
                <input type="submit" value="Add Task">
            </form>
        </template>

        <template id="modifyTaskMenuTemplate"> <!-- Modify Task Menu-->
            <p>Modify</p>
            <p>Current Selection:</p>
            <p id="selection">[None]</p>
        </template>

        <template id="deleteTaskMenuTemplate"> <!-- Delete Task Menu-->
            <p>Delete A Task</p>
            <p>Current Selection:</p>
            <p id="selection">[None]</p>
            <form action="../redirect/delete-task.php" method="post">
                <input type='hidden' id="taskID" name='taskID' value=""> 
                <input type="submit" value="Delete Selected Task">
            </form>
        </template>
    </body>
</html>