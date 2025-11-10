<!DOCTYPE html>
<html>
    <head>
        <link rel="stylesheet" href="../css/task-list.css">
        <script src="../javascript/task-list.js" type="text/javascript"></script> <!-- Includes Ajax Logic -->
    </head>

    <body>

        <h1>{{ websiteName }}, Your To Do List Tracker</h1>
        <h2>Hello, {{ username }}</h2>

        <a href="../redirect/logout-redirector.php"><button>Logout</button></a>

        <p id="message"></p> <!-- If error message exists, it will be shown. -->

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
            <tbody id="taskTableBody">
                {% for task in taskList %}
                    <tr class="task">
                        <td>{{ task.taskName }}</td>
                        
                        {% if task.taskDeadline == "0000-00-00" %}
                            <td> No Deadline </td>
                        {% else %}
                            <td>{{ task.taskDeadline }}</td>
                        {% endif %}

                        {% if task.pending == 1 %}
                            <td> Pending </td>
                        {% else %}
                            <td> Completed </td>
                        {% endif %}

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
            <form id="submitForm">
                <label for="fname">Task:</label>
                <input type="text" id="ftask" name="ftask_add" placeholder="exampleTask" required>
                <label for="fpass">Due Date:</label>
                <input type="date" id="fdate" name="fdate_add">
                <input type="submit" value="Add Task">
            </form>
        </template>

        <template id="modifyTaskMenuTemplate"> <!-- Modify Task Menu-->
            <p>Modify</p>
            <p>Current Selection:</p>
            <p id="selection">[None]</p>
            <form id="submitForm">
                <input type='hidden' id="taskID" name='taskID' value="">
                <label for="modificationType">Choose what to modify:</label>
                <select id="modificationType" name="modificationType">
                    <option value="taskDescription">Task Description</option>
                    <option value="dueDate">Due Date</option>
                    <option value="status">Status</option>
                </select>
                <div id="modifyTypeContainer"> <!-- Stores a menu (injected through javascript) depending on menu type. Default of Task Desc -->
                    <label for="taskDescription">Change to:</label>
                    <input type='text' id="taskDescription" name='taskDescription' value="" required>
                    <input type="submit" value="Modify Selected Task">
                </div>
            </form>
        </template>

        <template id="deleteTaskMenuTemplate"> <!-- Delete Task Menu-->
            <p>Delete A Task</p>
            <p>Current Selection:</p>
            <p id="selection">[None]</p>
            <form id="submitForm">
                <input type='hidden' id="taskID" name='taskID' value=""> 
                <input type="submit" value="Delete Selected Task">
            </form>
        </template>

        <template id="modifyTypeContainer-taskDescription">
            <label for="taskDescription">Change to:</label>
            <input type='text' id="taskDescription" name='taskDescription' value="" required>
            <input type="submit" value="Modify Selected Task">
        </template>

        <template id="modifyTypeContainer-dueDate">
            <label for="taskDueDate">Change to:</label>
            <input type='hidden' id="taskDueDateModification" name='taskDueDateModification' value="true"> <!-- In case date is left blank -->
            <input type='date' id="taskDueDate" name='taskDueDate' value="">
            <input type="submit" value="Modify Selected Task">
        </template>

        <template id="modifyTypeContainer-status">
            <input type='hidden' id="taskStatusAction" name='taskStatusAction' value="true">
            <input type="submit" value="Change Status">
        </template>
    </body>
</html>