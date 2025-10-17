document.addEventListener("DOMContentLoaded", () => {

    // Given a menuContainer ID & template ID, places the content of the template into the menuContainer
    function injectMenuToDiv(menuContainerID, templateID) {

        // Select Menu to Modify
        const menuContainer = document.querySelector("#" + menuContainerID); // # String concat to keep parameters consistent
        
        // Select Template To Inject
        const templateToBeInjected = document.getElementById(templateID);

        // Inject Template Into Menu
        menuContainer.innerHTML = templateToBeInjected.innerHTML;
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
    
    const tasks = document.getElementsByClassName("task"); // Select all tasks

    for (let i = 0; i < tasks.length; i++) {

        tasks[i].addEventListener("click", selectTask); // attach a click listener event to all tasks which enables 'Clicking' them

    }

    function selectTask(){
        alert("you have clicked a task!");
    }
});