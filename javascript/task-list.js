document.addEventListener("DOMContentLoaded", () => {

    // Code which handles task selection

    var currentIndexSelection = -1; // Will store the current index of task to be modified if the modify task command is executed
    var currentTaskName = ""; // Will store the current selected task's name for display in the modify menu
    
    const tasks = document.querySelectorAll(".task"); // all the tasks, fetched throuh the class they share

    // Iterate through all the 'tasks' with foreach, also passing in the 'indexValue' of the current 'task' element
    tasks.forEach(function(task, indexValue) {  
        
        // Add an event listener for each task which will enable 'Clicking them'.
        task.addEventListener("click", function() { 

            // Code which triggers with the 'click' event listener

            currentTaskName = this.childNodes[1].textContent; // childNodes[1] is the first table row data index
            currentIndexSelection = indexValue;

            // Fetch the tag which mentions the current 'Selection' and change the value to reflect the actual selection

            var modifySelection = document.getElementById("selection"); // If it doesn't exist, it returns null

            if (modifySelection != null){
                modifySelection.innerHTML = currentTaskName; // Only set the data if the 'modifySelection' container exists
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
        menuContainer.innerHTML = templateToBeInjected.innerHTML;

        // The template to be set is either 'Modify' or 'Delete', which has the 'Selection' container showing current selection
        if (templateID == "modifyTaskMenuTemplate" || templateID == "deleteTaskMenuTemplate"){
            if (currentTaskName != ""){ // There is a valid selection right now

                // Fetch the container and add the current selection
                var modifySelection = document.getElementById("selection");
                modifySelection.innerHTML = currentTaskName;

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

});