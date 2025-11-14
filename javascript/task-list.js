document.addEventListener("DOMContentLoaded", () => {

    

    // Global Variables
    var currentIndexSelection = -1; // Will store the current taskID of task to be modified if the modify task command is executed
    var currentTaskName = ""; // Will store the current selected task's name for display in the modify menu
    var currentTaskID = -1; // Will store the database taskID
    var modificationMenuChosenValue = "taskDescription"; // Will store the current modification dropdown menu selection (default is task desc)
    
    // Filters will be updated through events
    var statusFilter = document.getElementById("statusFilterSelection").textContent;
    var nameFilter = document.getElementById("nameFilter").value;
    var dateStartFilter = document.getElementById("dateStartFilter").value;
    var dateEndFilter = document.getElementById("dateEndFilter").value;

    // Will store changes from the actual filter which get 'published' to the actual global variable once filter is applied
    // This avoids relying on the input field form in real time for changes since the fields might be different than what was submitted
    var draftStatusFilter = statusFilter;
    var draftNameFilter = nameFilter;
    var draftDateStartFilter = dateStartFilter;
    var draftDateEndFilter = dateEndFilter;

    // Code which handles task selection

    tasks = document.querySelectorAll(".task"); // all the tasks, fetched through the class they share

    // Iterate through all the 'tasks' with foreach, also passing in the 'indexValue' of the current 'task' element
    tasks.forEach(function(task) {  
        
        // Add an event listener for each task which will enable 'Clicking them'.
        task.addEventListener("click", function() { 

            // Code which triggers with the 'click' event listener
            
            if (currentIndexSelection != -1){ // There was a previous selection

                tasks = document.querySelectorAll(".task"); // Update the list of all tasks

                tasks[currentIndexSelection].style.backgroundColor = null; // Reset previous selection's colour

            }

            this.style.backgroundColor = "red"; // Set current selection to red

            currentTaskName = this.childNodes[1].textContent; // childNodes[0] is the task name row

            currentTaskID = this.childNodes[7].textContent; // childNodes[7] is the taskID hidden table value

            currentIndexSelection = getTableIndexFromTaskID(currentTaskID);

            // Fetch the tag which mentions the current 'Selection' and change the value to reflect the actual selection
            
            // If they don't exist, it returns null
            var modifySelection = document.getElementById("selection"); // (for modify/delete options only)
            var taskIDContainer = document.getElementById("taskID");

            if (modifySelection != null){
                modifySelection.textContent = currentTaskName; // Only set the data if the relevant paragraph container exists
            }

            if (taskIDContainer != null){
                taskIDContainer.value = currentTaskID;
            }

        });
    });
    
    // ==================================================================================

    // Code which handles menu spawning


    // Given a menuContainer ID & template ID, places the content of the template into the menuContainer
    function injectMenuToDiv(menuContainerID, templateID) {

        // Select Menu to Modify
        const menuContainer = document.querySelector("#" + menuContainerID); // # String concat to keep parameters consistent
        
        // Select Template To Inject
        const templateToBeInjected = document.getElementById(templateID);

        // Inject Template Into Menu
        menuContainer.innerHTML = templateToBeInjected.innerHTML; // Inner HTML is template spawning // safe from XSS

        // The template to be set is either 'Modify' or 'Delete', which has the 'Selection' container showing current selection
        if (templateID == "modifyTaskMenuTemplate" || templateID == "deleteTaskMenuTemplate"){

            if (currentTaskName != ""){ // There is a valid selection right now

                // Fetch the containers and add the current data
                var modifySelection = document.getElementById("selection");
                modifySelection.textContent = currentTaskName; 

                var taskIDContainer = document.getElementById("taskID");
                taskIDContainer.value = currentTaskID;

            }

            if (templateID == "modifyTaskMenuTemplate"){

                // Fetch the modify dropdown menu
                var modificationType = document.getElementById("modificationType");

                modificationType.addEventListener('change', function(){ // Add listener to inject menu depending on dropdown

                    modificationMenuChosenValue = this.value;
                    
                    if (modificationMenuChosenValue == "taskDescription"){
                        
                         injectMenuToDiv("modifyTypeContainer", "modifyTypeContainer-taskDescription");

                    }  else if  (modificationMenuChosenValue == "dueDate"){
                        
                        injectMenuToDiv("modifyTypeContainer", "modifyTypeContainer-dueDate");

                    } else if  (modificationMenuChosenValue == "status"){
                        
                        injectMenuToDiv("modifyTypeContainer", "modifyTypeContainer-status");
                        
                    }
                    
                });

            }
        }
    }

    // Button Objects
    var addTaskButton = document.getElementById("addTask");
    var modifyTaskButton = document.getElementById("modifyTask");
    var deleteTaskButton = document.getElementById("deleteTask");
    
    // Event listeners for buttons
    addTaskButton.addEventListener("click", addTaskMenuInjector);
    modifyTaskButton.addEventListener("click", modifyTaskMenuInjector);
    deleteTaskButton.addEventListener("click", deleteTaskMenuInjector);

    // Menu injectors depending on buttons pressed
    function addTaskMenuInjector() {

        injectMenuToDiv("menuContainer", "addTaskMenuTemplate");

    }

    function modifyTaskMenuInjector() {

        injectMenuToDiv("menuContainer", "modifyTaskMenuTemplate");

    }

    function deleteTaskMenuInjector() {

        injectMenuToDiv("menuContainer", "deleteTaskMenuTemplate");

    }

    // ==================================================================================

    // Functions used throughout the script

    function getTableIndexFromTaskID(taskID){ // Function which converts the database taskID to the task table row index
        
        taskTableBody = document.getElementById("taskTableBody"); // Get Table Body where tasks are stored
        
        // Iterate through the table to find the taskID
        for (index = 0; index < taskTableBody.rows.length; index++){

            // Fetch the current taskID iteration
            var currentMatchedTaskID = taskTableBody.rows[index].cells[3].textContent;

            if (currentMatchedTaskID == taskID){ // There is a match in taskID - the row has been found!

                return index; // Give the table index

            }

        }

        return -1; // At this stage, it means it was not found - return a -1 to inform the caller

    }

    // ==================================================================================

    // Ajax logic code for add, modify and delete button

    // Add Task Logic
    document.getElementById("addTask").addEventListener("click", function(){ 

        // Any submit form currently loaded (only 1 at a time is loaded) has the respective event listener attached
        document.getElementById("submitForm").addEventListener("submit", function(buttonEvent){

            buttonEvent.preventDefault(); // Prevent the button from automatically redirecting

            // Fetch the data from the form
            var taskName = document.getElementById("ftask").value;
            var taskDate = document.getElementById("fdate").value;

            if (taskName != ""){ // Task name is not blank which is good - can proceed

                fetch("../ajax/add-task.php", { // Send a fetch request where to send the data in for validation

                    "method": "POST", // // Specify that the data will be passed as POST

                    "headers": {

                        "Content-Type": "application/json; charset=utf8" // Specify the type of data that will be passed

                    },

                    "body": JSON.stringify( // Convert the JSON Object to a JSON string before passing

                        // The actual data being passed [A JSON Object]

                        {
                            "taskName": taskName,
                            "taskDate": taskDate
                        }
                    )
                }).then(function(response){ // Catch the response

                    return response.text(); // Return the response

                }).then(function(data){ // Fetch the result and pass it into data

                    if (data == "Fail"){

                        message = document.getElementById("message");

                        message.textContent = "Error! Task name cannot be blank!";

                    } else {

                        message.textContent = "Task has been added!";

                        // Check with the database if the newly added task respects the current filters in place for injection

                        fetch("../ajax/check-filters.php", { // Send a fetch request where to send the data in for validation

                            "method": "POST", // // Specify that the data will be passed as POST

                            "headers": {

                                "Content-Type": "application/json; charset=utf8" // Specify the type of data that will be passed

                            },

                            "body": JSON.stringify( // Convert the JSON Object to a JSON string before passing

                                // The actual data being passed [A JSON Object]

                                {
                                    "taskName": taskName,
                                    "taskDate": taskDate,
                                    "taskStatus": "Pending",
                                    "nameFilter": nameFilter,
                                    "statusFilter": statusFilter,
                                    "dateStartFilter": dateStartFilter,
                                    "dateEndFilter": dateEndFilter
                                }

                            )
                        }).then(function(response){ // Catch the response

                            return response.text(); // Return the response

                        }).then(function(dataFilter){ // // Fetch the result and pass it into data

                            if (dataFilter != "Fail"){ // A filter check was applied without issues

                                if (dataFilter){

                                    // Matches current filter - can inject the task

                                    // Inject the new data without refreshing the page

                                    taskTableBody = document.getElementById("taskTableBody"); // Get Table Body where injection will take place

                                    noTasksView = document.getElementById("noTasks");

                                    if (noTasksView != null){

                                        // There were no previous tasks. Now that there is, this preview (which is a table row) needs to be removed

                                        taskTableBody.deleteRow(0);

                                    }

                                    latestTableRow = taskTableBody.insertRow(-1); // Insert a row at the end

                                    // Put the row under the generic 'Task' to enable task functionality such as hover effects, etc..
                                    latestTableRow.classList.add("task");

                                    // Create the cells of the task to be injected
                                    cellTaskName = latestTableRow.insertCell(0);
                                    cellDueDate = latestTableRow.insertCell(1);
                                    cellStatus = latestTableRow.insertCell(2);
                                    cellTaskID = latestTableRow.insertCell(3);

                                    // Hide the cell given taskID shouldn't be visible.
                                    cellTaskID.style.display = "none";  // style.visibility = "hidden" is not used because it breaks the table alignment

                                    // Inject the data into the cells
                                    
                                    cellTaskName.textContent = taskName;

                                    // Correctly inject deadline if none was specified
                                    if (taskDate == ""){

                                        cellDueDate.textContent = "No Deadline";

                                    } else {

                                        cellDueDate.textContent = taskDate;

                                    }
                                    
                                    cellStatus.textContent = "Pending"; // Default status when a task is first added is always 'Pending'

                                    cellTaskID.textContent = data; // 'Data' variable is the passed taskID from the ajax

                                    // Add an event listener for this task which will enable 'Clicking it' like the other existing tasks.
                                    latestTableRow.addEventListener("click", function() { 

                                        // Code which triggers with the 'click' event listener
                                        
                                        if (currentIndexSelection != -1){ // There was a previous selection

                                            tasks = document.querySelectorAll(".task"); // Update the list of all tasks

                                            tasks[currentIndexSelection].style.backgroundColor = null; // Reset previous selection's colour

                                        }

                                        this.style.backgroundColor = "red"; // Set current selection to red

                                        currentTaskName = this.childNodes[0].textContent; // childNodes[0] is the task name row

                                        currentTaskID = this.childNodes[3].textContent; // childNodes[3] is the taskID hidden table value

                                        currentIndexSelection = getTableIndexFromTaskID(currentTaskID);

                                        // Fetch the tag which mentions the current 'Selection' and change the value to reflect the actual selection
                                        
                                        // If they don't exist, it returns null
                                        var modifySelection = document.getElementById("selection"); // (for modify/delete options only)
                                        var taskIDContainer = document.getElementById("taskID");

                                        if (modifySelection != null){
                                            modifySelection.textContent = currentTaskName; // Only set the data if the relevant paragraph container exists
                                        }

                                        if (taskIDContainer != null){
                                            taskIDContainer.value = currentTaskID;
                                        }

                                    });
                                }

                                // Reset the values of the input fields
                                document.getElementById("ftask").value = "";
                                document.getElementById("fdate").value = "";
                            }
                        })
                    }
                })
            } else { // Task name is blank
                message = document.getElementById("message");

                message.textContent = "Error! Task name cannot be blank!";
            }
        });
    });

    // Modify Task Logic
    document.getElementById("modifyTask").addEventListener("click", function(){

        modificationMenuChosenValue = "taskDescription"; // When the 'Modify' button is pressed, it goes back to the default menu
        
        // Any submit form currently loaded (only 1 at a time is loaded) has the respective event listener attached
        document.getElementById("submitForm").addEventListener("submit", function(buttonEvent){

            buttonEvent.preventDefault(); // Prevent the button from automatically redirecting

            // Check on the modification request submitted and act accordingly

            if (modificationMenuChosenValue == "taskDescription"){  // The submit form was for task name change

                // Fetch the data from the form
                var newTaskName = document.getElementById("taskDescription").value;

                if (newTaskName != "" && currentTaskID != -1){ // The provided task name is not blank, we can proceed

                    fetch("../ajax/modify-task-name.php", { // Send a fetch request where to send the data in for modification

                        "method": "POST", // Specify that the data will be passed as POST

                        "headers": {

                            "Content-Type": "application/json; charset=utf8" // Specify the type of data that will be passed

                        },

                        "body": JSON.stringify( // Convert the JSON Object to a JSON string before passing

                            // The actual data being passed [A JSON Object]

                            {
                                "taskID": currentTaskID,
                                "taskName": newTaskName
                            }
                        )
                    }).then(function(response){ // Catch the response

                        return response.text(); // Return the response

                    }).then(function(data){ // Fetch the result and pass it into data

                        if (data == "Success"){

                            message = document.getElementById("message");

                            message.textContent = "Sucess! Task name has been modified!";

                            // Check with the database if the modified task name respects the current filters in place

                            fetch("../ajax/check-filters.php", { // Send a fetch request where to send the data in for validation

                                "method": "POST", // // Specify that the data will be passed as POST

                                "headers": {

                                    "Content-Type": "application/json; charset=utf8" // Specify the type of data that will be passed

                                },

                                "body": JSON.stringify( // Convert the JSON Object to a JSON string before passing

                                    // The actual data being passed [A JSON Object]

                                    {
                                        "taskName": newTaskName,
                                        "taskDate": "N/A", // Not Needed For Check
                                        "taskStatus": "N/A", // Not Needed For Check
                                        "nameFilter": nameFilter,
                                        "statusFilter": statusFilter,
                                        "dateStartFilter": dateStartFilter,
                                        "dateEndFilter": dateEndFilter
                                    }

                                )
                            }).then(function(response){ // Catch the response

                                return response.text(); // Return the response

                            }).then(function(dataFilter){ // // Fetch the result and pass it into data

                                if (dataFilter != "Fail"){ // A filter check was applied without issues

                                    if (dataFilter){

                                        // Matches current filter - can update the task
                                        
                                        // Update task name without refreshing the page

                                        taskTableBody = document.getElementById("taskTableBody"); // Get Table Body where injection will take place

                                        taskIndex = getTableIndexFromTaskID(currentTaskID);

                                        taskTableBody.rows[taskIndex].cells[0].textContent = newTaskName; // Inject the new task name

                                        document.getElementById("selection").textContent = newTaskName; // Update the task name in the selection preview

                                    } else {

                                        // No Longer matches the task name filter criteria - delete the task

                                        taskTableBody = document.getElementById("taskTableBody"); // Get Table Body where injection will take place

                                        taskIndex = getTableIndexFromTaskID(currentTaskID);

                                        taskTableBody.deleteRow(taskIndex); // Delete the actual row

                                        // Reset the selection since the selection was removed
                                        currentIndexSelection = -1;
                                        currentTaskID = -1;
                                        currentTaskName = "[None]";
                                        
                                        // Reset selection preview
                                        document.getElementById("selection").textContent = "[None]";

                                        if (taskTableBody.rows.length == 0){ // That was the only task in the database

                                            // Inject the 'No Tasks' preview again

                                            taskTableBody.insertRow(); // Inject a row since there are none

                                            // Inject cells in this new row
                                            taskTableBody.rows[0].insertCell(0); 
                                            taskTableBody.rows[0].insertCell(1);
                                            taskTableBody.rows[0].insertCell(2);

                                            // Inject the preview spanning across the entire table

                                            taskTableBody.rows[0].cells[0].textContent = "N/A";
                                            taskTableBody.rows[0].cells[1].textContent = "No tasks yet";
                                            taskTableBody.rows[0].cells[2].textContent = "N/A";

                                            taskTableBody.rows[0].setAttribute("id", "noTasks"); // Give ID of no Tasks 

                                        }

                                    }

                                    // Reset the value of the input field

                                    document.getElementById("taskDescription").value = ""; 
                                }
                            })

                        } else if (data == "Blank"){
                            
                            // This check is made if the user modified the javascript and it passed data to the ajax php script

                            message = document.getElementById("message");

                            message.textContent = "Error! The new task name cannot be blank!";


                        } else if (data == "BlankTaskID"){

                            // This check is made if the user modified the javascript and it passed data to the ajax php script

                            message = document.getElementById("message");

                            message.textContent = "Error! Please make a selection first";


                        } else if (data == "Mismatch"){

                            message = document.getElementById("message");

                            message.textContent = "Error! Task ID user mismatch!";

                        } else {

                            message = document.getElementById("message");

                            message.textContent = "An unexpected error has occured! " + data;

                        }
                    })

                } else { // Task name is blank or task not selected, cannot proceed

                    message = document.getElementById("message");

                    if (currentTaskID == -1){

                        message.textContent = "Error! Please make a selection first";

                    } else {

                        message.textContent = "Error! The new task name cannot be blank!";

                    }

                }

            } else if (modificationMenuChosenValue == "dueDate"){ // The submit form was for task due date change

                if (currentTaskID == -1){

                    // No task was selected

                    message = document.getElementById("message");

                    message.textContent = "Error! Please select a task first!";

                } else { // Task is selected

                    // Fetch the data from the form
                    var newDate = document.getElementById("taskDueDate").value;

                    fetch("../ajax/modify-task-date.php", { // Send a fetch request where to send the data in for modification

                        "method": "POST", // Specify that the data will be passed as POST

                        "headers": {

                            "Content-Type": "application/json; charset=utf8" // Specify the type of data that will be passed

                        },

                        "body": JSON.stringify( // Convert the JSON Object to a JSON string before passing

                            // The actual data being passed [A JSON Object]

                            {
                                "taskID": currentTaskID,
                                "taskDueDate": newDate
                            }
                        )
                    }).then(function(response){ // Catch the response

                        return response.text(); // Return the response

                    }).then(function(data){ // Fetch the result and pass it into data

                        if (data == "Fail"){ // Blank Task ID

                            message = document.getElementById("message");

                            message.textContent = "Error! Task ID cannot be blank!";

                        } else if (data == "ValidDate"){

                            message = document.getElementById("message");

                            message.textContent = "Task date has been updated!";

                            // Check with the database if the modified task date respects the current filters in place

                            fetch("../ajax/check-filters.php", { // Send a fetch request where to send the data in for validation

                                "method": "POST", // // Specify that the data will be passed as POST

                                "headers": {

                                    "Content-Type": "application/json; charset=utf8" // Specify the type of data that will be passed

                                },

                                "body": JSON.stringify( // Convert the JSON Object to a JSON string before passing

                                    // The actual data being passed [A JSON Object]

                                    {
                                        "taskName": "N/A", // Not Needed For Check
                                        "taskDate": newDate,
                                        "taskStatus": "N/A", // Not Needed For Check
                                        "nameFilter": nameFilter,
                                        "statusFilter": statusFilter,
                                        "dateStartFilter": dateStartFilter,
                                        "dateEndFilter": dateEndFilter
                                    }

                                )
                            }).then(function(response){ // Catch the response

                                return response.text(); // Return the response

                            }).then(function(dataFilter){ // // Fetch the result and pass it into data

                                if (dataFilter != "Fail"){ // A filter check was applied without issues

                                    if (dataFilter){

                                        // Matches current filter - can update the task

                                        // Update date without refreshing page

                                        taskTableBody = document.getElementById("taskTableBody"); // Get Table Body where injection will take place

                                        taskIndex = getTableIndexFromTaskID(currentTaskID);

                                        if (newDate == ""){

                                            // Blank date means no deadline is to be done

                                            taskTableBody.rows[taskIndex].cells[1].textContent = "No Deadline";
                                            
                                        } else {

                                            // Inject the deadline date

                                            taskTableBody.rows[taskIndex].cells[1].textContent = newDate;

                                        }

                                    } else {

                                        // No Longer matches the task name filter criteria - delete the task

                                        taskTableBody = document.getElementById("taskTableBody"); // Get Table Body where injection will take place

                                        taskIndex = getTableIndexFromTaskID(currentTaskID);

                                        taskTableBody.deleteRow(taskIndex); // Delete the actual row

                                        // Reset the selection since the selection was removed
                                        currentIndexSelection = -1;
                                        currentTaskID = -1;
                                        currentTaskName = "[None]";
                                        
                                        // Reset selection preview
                                        document.getElementById("selection").textContent = "[None]";

                                        if (taskTableBody.rows.length == 0){ // That was the only task in the database

                                            // Inject the 'No Tasks' preview again

                                            taskTableBody.insertRow(); // Inject a row since there are none

                                            // Inject cells in this new row
                                            taskTableBody.rows[0].insertCell(0); 
                                            taskTableBody.rows[0].insertCell(1);
                                            taskTableBody.rows[0].insertCell(2);

                                            // Inject the preview spanning across the entire table

                                            taskTableBody.rows[0].cells[0].textContent = "N/A";
                                            taskTableBody.rows[0].cells[1].textContent = "No tasks yet";
                                            taskTableBody.rows[0].cells[2].textContent = "N/A";

                                            taskTableBody.rows[0].setAttribute("id", "noTasks"); // Give ID of no Tasks 

                                        }

                                    }

                                    // Reset the value of the date field
                            
                                    document.getElementById("taskDueDate").value = ""; 
                                }
                            })

                        } else if (data == "InvalidDate"){

                            message = document.getElementById("message");

                            message.textContent = "Error! Task Date Is Invalid!";

                        } else if (data == "Mismatch"){

                            message = document.getElementById("message");

                            message.textContent = "Error! Task ID user mismatch!";

                        } else {

                            // Tackling other error instances which shouldn't occur unless the user messed with the javascript code

                            message = document.getElementById("message");

                            message.textContent = "An unexpected error has occured! " + data;

                        }
                    })

                }

            } else if (modificationMenuChosenValue == "status"){ // The submit form was for status change

                if (currentTaskID == -1){

                    // No task was selected

                    message = document.getElementById("message");

                    message.textContent = "Error! Please select a task first!";

                } else { // Task is selected

                    fetch("../ajax/modify-task-status.php", { // Send a fetch request where to send the data in for modification

                        "method": "POST", // Specify that the data will be passed as POST

                        "headers": {

                            "Content-Type": "application/json; charset=utf8" // Specify the type of data that will be passed

                        },

                        "body": JSON.stringify( // Convert the JSON Object to a JSON string before passing

                            // The actual data being passed [A JSON Object]

                            {
                                "taskID": currentTaskID,
                            }
                        )
                    }).then(function(response){ // Catch the response

                        return response.text(); // Return the response

                    }).then(function(data){ // // Fetch the result and pass it into data

                        if (data == "Fail"){

                            message = document.getElementById("message");

                            message.textContent = "Error! Task ID cannot be blank!";

                        } else if (data == "Completed"){

                            message = document.getElementById("message");

                            message.textContent = "Task has been changed to 'Completed'";

                            // Check with the database if the modified task status respects the current filters in place

                            fetch("../ajax/check-filters.php", { // Send a fetch request where to send the data in for validation

                                "method": "POST", // // Specify that the data will be passed as POST

                                "headers": {

                                    "Content-Type": "application/json; charset=utf8" // Specify the type of data that will be passed

                                },

                                "body": JSON.stringify( // Convert the JSON Object to a JSON string before passing

                                    // The actual data being passed [A JSON Object]

                                    {
                                        "taskName": "N/A", // Not Needed For Check
                                        "taskDate": "N/A", // Not Needed For Check
                                        "taskStatus": "Completed", 
                                        "nameFilter": nameFilter,
                                        "statusFilter": statusFilter,
                                        "dateStartFilter": dateStartFilter,
                                        "dateEndFilter": dateEndFilter
                                    }

                                )
                            }).then(function(response){ // Catch the response

                                return response.text(); // Return the response

                            }).then(function(dataFilter){ // // Fetch the result and pass it into data

                                if (dataFilter != "Fail"){ // A filter check was applied without issues

                                    if (dataFilter){

                                        // Matches current filter - can update the task

                                        // Update to show as 'Completed' without refreshing the page

                                        taskTableBody = document.getElementById("taskTableBody"); // Get Table Body where injection will take place

                                        taskIndex = getTableIndexFromTaskID(currentTaskID);

                                        taskTableBody.rows[taskIndex].cells[2].textContent = "Completed";

                                    } else {

                                        // No Longer matches the task name filter criteria - delete the task

                                        taskTableBody = document.getElementById("taskTableBody"); // Get Table Body where injection will take place

                                        taskIndex = getTableIndexFromTaskID(currentTaskID);

                                        taskTableBody.deleteRow(taskIndex); // Delete the actual row

                                        // Reset the selection since the selection was removed
                                        currentIndexSelection = -1;
                                        currentTaskID = -1;
                                        currentTaskName = "[None]";
                                        
                                        // Reset selection preview
                                        document.getElementById("selection").textContent = "[None]";

                                        if (taskTableBody.rows.length == 0){ // That was the only task in the database

                                            // Inject the 'No Tasks' preview again

                                            taskTableBody.insertRow(); // Inject a row since there are none

                                            // Inject cells in this new row
                                            taskTableBody.rows[0].insertCell(0); 
                                            taskTableBody.rows[0].insertCell(1);
                                            taskTableBody.rows[0].insertCell(2);

                                            // Inject the preview spanning across the entire table

                                            taskTableBody.rows[0].cells[0].textContent = "N/A";
                                            taskTableBody.rows[0].cells[1].textContent = "No tasks yet";
                                            taskTableBody.rows[0].cells[2].textContent = "N/A";

                                            taskTableBody.rows[0].setAttribute("id", "noTasks"); // Give ID of no Tasks 

                                        }

                                    }
                                }
                            })

                        } else if (data == "Pending"){

                            message = document.getElementById("message");

                            message.textContent = "Task has been changed to 'Pending'";

                            // Check with the database if the modified task status respects the current filters in place

                            fetch("../ajax/check-filters.php", { // Send a fetch request where to send the data in for validation

                                "method": "POST", // // Specify that the data will be passed as POST

                                "headers": {

                                    "Content-Type": "application/json; charset=utf8" // Specify the type of data that will be passed

                                },

                                "body": JSON.stringify( // Convert the JSON Object to a JSON string before passing

                                    // The actual data being passed [A JSON Object]

                                    {
                                        "taskName": "N/A", // Not Needed For Check
                                        "taskDate": "N/A", // Not Needed For Check
                                        "taskStatus": "Pending", 
                                        "nameFilter": nameFilter,
                                        "statusFilter": statusFilter,
                                        "dateStartFilter": dateStartFilter,
                                        "dateEndFilter": dateEndFilter
                                    }

                                )
                            }).then(function(response){ // Catch the response

                                return response.text(); // Return the response

                            }).then(function(dataFilter){ // // Fetch the result and pass it into data

                                if (dataFilter != "Fail"){ // A filter check was applied without issues

                                    if (dataFilter){

                                        // Matches current filter - can update the task

                                        // Update to show as 'Pending' without refreshing the page

                                        taskTableBody = document.getElementById("taskTableBody"); // Get Table Body where injection will take place

                                        taskIndex = getTableIndexFromTaskID(currentTaskID);

                                        taskTableBody.rows[taskIndex].cells[2].textContent = "Pending";

                                    } else {

                                        // No Longer matches the task name filter criteria - delete the task

                                        taskTableBody = document.getElementById("taskTableBody"); // Get Table Body where injection will take place

                                        taskIndex = getTableIndexFromTaskID(currentTaskID);

                                        taskTableBody.deleteRow(taskIndex); // Delete the actual row

                                        // Reset the selection since the selection was removed
                                        currentIndexSelection = -1;
                                        currentTaskID = -1;
                                        currentTaskName = "[None]";
                                        
                                        // Reset selection preview
                                        document.getElementById("selection").textContent = "[None]";

                                        if (taskTableBody.rows.length == 0){ // That was the only task in the database

                                            // Inject the 'No Tasks' preview again

                                            taskTableBody.insertRow(); // Inject a row since there are none

                                            // Inject cells in this new row
                                            taskTableBody.rows[0].insertCell(0); 
                                            taskTableBody.rows[0].insertCell(1);
                                            taskTableBody.rows[0].insertCell(2);

                                            // Inject the preview spanning across the entire table

                                            taskTableBody.rows[0].cells[0].textContent = "N/A";
                                            taskTableBody.rows[0].cells[1].textContent = "No tasks yet";
                                            taskTableBody.rows[0].cells[2].textContent = "N/A";

                                            taskTableBody.rows[0].setAttribute("id", "noTasks"); // Give ID of no Tasks 

                                        }

                                    }
                                }
                            })

                        } else if (data == "Mismatch"){

                            message = document.getElementById("message");

                            message.textContent = "Error! Task ID user mismatch!";

                        } else {

                            // Tackling other error instances which shouldn't occur unless the user messed with the javascript code

                            message = document.getElementById("message");

                            message.textContent = "An unexpected error has occured! " + data;

                        }
                    })
                }
            }
        });
    });

    // Delete Task Logic
    document.getElementById("deleteTask").addEventListener("click", function(){
        // Any submit form currently loaded (only 1 at a time is loaded) has the respective event listener attached
        document.getElementById("submitForm").addEventListener("submit", function(buttonEvent){

            buttonEvent.preventDefault(); // Prevent the button from automatically redirecting

            if (currentTaskID != -1){ // A Task is Selected

                fetch("../ajax/delete-task.php", { // Send a fetch request where to send the data in for deletion

                    "method": "POST", // Specify that the data will be passed as POST

                    "headers": {

                        "Content-Type": "application/json; charset=utf8" // Specify the type of data that will be passed

                    },

                    "body": JSON.stringify( // Convert the JSON Object to a JSON string before passing

                        // The actual data being passed [A JSON Object]

                        {
                            "taskID": currentTaskID,
                        }
                    )
                }).then(function(response){ // Catch the response

                    return response.text(); // Return the response

                }).then(function(data){ // // Fetch the result and pass it into data

                    if (data == "Fail"){

                        message = document.getElementById("message");

                        message.textContent = "Error! Task ID cannot be blank!";

                    } else if (data == "Success"){

                        message = document.getElementById("message");

                        message.textContent = "Task has been successfully deleted!";

                        // Update to show deleted task without refreshing the page

                        taskTableBody = document.getElementById("taskTableBody"); // Get Table Body where deletion will take place

                        taskIndex = getTableIndexFromTaskID(currentTaskID);

                        taskTableBody.deleteRow(taskIndex); // Delete the actual row

                        // Reset the selection since the selection was removed
                        currentIndexSelection = -1;
                        currentTaskID = -1;
                        currentTaskName = "[None]";
                        
                        // Reset selection preview
                        document.getElementById("selection").textContent = "[None]";

                        if (taskTableBody.rows.length == 0){ // That was the only task in the database

                            // Inject the 'No Tasks' preview again

                            taskTableBody.insertRow(); // Inject a row since there are none

                            // Inject cells in this new row
                            taskTableBody.rows[0].insertCell(0); 
                            taskTableBody.rows[0].insertCell(1);
                            taskTableBody.rows[0].insertCell(2);

                            // Inject the preview spanning across the entire table

                            taskTableBody.rows[0].cells[0].textContent = "N/A";
                            taskTableBody.rows[0].cells[1].textContent = "No tasks yet";
                            taskTableBody.rows[0].cells[2].textContent = "N/A";

                            taskTableBody.rows[0].setAttribute("id", "noTasks"); // Give ID of no Tasks 

                        }

                    } else if (data == "Mismatch"){

                        message = document.getElementById("message");

                        message.textContent = "Error! Task ID user mismatch!";

                    } else {

                        // Tackling other error instances which shouldn't occur unless the user messed with the javascript code

                        message = document.getElementById("message");

                        message.textContent = "An unexpected error has occured! " + data;

                    }
                })

            } else { // No Task Is Selected

                message = document.getElementById("message");

                message.textContent = "Error! Please select a task first!";
            }
        });
    });

    // ==================================================================================

    // Code that handles filters

    // =====================================

    // Filter Change Event Triggers To Update Global Variables & Previews

    // =====================================

    // Status Filter Logic

    // Pending Status Filter
    document.getElementById("pendingStatusFilter").addEventListener("click", function(){

        document.getElementById("statusFilterSelection").textContent = "Pending Only";

        draftStatusFilter = "Pending Only";

    });

    // Completed Status Filter

    document.getElementById("completedStatusFilter").addEventListener("click", function(){

        document.getElementById("statusFilterSelection").textContent = "Completed Only";

        draftStatusFilter = "Completed Only";

    });

    // Clear Status Filter

    document.getElementById("anyStatusFilter").addEventListener("click", function(){

        document.getElementById("statusFilterSelection").textContent = "Any Status";

        draftStatusFilter = "Any Status";

    });

    // Name Filter

    document.getElementById("nameFilter").addEventListener("input", function(){
        
        draftNameFilter = document.getElementById("nameFilter").value;
        
    });

    // Date Start Filter

    document.getElementById("dateStartFilter").addEventListener("input", function(){
        
        draftDateStartFilter = document.getElementById("dateStartFilter").value;

    });

    // Date End Filter

    document.getElementById("dateEndFilter").addEventListener("input", function(){
        
        draftDateEndFilter = document.getElementById("dateEndFilter").value;

    });

    // =====================================

    // Apply And Clear Filter Buttons Logic

    // =====================================

    // Apply Filter Logic

    document.getElementById("applyFilterButton").addEventListener("click", function(){

        // Merge the drafted values with the global variables
        statusFilter = draftStatusFilter;
        nameFilter = draftNameFilter;
        dateStartFilter = draftDateStartFilter;
        dateEndFilter = draftDateEndFilter;

        fetch("../ajax/filter-tasks.php", { // Send a fetch request where to send the data in for filtration

                    "method": "POST", // // Specify that the data will be passed as POST

                    "headers": {

                        "Content-Type": "application/json; charset=utf8" // Specify the type of data that will be passed

                    },

                    "body": JSON.stringify( // Convert the JSON Object to a JSON string before passing

                        // The actual data being passed [A JSON Object]

                        {
                            "statusFilter": statusFilter,
                            "nameFilter": nameFilter,
                            "dateStartFilter": dateStartFilter,
                            "dateEndFilter": dateEndFilter
                        }
                    )
                }).then(function(response){ // Catch the response

                    return response.text(); // Return the response

                }).then(function(data){ // // Fetch the result and pass it into data

                    // The data passed is being checked with double quotations marks because it was passed as a JSON string

                    if (data != '"Fail"' && data != '"InvalidDates"' && data != '"InvalidDateRange"'){ // Filter Was A Success

                        // Since filter will be applied, reset selection
                        currentIndexSelection = -1;
                        currentTaskID = -1;
                        currentTaskName = "[None]";

                        taskTableBody = document.getElementById("taskTableBody"); // Get Table Body where injection will take place

                        taskTableBody.textContent = ""; // Clear all Previous Entries
                        parsedData = JSON.parse(data); // Parse JSON data to turn it form a string into an object we can use

                        for (index = 0; index != parsedData.length; index++){ // Iterate through the filtered tasks

                            newTableRow = taskTableBody.insertRow(-1); // Create a new row at the end where the injected task will be placed

                            // Put the row under the generic 'Task' to enable task functionality such as hover effects, etc..
                            newTableRow.classList.add("task");

                            // Create cells for the injected task's values
                            newTableRow.insertCell(0);
                            newTableRow.insertCell(1);
                            newTableRow.insertCell(2);
                            newTableRow.insertCell(3);

                            newTableRow.cells[0].textContent = parsedData[index]["taskName"]; // Inject Task Name

                            // Check If Deadline Is Set & Inject

                            if (parsedData[index]["taskDeadline"] == "0000-00-00"){

                                newTableRow.cells[1].textContent = "No Deadline";

                            } else {

                                newTableRow.cells[1].textContent = parsedData[index]["taskDeadline"];

                            }

                            // Check Status & Inject

                            if (parsedData[index]["pending"] == 1){

                                newTableRow.cells[2].textContent = "Pending";

                            } else {

                                newTableRow.cells[2].textContent = "Completed";

                            }

                            newTableRow.cells[3].textContent = parsedData[index]["taskID"]; // Inject Task ID

                            newTableRow.cells[3].style.display = "none"; // style.visibility = "hidden" is not used because it breaks the table alignment

                            // Add an event listener for this task which will enable 'Clicking it' like the other existing tasks.
                            newTableRow.addEventListener("click", function() { 

                                // Code which triggers with the 'click' event listener
                                
                                if (currentIndexSelection != -1){ // There was a previous selection

                                    tasks = document.querySelectorAll(".task"); // Update the list of all tasks

                                    tasks[currentIndexSelection].style.backgroundColor = null; // Reset previous selection's colour

                                }

                                this.style.backgroundColor = "red"; // Set current selection to red

                                currentTaskName = this.childNodes[0].textContent; // childNodes[0] is the task name row

                                currentTaskID = this.childNodes[3].textContent; // childNodes[3] is the taskID hidden table value

                                currentIndexSelection = getTableIndexFromTaskID(currentTaskID);

                                // Fetch the tag which mentions the current 'Selection' and change the value to reflect the actual selection
                                
                                // If they don't exist, it returns null
                                var modifySelection = document.getElementById("selection"); // (for modify/delete options only)
                                var taskIDContainer = document.getElementById("taskID");

                                if (modifySelection != null){
                                    modifySelection.textContent = currentTaskName; // Only set the data if the relevant paragraph container exists
                                }

                                if (taskIDContainer != null){
                                    taskIDContainer.value = currentTaskID;
                                }

                            });
                        }

                        // Check if there are any tasks after the filter was applied

                        if (taskTableBody.rows.length == 0){  // No tasks visible

                            // Inject the 'No Tasks' preview again

                            taskTableBody.insertRow(); // Inject a row since there are none

                            // Inject cells in this new row
                            taskTableBody.rows[0].insertCell(0); 
                            taskTableBody.rows[0].insertCell(1);
                            taskTableBody.rows[0].insertCell(2);

                            // Inject the preview spanning across the entire table

                            taskTableBody.rows[0].cells[0].textContent = "N/A";
                            taskTableBody.rows[0].cells[1].textContent = "No tasks yet";
                            taskTableBody.rows[0].cells[2].textContent = "N/A";

                            taskTableBody.rows[0].setAttribute("id", "noTasks"); // Give ID of no Tasks 

                        }
                        
                    } else {
                        if (data == '"InvalidDates"'){

                            // Display the error to the user

                            message = document.getElementById("message");

                            message.textContent = "Error! Invalid dates provided";

                        } else if (data == '"InvalidDateRange"'){

                            // Display the error to the user

                            message = document.getElementById("message");

                            message.textContent = "Error! The start date should be before the end date";

                        }
                    }
                }
            )
    });

    // Clear all filters button logic
    document.getElementById("clearFilterButton").addEventListener("click", function(){

        // Reset All Filter Settings

        statusFilter = "Any Status";
        draftStatusFilter = "Any Status";
        document.getElementById("statusFilterSelection").textContent = "Any Status";

        nameFilter =  "";
        draftNameFilter = "";
        document.getElementById("nameFilter").value = "";


        dateStartFilter = "";
        draftDateStartFilter = "";
        document.getElementById("dateStartFilter").value = "";

        dateEndFilter = "";
        draftDateEndFilter = "";
        document.getElementById("dateEndFilter").value = "";

        fetch("../ajax/fetch-tasks.php", { // Send a fetch request to get all the tasks of the user

            "method": "POST", // // Specify that the data will be passed as POST

            "headers": {

                "Content-Type": "application/json; charset=utf8" // Specify the type of data that will be passed

            },

            "body": JSON.stringify( // Convert the JSON Object to a JSON string before passing

                // The actual data being passed [A JSON Object] - In this case, no data needs to be passed

                {

                }
            )
        }).then(function(response){ // Catch the response

            return response.text(); // Return the response

        }).then(function(data){ // // Fetch the result and pass it into data

            // The data passed is being checked with double quotations marks because it was passed as a JSON string

            if (data != '"Fail"'){ // Data recieved successfully

                parsedData = JSON.parse(data); // Convert JSON String to Object for handling

                // Since all tasks will be stripped first, reset selection
                currentIndexSelection = -1;
                currentTaskID = -1;
                currentTaskName = "[None]";

                taskTableBody = document.getElementById("taskTableBody"); // Get Table Body where injection will take place

                taskTableBody.textContent = ""; // Clear all Previous Entries

                for (index = 0; index != parsedData.length; index++){ // Iterate through all the tasks and inject them
                
                    newTableRow = taskTableBody.insertRow(-1); // Create a new row at the end where the injected task will be placed

                    // Put the row under the generic 'Task' to enable task functionality such as hover effects, etc..
                    newTableRow.classList.add("task");

                    // Create cells for the injected task's values
                    newTableRow.insertCell(0);
                    newTableRow.insertCell(1);
                    newTableRow.insertCell(2);
                    newTableRow.insertCell(3);

                    newTableRow.cells[0].textContent = parsedData[index]["taskName"]; // Inject Task Name

                    // Check If Deadline Is Set & Inject

                    if (parsedData[index]["taskDeadline"] == "0000-00-00"){

                        newTableRow.cells[1].textContent = "No Deadline";

                    } else {

                        newTableRow.cells[1].textContent = parsedData[index]["taskDeadline"];

                    }

                    // Check Status & Inject

                    if (parsedData[index]["pending"] == 1){

                        newTableRow.cells[2].textContent = "Pending";

                    } else {

                        newTableRow.cells[2].textContent = "Completed";

                    }

                    newTableRow.cells[3].textContent = parsedData[index]["taskID"]; // Inject Task ID

                    newTableRow.cells[3].style.display = "none"; // style.visibility = "hidden" is not used because it breaks the table alignment

                    // Add an event listener for this task which will enable 'Clicking it' like the other existing tasks.
                    newTableRow.addEventListener("click", function() { 

                        // Code which triggers with the 'click' event listener
                        
                        if (currentIndexSelection != -1){ // There was a previous selection

                            tasks = document.querySelectorAll(".task"); // Update the list of all tasks

                            tasks[currentIndexSelection].style.backgroundColor = null; // Reset previous selection's colour

                        }

                        this.style.backgroundColor = "red"; // Set current selection to red

                        currentTaskName = this.childNodes[0].textContent; // childNodes[0] is the task name row

                        currentTaskID = this.childNodes[3].textContent; // childNodes[3] is the taskID hidden table value

                        currentIndexSelection = getTableIndexFromTaskID(currentTaskID);

                        // Fetch the tag which mentions the current 'Selection' and change the value to reflect the actual selection
                        
                        // If they don't exist, it returns null
                        var modifySelection = document.getElementById("selection"); // (for modify/delete options only)
                        var taskIDContainer = document.getElementById("taskID");

                        if (modifySelection != null){
                            modifySelection.textContent = currentTaskName; // Only set the data if the relevant paragraph container exists
                        }

                        if (taskIDContainer != null){
                            taskIDContainer.value = currentTaskID;
                        }

                    });
                }
            }
        })   
    });
});