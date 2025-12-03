// Global Variables
var currentIndexSelection = -1; // Will store the current taskID of task to be modified if the modify task command is executed
var currentTaskName = ""; // Will store the current selected task's name for display in the modify menu
var currentTaskID = -1; // Will store the database taskID
var modificationMenuChosenValue = "taskDescription"; // Will store the current modification dropdown menu selection (default is task desc)
var userTasks = returnUserTasks(); // Stores the current user tasks promise for autocomplete checking. Updates on taskName CRUD operations.
var currentGIFSelectionID = ""; // Will store the current GIF selected when assigning a GIF to a task
var allowedCharacters = "abcdefghijklmnopqrstuvwxyz1234567890- "; // Stores allowed characters - reject other characters to prevent any XSS attacks

document.addEventListener("DOMContentLoaded", () => {

    // Filters will be populated either through localstorage below or by being set by the user

    var statusFilter;
    var nameFilter;
    var dateStartFilter;
    var dateEndFilter;
    var draftStatusFilter;
    var draftNameFilter;
    var draftDateStartFilter;
    var draftDateEndFilter;

    // Button which listens for spawning the filter menu
    
    document.getElementById("filterToggleButton").addEventListener("click", function (){

        wrapperForMenu = document.getElementById("FilterMenuWrapper");

        if (wrapperForMenu.innerHTML != ""){ // There is content already - the user wants to hide the filter menu

            wrapperForMenu.innerHTML = ""; // Reset the content

        } else { // Spawn the content and attach all filter event listeners

            wrapperForMenu.innerHTML = ""; // Reset any previous menu already there

            injectMenuToDiv("FilterMenuWrapper", "filterContainerTemplate"); // Spawn in the actual filters

            // Check if there are saved filter settings saved in local storage

            // Status Filter Local Storage Check

            if (localStorage.getItem("statusFilter") != null){
                
                // There is a status filter saved!

                if (localStorage.getItem("statusFilter") == "completed"){

                    // Status filter is set to 'Completed'

                    document.getElementById("statusFilterType").value = "completedStatus"; // Update filter preview

                    statusFilter = "Completed Only";

                } else if (localStorage.getItem("statusFilter") == "pending"){

                    // Status filter is set to 'Pending'

                    document.getElementById("statusFilterType").value = "pendingStatus"; // Update filter preview

                    statusFilter = "Pending Only";

                } else {
                    
                    // Either it was set to 'any' or an unknown value - in both instances, set to Any

                    document.getElementById("statusFilterType").value = "anyStatus"; // Update filter preview

                    statusFilter = "Any Status";
                }

            } else {
                
                statusFilter = "Any Status"; // Set to any (default setting)

                document.getElementById("statusFilterType").value = "anyStatus"; // Update filter preview

            }

            // Name Filter Local Storage Check

            if (localStorage.getItem("nameFilter") != null){
                
                // There is a name filter saved!

                nameFilter = localStorage.getItem("nameFilter");

                document.getElementById("nameFilter").value = nameFilter;

            } else {
                
                nameFilter = ""; // Set to nothing (default)

                document.getElementById("nameFilter").value = nameFilter;

            }

            // Date Start Filter Local Storage Check

            if (localStorage.getItem("dateStartFilter") != null){
                
                // There is a date filter saved!

                dateStartFilter = localStorage.getItem("dateStartFilter");

                document.getElementById("dateStartFilter").value = dateStartFilter;

            } else {
                
                dateStartFilter = ""; // Set to nothing (default)

                document.getElementById("dateStartFilter").value = dateStartFilter;

            }

            // Date End Filter Local Storage Check

            if (localStorage.getItem("dateEndFilter") != null){
                
                // There is a date filter saved!

                dateEndFilter = localStorage.getItem("dateEndFilter");

                document.getElementById("dateEndFilter").value = dateEndFilter;

            } else {
                
                dateEndFilter = ""; // Set to nothing (default)

                document.getElementById("dateEndFilter").value = dateEndFilter;

            }

            // Will store changes from the actual filter which get 'published' to the actual global variable once filter is applied
            // This avoids relying on the input field form in real time for changes since the fields might be different than what was submitted
            draftStatusFilter = statusFilter;
            draftNameFilter = nameFilter;
            draftDateStartFilter = dateStartFilter;
            draftDateEndFilter = dateEndFilter;

            // ==================================================================================

            // Code that handles filters

            // =====================================

            // Filter Change Event Triggers To Update Global Variables & Previews

            // =====================================

            // Status Filter Logic

            document.getElementById("statusFilterType").addEventListener('change', function(){ // Add listener to handle filter dropdown change

                var statusFilterType = this.value;

                if (statusFilterType == "pendingStatus"){ // User dropdown selected 'Pending Only'

                    draftStatusFilter = "Pending Only"; // Temporary storage of the new status filter

                    // Save local storage
                    localStorage.setItem("statusFilter", "pending"); // Doesn't integrate with database so this is ideal

                } else if (statusFilterType == "completedStatus") { // User dropdown selected 'Completed Only'

                    draftStatusFilter = "Completed Only"; // Temporary storage of the new status filter

                    // Save local storage
                    localStorage.setItem("statusFilter", "completed"); // Doesn't integrate with database so this is ideal

                } else if (statusFilterType == "anyStatus"){ // User dropdown selected 'Any'

                    draftStatusFilter = "Any Status"; // Temporary storage of the new status filter

                    // Save local storage
                    localStorage.setItem("statusFilter", "any"); // Doesn't integrate with database so this is ideal

                }
            });

            // Name Filter

            document.getElementById("nameFilter").addEventListener("input", function(){

                // Output escaping is not required for filters because they are only being compared through PHP and not injected anywhere in HTML
                
                draftNameFilter = document.getElementById("nameFilter").value; // Temporary storage of the new name filter

                // Save local storage
                localStorage.setItem("nameFilter", draftNameFilter); // Doesn't integrate with database so this is ideal

                // =================================================
                // Code which handles autosuggestion
                // =================================================

                var dataListAutoSuggest = document.getElementById("autoSuggest"); // Fetch the datalist autosuggest word container
                        
                if (dataListAutoSuggest != null){ // check if there is an existing datalist

                    // datalist exists & needs to be deleted for it to be reset for the next autosuggest

                    dataListAutoSuggest.remove();

                }

                userTasks.then(data => { // After the promise 'userTasks' has been fullfilled, pass the task list data into 'data'

                    potentialAutoSuggestion = autocompleteSuggest(draftNameFilter, data); // See if there is any matches

                    if (potentialAutoSuggestion != "No-Suggestions"){

                        // There are suggestions!

                        var listWithoutExactMatches = [];

                        for (suggestIndex = 0; suggestIndex != potentialAutoSuggestion.length; suggestIndex++){

                            // Iterate through the auto suggestions and eliminate exact matches from the filter text

                            if (potentialAutoSuggestion[suggestIndex].toLowerCase() != draftNameFilter.toLowerCase()){

                                // Not an exact match, can push this to the list of autosuggestions to use
                                listWithoutExactMatches.push(potentialAutoSuggestion[suggestIndex]);

                            }

                        }

                        if (listWithoutExactMatches.length > 0){ // Check if there are any entries left after the exact matches check

                            // Create the datalist which will store the autosuggestion(s)
                            var dataListAutoSuggest = document.createElement("DATALIST");

                            // Set the ID of the datalist
                            dataListAutoSuggest.setAttribute("id", "autoSuggest");

                            // Attach the datalist to the name filter form
                            document.getElementById("nameFilterForm").appendChild(dataListAutoSuggest);

                            for (suggestIndex = 0; suggestIndex != listWithoutExactMatches.length; suggestIndex++){

                                // Iterate through the auto suggestions so we can add them all to the datalist

                                // Create the auto suggest option which will get injected inside of the datalist
                                var autoSuggestion = document.createElement("OPTION");

                                // Potential Suggestion(s) are safe from XSS attacks as all tasks were previously filtered / escaped

                                // Set the auto suggested task value
                                autoSuggestion.setAttribute("value", listWithoutExactMatches[suggestIndex]); 

                                // Inject the autosuggestion inside of the datalist
                                document.getElementById("autoSuggest").appendChild(autoSuggestion);

                            }

                        }

                    }

                });
                
            });

            // Date Start Filter

            document.getElementById("dateStartFilter").addEventListener("input", function(){

                // Output escaping is not required for filters because they are only being compared through PHP and not injected anywhere in HTML
                
                draftDateStartFilter = document.getElementById("dateStartFilter").value; // Temporary storage of the new date filter

                // Save local storage
                localStorage.setItem("dateStartFilter", draftDateStartFilter); // Doesn't integrate with database so this is ideal
            });

            // Date End Filter

            document.getElementById("dateEndFilter").addEventListener("input", function(){

                // Output escaping is not required for filters because they are only being compared through PHP and not injected anywhere in HTML
                
                draftDateEndFilter = document.getElementById("dateEndFilter").value; // Temporary storage of the new date filter

                // Save local storage
                localStorage.setItem("dateEndFilter", draftDateEndFilter); // Doesn't integrate with database so this is ideal

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

                            if (data != '"Fail"' && data != '"InvalidDates"' && data != '"InvalidDateRange"' && data != '"FormatFail"'){ // Filter Was A Success

                                // Since filter will be applied, reset selection
                                currentIndexSelection = -1;
                                currentTaskID = -1;
                                currentTaskName = "[None]";

                                var textAdditionalMenu = document.getElementById("contentWrapperTaskAdditionalMenu");

                                if (textAdditionalMenu != null){

                                    // Need to eliminate the additional task menu since the task was removed & selection cancelled

                                    textAdditionalMenu.remove();

                                }

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

                                        if (currentIndexSelection == getTableIndexFromTaskID(this.childNodes[3].textContent)){
                                            
                                            // Same task was clicked again
                                            
                                            spawnTaskAdditionalMenuPopup();

                                        }

                                        this.style.backgroundColor = "#73d41e"; // Set current selection to green

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

                                    taskTableBody.rows[0].cells[0].textContent = "N-A";
                                    taskTableBody.rows[0].cells[1].textContent = "No tasks yet";
                                    taskTableBody.rows[0].cells[2].textContent = "N-A";

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

                                } else if (data == '"FormatFail"'){

                                    message = document.getElementById("message");

                                    message.textContent = "Error! Invalid characters! Make sure you only include letters, numbers, and \"-\" symbol";

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
                document.getElementById("statusFilterType").value = "anyStatus";
                localStorage.setItem("statusFilter", "");

                nameFilter =  "";
                draftNameFilter = "";
                document.getElementById("nameFilter").value = "";
                localStorage.setItem("nameFilter", "");


                dateStartFilter = "";
                draftDateStartFilter = "";
                document.getElementById("dateStartFilter").value = "";
                localStorage.setItem("dateStartFilter", "");

                dateEndFilter = "";
                draftDateEndFilter = "";
                document.getElementById("dateEndFilter").value = "";
                localStorage.setItem("dateEndFilter", "");

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

                    if (data != '"Fail"' && data != '"FormatFail"'){ // Data recieved successfully

                        parsedData = JSON.parse(data); // Convert JSON String to Object for handling

                        // Since all tasks will be stripped first, reset selection
                        currentIndexSelection = -1;
                        currentTaskID = -1;
                        currentTaskName = "[None]";

                        var textAdditionalMenu = document.getElementById("contentWrapperTaskAdditionalMenu");

                        if (textAdditionalMenu != null){

                            // Need to eliminate the additional task menu since the task was removed & selection cancelled

                            textAdditionalMenu.remove();

                        }

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

                                if (currentIndexSelection == getTableIndexFromTaskID(this.childNodes[3].textContent)){
                                    
                                    // Same task was clicked again
                                            
                                    spawnTaskAdditionalMenuPopup();

                                }

                                this.style.backgroundColor = "#73d41e"; // Set current selection to green

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
                    } else {
                        if (data == '"FormatFail"'){

                            message = document.getElementById("message");

                            message.textContent = "Error! Invalid characters! Make sure you only include letters, numbers, and \"-\" symbol";

                        }
                    }
                })   
            });
        }

    });

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

            this.style.backgroundColor = "#73d41e"; // Set current selection to green

            if (currentIndexSelection == getTableIndexFromTaskID(this.childNodes[7].textContent)){
                // Same task was clicked again
                                            
                spawnTaskAdditionalMenuPopup();
            }

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

            // Validate the CSRF Token before anything else
                
            fetch("../ajax/validate-csrfToken.php", { // Send a fetch request where to send the data in for validation

                "method": "POST", // Specify that the data will be passed as POST

                "headers": {

                    "Content-Type": "application/json; charset=utf8" // Specify the type of data that will be passed

                },

                "body": JSON.stringify( // Convert the JSON Object to a JSON string before passing

                    // The actual data being passed [A JSON Object]

                    {
                        "csrfToken": document.getElementById("csrfToken").value,
                    }
                )
            }).then(function(response){ // Catch the response

                return response.text(); // Return the response

            }).then(function(csrfTokenData){ // Fetch the result and pass it into data

                if (csrfTokenData == "Valid"){ // Token is valid so we can proceed

                    // Fetch the data from the form
                    var taskName = document.getElementById("ftask").value;
                    var taskDate = document.getElementById("fdate").value;

                    if (taskName != ""){ // Task name is not blank which is good - can proceed

                        if (isValidInput(taskName) && isValidInput(taskDate)){

                            if (taskName.length <= 44){ // Character limit is not exceeded - can proceed

                                // Reset the values of the input fields prior to fetch call to prevent spamming the button
                                document.getElementById("ftask").value = "";
                                document.getElementById("fdate").value = "";

                                // Input was filtered & checked for invalid characters to prevent XSS attacks - no output escaping required

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

                                    } else if (data == "FormatFail"){

                                        message = document.getElementById("message");

                                        message.textContent = "Error! Invalid characters! Make sure you only include letters, numbers, \"-\" symbol and spaces";

                                    } else if (data == "LengthFail"){

                                        message = document.getElementById("message");

                                        message.textContent = "Error! Task name has exceeded character limit! Make sure it is 44 characters or less";
                                    
                                    } else {

                                        message.textContent = "Task has been added!";

                                        userTasks = returnUserTasks(); // Update autosuggest list since an add operation was passed.

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

                                                if (dataFilter == "FormatFail"){

                                                    message = document.getElementById("message");

                                                    message.textContent = "Error! Invalid characters! Make sure you only include letters, numbers, and \"-\" symbol";

                                                } else if (dataFilter){

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

                                                        this.style.backgroundColor = "#73d41e"; // Set current selection to green

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
                                    }
                                })

                            } else { // Character input limit of 44 was exceeded

                                message = document.getElementById("message");

                                message.textContent = "Error! Task name has exceeded character limit! Make sure it is 44 characters or less";

                            }

                            

                        } else { // Invalid characters were inputted

                            message = document.getElementById("message");

                            message.textContent = "Error! Invalid characters! Make sure you only include letters, numbers, and \"-\" symbol";
                            
                        }
                        
                    } else { // Task name is blank
                        message = document.getElementById("message");

                        message.textContent = "Error! Task name cannot be blank!";
                    }
                }
            });
        });
    });

    // Modify Task Logic
    document.getElementById("modifyTask").addEventListener("click", function(){

        modificationMenuChosenValue = "taskDescription"; // When the 'Modify' button is pressed, it goes back to the default menu
        
        // Any submit form currently loaded (only 1 at a time is loaded) has the respective event listener attached
        document.getElementById("submitForm").addEventListener("submit", function(buttonEvent){

            buttonEvent.preventDefault(); // Prevent the button from automatically redirecting

            // Validate the CSRF Token before anything else
                
            fetch("../ajax/validate-csrfToken.php", { // Send a fetch request where to send the data in for validation

                "method": "POST", // Specify that the data will be passed as POST

                "headers": {

                    "Content-Type": "application/json; charset=utf8" // Specify the type of data that will be passed

                },

                "body": JSON.stringify( // Convert the JSON Object to a JSON string before passing

                    // The actual data being passed [A JSON Object]

                    {
                        "csrfToken": document.getElementById("csrfToken").value,
                    }
                )
            }).then(function(response){ // Catch the response

                return response.text(); // Return the response

            }).then(function(csrfTokenData){ // Fetch the result and pass it into data

                if (csrfTokenData == "Valid"){ // Token is valid so we can proceed
                    
                    // Check on the modification request submitted and act accordingly

                    if (modificationMenuChosenValue == "taskDescription"){  // The submit form was for task name change

                        // Fetch the data from the form
                        var newTaskName = document.getElementById("taskDescription").value;

                        if (newTaskName != "" && currentTaskID != -1){ // The provided task name is not blank, we can proceed

                            if (isValidInput(newTaskName) && isValidInput(currentTaskID)){

                                if (newTaskName.length <= 44){ // Does not exceed character length limit

                                    // Reset the value of the input field prior to fetch request to prevent submit button spamming

                                    document.getElementById("taskDescription").value = "";

                                    // Input was filtered & checked for invalid characters to prevent XSS attacks - no output escaping required

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

                                        if (data == "LengthFail"){

                                            message = document.getElementById("message");

                                            message.textContent = "Error! Task name has exceeded character limit! Make sure it is 44 characters or less";
                                        
                                        } else if (data =="FormatFail"){

                                            message = document.getElementById("message");

                                            message.textContent = "Error! Invalid characters! Make sure you only include letters, numbers, and \"-\" symbol";

                                        } else if (data == "Success"){

                                            message = document.getElementById("message");

                                            message.textContent = "Sucess! Task name has been modified!";

                                            userTasks = returnUserTasks(); // Update autosuggest list since an update operation was passed.

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
                                                        "taskDate": "N-A", // Not Needed For Check
                                                        "taskStatus": "N-A", // Not Needed For Check
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

                                                    if (dataFilter == "FormatFail"){

                                                        message = document.getElementById("message");

                                                        message.textContent = "Error! Invalid characters! Make sure you only include letters, numbers, and \"-\" symbol";

                                                    } else if (dataFilter){

                                                        // Matches current filter - can update the task
                                                        
                                                        // Update task name without refreshing the page

                                                        taskTableBody = document.getElementById("taskTableBody"); // Get Table Body where injection will take place

                                                        taskIndex = getTableIndexFromTaskID(currentTaskID);

                                                        taskTableBody.rows[taskIndex].cells[0].textContent = newTaskName; // Inject the new task name

                                                        document.getElementById("selection").textContent = newTaskName; // Update the task name in the selection preview
                    
                                                        currentTaskName = newTaskName; // Update the current selection name information

                                                    } else {

                                                        // No Longer matches the task name filter criteria - delete the task

                                                        taskTableBody = document.getElementById("taskTableBody"); // Get Table Body where injection will take place

                                                        taskIndex = getTableIndexFromTaskID(currentTaskID);

                                                        taskTableBody.deleteRow(taskIndex); // Delete the actual row

                                                        // Reset the selection since the selection was removed
                                                        currentIndexSelection = -1;
                                                        currentTaskID = -1;
                                                        currentTaskName = "[None]";
                                                        
                                                        var textAdditionalMenu = document.getElementById("contentWrapperTaskAdditionalMenu");

                                                        if (textAdditionalMenu != null){

                                                            // Need to eliminate the additional task menu since the task was removed & selection cancelled

                                                            textAdditionalMenu.remove();

                                                        }
                                                        
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

                                                            taskTableBody.rows[0].cells[0].textContent = "N-A";
                                                            taskTableBody.rows[0].cells[1].textContent = "No tasks yet";
                                                            taskTableBody.rows[0].cells[2].textContent = "N-A";

                                                            taskTableBody.rows[0].setAttribute("id", "noTasks"); // Give ID of no Tasks 

                                                        }

                                                    }
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

                                } else {

                                    message = document.getElementById("message");

                                    message.textContent = "Error! Task name has exceeded character limit! Make sure it is 44 characters or less";

                                }

                            } else {

                                message = document.getElementById("message");

                                message.textContent = "Error! Invalid characters! Make sure you only include letters, numbers, and \"-\" symbol";
                            }



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

                            if (isValidInput(newDate)){

                                // Input was filtered & checked for invalid characters to prevent XSS attacks - no output escaping required

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

                                    } else if (data == "FormatFail"){

                                        message = document.getElementById("message");

                                        message.textContent = "Error! Invalid characters! Make sure you only include letters, numbers, and \"-\" symbol";

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
                                                    "taskName": "N-A", // Not Needed For Check
                                                    "taskDate": newDate,
                                                    "taskStatus": "N-A", // Not Needed For Check
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

                                                if (dataFilter == "FormatFail"){

                                                    message = document.getElementById("message");

                                                    message.textContent = "Error! Invalid characters! Make sure you only include letters, numbers, and \"-\" symbol";
                                                    
                                                } else if (dataFilter){

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

                                                    var textAdditionalMenu = document.getElementById("contentWrapperTaskAdditionalMenu");

                                                    if (textAdditionalMenu != null){

                                                        // Need to eliminate the additional task menu since the task was removed & selection cancelled

                                                        textAdditionalMenu.remove();

                                                    }
                                                    
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

                                                        taskTableBody.rows[0].cells[0].textContent = "N-A";
                                                        taskTableBody.rows[0].cells[1].textContent = "No tasks yet";
                                                        taskTableBody.rows[0].cells[2].textContent = "N-A";

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

                            } else {

                                message = document.getElementById("message");

                                message.textContent = "Error! Invalid characters! Make sure you only include letters, numbers, and \"-\" symbol";

                            }

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

                                } else if (data == "FormatFail"){

                                    message = document.getElementById("message");

                                    message.textContent = "Error! Invalid characters! Make sure you only include letters, numbers, and \"-\" symbol";

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
                                                "taskName": "N-A", // Not Needed For Check
                                                "taskDate": "N-A", // Not Needed For Check
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

                                            if (dataFilter == "FormatFail"){

                                                message = document.getElementById("message");

                                                message.textContent = "Error! Invalid characters! Make sure you only include letters, numbers, and \"-\" symbol";

                                            } else if (dataFilter){

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

                                                var textAdditionalMenu = document.getElementById("contentWrapperTaskAdditionalMenu");

                                                if (textAdditionalMenu != null){

                                                    // Need to eliminate the additional task menu since the task was removed & selection cancelled

                                                    textAdditionalMenu.remove();

                                                }
                                                
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

                                                    taskTableBody.rows[0].cells[0].textContent = "N-A";
                                                    taskTableBody.rows[0].cells[1].textContent = "No tasks yet";
                                                    taskTableBody.rows[0].cells[2].textContent = "N-A";

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
                                                "taskName": "N-A", // Not Needed For Check
                                                "taskDate": "N-A", // Not Needed For Check
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

                                            if (dataFilter == "FormatFail"){

                                                message = document.getElementById("message");

                                                message.textContent = "Error! Invalid characters! Make sure you only include letters, numbers, and \"-\" symbol";

                                            } else if (dataFilter){

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

                                                var textAdditionalMenu = document.getElementById("contentWrapperTaskAdditionalMenu");

                                                if (textAdditionalMenu != null){

                                                    // Need to eliminate the additional task menu since the task was removed & selection cancelled

                                                    textAdditionalMenu.remove();

                                                }
                                                
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

                                                    taskTableBody.rows[0].cells[0].textContent = "N-A";
                                                    taskTableBody.rows[0].cells[1].textContent = "No tasks yet";
                                                    taskTableBody.rows[0].cells[2].textContent = "N-A";

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
                }
            });
        });
    });

    // Delete Task Logic
    document.getElementById("deleteTask").addEventListener("click", function(){
        // Any submit form currently loaded (only 1 at a time is loaded) has the respective event listener attached
        document.getElementById("submitForm").addEventListener("submit", function(buttonEvent){

            buttonEvent.preventDefault(); // Prevent the button from automatically redirecting

            // Validate the CSRF Token before anything else
                
            fetch("../ajax/validate-csrfToken.php", { // Send a fetch request where to send the data in for validation

                "method": "POST", // Specify that the data will be passed as POST

                "headers": {

                    "Content-Type": "application/json; charset=utf8" // Specify the type of data that will be passed

                },

                "body": JSON.stringify( // Convert the JSON Object to a JSON string before passing

                    // The actual data being passed [A JSON Object]

                    {
                        "csrfToken": document.getElementById("csrfToken").value,
                    }
                )
            }).then(function(response){ // Catch the response

                return response.text(); // Return the response

            }).then(function(csrfTokenData){ // Fetch the result and pass it into data

                if (csrfTokenData == "Valid"){ // Token is valid so we can proceed
                    
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

                            } else if (data == "FormatFail"){

                                message = document.getElementById("message");

                                message.textContent = "Error! Invalid characters! Make sure you only include letters, numbers, and \"-\" symbol";

                            } else if (data == "Success"){

                                message = document.getElementById("message");

                                message.textContent = "Task has been successfully deleted!";

                                userTasks = returnUserTasks(); // Update autosuggest list since a delete operation was passed.

                                // Update to show deleted task without refreshing the page

                                taskTableBody = document.getElementById("taskTableBody"); // Get Table Body where deletion will take place

                                taskIndex = getTableIndexFromTaskID(currentTaskID);

                                taskTableBody.deleteRow(taskIndex); // Delete the actual row

                                // Reset the selection since the selection was removed
                                currentIndexSelection = -1;
                                currentTaskID = -1;
                                currentTaskName = "[None]";

                                var textAdditionalMenu = document.getElementById("contentWrapperTaskAdditionalMenu");

                                if (textAdditionalMenu != null){

                                    // Need to eliminate the additional task menu since the task was removed & selection cancelled

                                    textAdditionalMenu.remove();

                                }
                                
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

                                    taskTableBody.rows[0].cells[0].textContent = "N-A";
                                    taskTableBody.rows[0].cells[1].textContent = "No tasks yet";
                                    taskTableBody.rows[0].cells[2].textContent = "N-A";

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
                }
            });
        });
    });
});

// Checks if an input respects the allowedCharacters criteria -> Input filtering + Output Escaping two-in-one function
// (rejects special characters)

function isValidInput(input){

    var characterAllowed = false;

    for (x = 0; x != input.length; x++){ // Iterate through input characters

        for (y = 0; y != allowedCharacters.length; y++){ // Iterate through allowed characters

            if (input[x].toLowerCase() == allowedCharacters[y]){
                
                characterAllowed = true; // Character is allowed

                break; // Escape the loop

            }

        }

        if (characterAllowed){ // Character was allowed

            characterAllowed = false; // Reset character for next check

        } else {

            return false; // Character was not allowed - reject the string for this reason
            
        }
    }

    return true; // No disallowed characters were spotted - accept the input

}

// A function that returns the user's current task list data without any filters.
// This can then be passed unto autocompleteSuggest function to avoid fetching the database content for each input

function returnUserTasks(){

    // Return the fetch request which gives a promise to the variable recieving it

    return fetch("../ajax/fetch-tasks.php", { // Send a fetch request to get all the tasks of the user

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

    }).then(function(data){ // Fetch the result and pass it into data

        if (data != '"Fail"' && data != '"FormatFail"'){ // Data recieved successfully

            parsedData = JSON.parse(data); // Convert JSON String to Object for handling

            return parsedData; // return the retrieved data

        } else {

            return "Failure"; // Failed to retrieve task data

        }

        // The data passed is being checked with double quotations marks because it was passed as a JSON string
  
    })
}

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

// A function that uses the user's current task list data to see name matches. If there is only one match,
// it returns the result to the caller, so that autosuggestion is recommended in the form
function autocompleteSuggest(queryInput, listOfTaskNames){

    var matchedData = []; // To store all matches
    var matchCounter = 0; // To check if there was at least one match

    if (listOfTaskNames == "Failure"){

        return "No-Suggestions" // There are no suggestions because the list data is invalid

    } else {

        // List data is valid - check how many matches there are available

        for (i = 0; i != listOfTaskNames.length; i++){ // Iterate through the list of task names

            currentTaskNameAutoSuggest = listOfTaskNames[i]["taskName"];

            // Check if the user query is part of the task name
            if (currentTaskNameAutoSuggest.toLowerCase().includes(queryInput.toLowerCase())){

                if (!matchedData.includes(currentTaskNameAutoSuggest.toLowerCase())){

                    // There isn't already an entry with that exact name being auto suggested
                    // [Task names are not unique]

                    matchedData.push(currentTaskNameAutoSuggest.toLowerCase()); // Put the matching query inside the array container

                    matchCounter++; // Iterate the number of matches found

                }

            }

        }

        if (matchCounter > 0){

            // There is at least one match - can return them!

            return matchedData;

        } else {

            return "No-Suggestions" // There are no suggestions because there are no matches

        }

    }
    
}

function spawnTaskAdditionalMenuPopup(){
    currentGIFSelectionID = ""; // Reset the current selected GIF since the menu was changed

    // Spawn the template
    injectMenuToDiv("popupScreenDiv", "taskAdditionalMenuPopup");

    // Update the task name
    document.getElementById("taskAdditionalMenu-TaskName").textContent = currentTaskName;

    // Attach an event listener on the background area of the popup so that when the user clicks out of it,
    // They exit the popup
    document.getElementById("popupScreen").addEventListener("click", function (){

        document.getElementById("popupScreenDiv").innerHTML = "";

    });

    // Send a fetch request to the database to check if there is already a GIF set & update the GIF if so

    fetch("../ajax/fetch-task-giphy-url.php", {

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

    }).then(function(giphyGifURLData){ // Fetch the result and pass it into data

        if (giphyGifURLData != "NotSet" && giphyGifURLData != "AuthFailure" && giphyGifURLData != "FormatFail" && giphyGifURLData != "Fail"){

            // If the above error codes were not the case, it means that a URL exists in the database

            // Set this GIF in the menu:

            // Create the image element (GIF container)
            imageTagToInjectForTask = document.createElement("img");

            // Set the source to be the valid GIFY url from the database
            imageTagToInjectForTask.src = giphyGifURLData;

            // Select the Div To Inject The GIF Into
            GIFContainer = document.getElementById("taskGIF");

            if (GIFContainer != null){
                
                // GIF container was not deleted before this took place

                GIFContainer.innerHTML = ""; // Remove the previous HTML (such as the text ["None"]) from the container

                // Actual GIF Injection
                GIFContainer.appendChild(imageTagToInjectForTask);

            }

        }
    })

    // Send a fetch request to the database to check if there is already additional information text set & update if so

    fetch("../ajax/fetch-additional-text.php", {

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

    }).then(function(additionalTextData){ // Fetch the result and pass it into data

        if (additionalTextData != "NotSet" && additionalTextData != "AuthFailure" && additionalTextData != "FormatFail" && additionalTextData != "Fail"){

            // If the above error codes were not the case, it means that additional text exists in the database

            // Set the additional text

            additionalInformationText = document.getElementById("additionalInformationText");

            if (additionalInformationText != null){

                // It exists (was not erased before the text was populated)

                additionalInformationText.value = additionalTextData;

            }

        }
    })

    var lastSearch = ""; // Will store the last GIPHY search to prevent calling the API again if the query is the same

    // Listen for the button press to search for a GIF
    document.getElementById("submitGIFSearch").addEventListener("click", function(){

        // Button has been pressed

        searchField = document.getElementById("GIFSearchField");

        searchFieldText = searchField.value; // Fetch the query to search

        if (searchFieldText != ""){ // Check if the query is empty

            // Query is not empty - can proceed

            if (isValidInput(searchFieldText)){ // Check if the query only contains letters and numbers

                // Input is valid  - can proceed

                if (searchFieldText.length <= 32){

                    // Does not exceed character limit - can proceed

                    if (lastSearch != searchFieldText) // Different query - can proceed

                        lastSearch = searchFieldText; // Update the last query
                        
                        // API request parameters

                        key = "giphy_secret_key_goes_here"; // This is a development key - in prod, there isn't a rate limit
                        query = searchFieldText;
                        limit = 25;
                        offset = 0;
                        rating = "g";
                        lang = "en";
                        bundle = "messaging_non_clips";

                        // Construct the API URL with the above parameters
                        requestURL = "https://api.giphy.com/v1/gifs/search?api_key=" + key + "&q=" + query + "&limit=" + limit + "&offset=" + offset + "&rating=" + rating + "&lang=" + lang + "&bundle=" + bundle;

                        fetch(requestURL)
                        .then(response => response.json())
                        .then(giphyData =>  {

                            resultsReturned = giphyData.data.length;
                            
                            validGIFs = [];

                            if (resultsReturned > 0){

                                // We have results from GIPHY!

                                for (gifIndex = 0; gifIndex != resultsReturned; gifIndex ++){

                                    // Iterate through the results

                                    // We will only fetch GIFs with the parameter of a fixed height of 100 px

                                    resultWidth = giphyData.data[gifIndex].images.fixed_height_small.width;

                                    if (resultWidth == 100){

                                        // Only accept results with a width also equal to 100 to keep images consistent in size

                                        // Add the GIF to the list of valid GIFs
                                        validGIFs.push(giphyData.data[gifIndex].images.fixed_height_small);

                                    }

                                }

                                if (validGIFs.length > 0){ // Recheck if there are any GIFs left after filtering

                                    // There are still GIFs left after filtering! Can Proceed

                                    currentGIFSelectionID = ""; // Reset Selection

                                    for (gifDeletionIndex = 0; gifDeletionIndex != 2; gifDeletionIndex++){
                                        
                                        // Iterate through the existing DIVs and eliminate any content

                                        divIDName = "GIF" + (gifDeletionIndex+1) + "_Preview";

                                        document.getElementById(divIDName).innerHTML = ""; // Clear the DIV

                                    }

                                    // One Or Two GIFs are Available

                                    if (validGIFs.length >= 2){

                                        // Expand the size of the white screen background for the GIF previews

                                        document.getElementById("whiteScreen").style.paddingBottom = "264px";

                                        // Iterate through two GIFs

                                        for (gifInjectionIndex = 0; gifInjectionIndex != 2; gifInjectionIndex++){

                                            // Iterate code to inject GIFs

                                            // Select the Div To Inject The GIF Into
                                            divToInject = document.getElementById("GIF" + (gifInjectionIndex+1) + "_Preview");

                                            // Create the image element (GIF container)
                                            imageToInject = document.createElement("img");

                                            // Set the source to be the valid GIFY url which we filtered through
                                            imageToInject.src = validGIFs[gifInjectionIndex].url;

                                            imageToInject.id = "GIF" + (gifInjectionIndex+1); // Set Image ID to identify it

                                            divToInject.appendChild(imageToInject); // Actual GIF Injection

                                            // Attach an event listener to the GIF to know what the current selection is
                                            imageToInject.addEventListener("click", function() {

                                                currentGIFSelectionID = this.id; // Set the current selection

                                                // Reset any border selections

                                                GIF1 = document.getElementById("GIF1");
                                                GIF2 = document.getElementById("GIF2");

                                                if (GIF1 != null){
                                                    // GIF1 Exists - Clear Border
                                                    GIF1.style.border = "none";
                                                }
                                                if (GIF2 != null){
                                                    // GIF2 Exists - Clear Border
                                                    GIF2.style.border = "none";
                                                }

                                                // Set the current selection's border

                                                this.style.border = "solid";

                                            });

                                        }

                                    } else if (validGIFs.length == 1) {

                                        // Expand the size of the white screen background for the GIF previews

                                        document.getElementById("whiteScreen").style.paddingBottom = "164px";

                                        // Add only one GIF

                                        // Select the Div To Inject The GIF Into
                                        divToInject = document.getElementById("GIF1_Preview");

                                        // Create the image element (GIF container)
                                        imageToInject = document.createElement("img");

                                        // Set the source to be the valid GIFY url which we filtered through
                                        imageToInject.src = validGIFs[0].url;

                                        imageToInject.id = "GIF1"; // Set Image ID to identify it

                                        divToInject.appendChild(imageToInject); // Actual GIF Injection

                                        // Attach an event listener to the GIF to know what the current selection is
                                        imageToInject.addEventListener("click", function() {

                                            currentGIFSelectionID = this.id; // Set the current selection

                                            // Reset any border selections

                                            GIF1 = document.getElementById("GIF1");
                                            GIF2 = document.getElementById("GIF2");

                                            if (GIF1 != null){
                                                // GIF1 Exists - Clear Border
                                                GIF1.style.border = "none";
                                            }
                                            if (GIF2 != null){
                                                // GIF2 Exists - Clear Border
                                                GIF2.style.border = "none";
                                            }

                                            // Set the current selection's border

                                            this.style.border = "solid";

                                        });

                                    }
                                    
                                    // GIFs were Injected - Now Inject The Rest Of The Menu

                                    injectMenuToDiv("gifSubmissionContainerText", "gifSubmissionContainerTextTemplate");
                                    injectMenuToDiv("gifSubmissionContainerButton", "gifSubmissionContainerButtonTemplate");

                                    // Listen to the 'Confirm GIF' button
                                    document.getElementById("ConfirmGIF").addEventListener("click", function(){

                                        // Confirm GIF button was pressed

                                        // Validate the CSRF Token before anything else

                                        fetch("../ajax/validate-csrfToken.php", { // Send a fetch request where to send the data in for validation

                                            "method": "POST", // Specify that the data will be passed as POST

                                            "headers": {

                                                "Content-Type": "application/json; charset=utf8" // Specify the type of data that will be passed

                                            },

                                            "body": JSON.stringify( // Convert the JSON Object to a JSON string before passing

                                                // The actual data being passed [A JSON Object]

                                                {
                                                    "csrfToken": document.getElementById("csrfToken").value,
                                                }
                                            )
                                        }).then(function(response){ // Catch the response

                                            return response.text(); // Return the response

                                        }).then(function(csrfTokenData){ // Fetch the result and pass it into data

                                            if (csrfTokenData == "Valid"){ // Token is valid so we can proceed

                                                if (currentGIFSelectionID != ""){
                                                
                                                    numberOfGIF = currentGIFSelectionID[3]; // Fetch the number of the GIF to spawn

                                                    gifURL = validGIFs[numberOfGIF-1].url; // Fetch the URL of the selected GIF

                                                    // Select the Div To Inject The GIF Into
                                                    taskGIFContainer = document.getElementById("taskGIF");

                                                    // Reset Previous Selection
                                                    taskGIFContainer.innerHTML = "";

                                                    // Create the image element (GIF container)
                                                    imageToInjectForTask = document.createElement("img");

                                                    // Set the source to be the valid GIFY url which is selected
                                                    imageToInjectForTask.src = gifURL;

                                                    taskGIFContainer.appendChild(imageToInjectForTask); // Actual GIF Injection

                                                    // Clear Out GIF Selection Menu Now That GIF Was Set
                                                    document.getElementById("GIF1_Preview").innerHTML = "";
                                                    document.getElementById("GIF2_Preview").innerHTML = "";
                                                    document.getElementById("gifSubmissionContainerText").innerHTML = "";
                                                    document.getElementById("gifSubmissionContainerButton").innerHTML = "";
                                                    GIFSearchField.value = "";

                                                    // Reset Selection
                                                    currentGIFSelectionID = "";

                                                    // Send an ajax request to update the database & see the result

                                                    fetch("../ajax/set-task-giphy-url.php", { // Send a fetch request where to send the data in for modification

                                                        "method": "POST", // Specify that the data will be passed as POST

                                                        "headers": {

                                                            "Content-Type": "application/json; charset=utf8" // Specify the type of data that will be passed

                                                        },

                                                        "body": JSON.stringify( // Convert the JSON Object to a JSON string before passing

                                                            // The actual data being passed [A JSON Object]

                                                            {
                                                                "taskID": currentTaskID,
                                                                "url": gifURL
                                                            }
                                                        )
                                                    }).then(function(response){ // Catch the response

                                                        return response.text(); // Return the response

                                                    }).then(function(giphyFetchData){ // Fetch the result and pass it into data

                                                        if (giphyFetchData != "Success"){

                                                            message = document.getElementById("message");

                                                            message.textContent = "An unexpected error has occured! GIF not saved to database";

                                                        } else if (giphyFetchData == "Success"){

                                                            // Inform The User That The GIF Was Set

                                                            messageAdditionalMenu = document.getElementById("messageAdditionalMenu");

                                                            messageAdditionalMenu.textContent = "GIF Has Been Set!";

                                                            // Reset whiteScreen expanded size
                                                            document.getElementById("whiteScreen").style.paddingBottom = "0px";
                                                        }
                                                    })

                                                } else {

                                                    // There is currently no GIF selected

                                                    messageAdditionalMenu = document.getElementById("messageAdditionalMenu");

                                                    messageAdditionalMenu.textContent = "Error! No GIF Selected!";

                                                }
                                            }
                                        });
                                    });

                                } else {

                                    // No GIFs remain after filtering

                                    messageAdditionalMenu = document.getElementById("messageAdditionalMenu");

                                    messageAdditionalMenu.textContent = "Error! No GIFs have been found!";

                                }

                            } else {

                                // No GIFs Available

                                messageAdditionalMenu = document.getElementById("messageAdditionalMenu");

                                messageAdditionalMenu.textContent = "Error! No GIFs have been found!";
                            }
                        })

                } else {

                    // Exceeds Character Limit

                    messageAdditionalMenu = document.getElementById("messageAdditionalMenu");

                    messageAdditionalMenu.textContent = "Error! Character limit exceeded! Make sure it doesn't exceed 32 characters!";

                }

            } else {

                // Invalid characters - reject

                messageAdditionalMenu = document.getElementById("messageAdditionalMenu");

                messageAdditionalMenu.textContent = "Error! Invalid characters! Only include letters, numbers, \"-\" symbol and spaces!";

            }

        } else {

            // Query is empty - reject

            messageAdditionalMenu = document.getElementById("messageAdditionalMenu");

            messageAdditionalMenu.textContent = "Error! GIF Search Query is empty!" + searchFieldText;

        }

    });

    // Attach an event listener to the textarea for user input
    document.getElementById("additionalInformationText").addEventListener("input", function (){

        // Current Text
        textAreaText = document.getElementById("additionalInformationText").value;

        truncatedtextAreaText = textAreaText.substring(0, 176); // Truncate up to database limit (176 characters)

        newTextToSet = ""; // Will be constructed according to allowed characters

        for (characterIndex = 0; characterIndex != truncatedtextAreaText.length; characterIndex++){

            // Iterate through each character in the textArea's Text

            for (validCharacterIndex = 0; validCharacterIndex != allowedCharacters.length; validCharacterIndex++){

                // Iterate through each allowed character

                if (allowedCharacters[validCharacterIndex].toLowerCase() == truncatedtextAreaText[characterIndex].toLowerCase()){

                    // The current character in the iteration was matched with an allowed character

                    newTextToSet += truncatedtextAreaText[characterIndex] // Allow this character

                }

            }

        }

        // Set the value of the textarea to be the filtered text
        document.getElementById("additionalInformationText").value = newTextToSet
        
    });

    // Attach an event listener to the textarea when they finish typing to it and the text is different

    document.getElementById("additionalInformationText").addEventListener("change", function (){

        // Update the database now that the user finished typing

        // Send an ajax request to update the database & see the result

        fetch("../ajax/set-additional-text.php", { // Send a fetch request where to send the data in for modification

            "method": "POST", // Specify that the data will be passed as POST

            "headers": {

                "Content-Type": "application/json; charset=utf8" // Specify the type of data that will be passed

            },

            "body": JSON.stringify( // Convert the JSON Object to a JSON string before passing

                // The actual data being passed [A JSON Object]

                {
                    "taskID": currentTaskID,
                    "textAreaInput": document.getElementById("additionalInformationText").value
                }
            )
        }).then(function(response){ // Catch the response

            return response.text(); // Return the response

        }).then(function(giphyFetchData){ // Fetch the result and pass it into data

            if (giphyFetchData != "Success"){

                message = document.getElementById("message");

                message.textContent = "An unexpected error has occured! 'Additional Information' not saved to database";

            } else if (giphyFetchData == "Success"){

                // Inform The User That The GIF Was Set

                messageAdditionalMenu = document.getElementById("messageAdditionalMenu");

                messageAdditionalMenu.textContent = "'Additional Information' has been updated!";
            }
        })

    });
}