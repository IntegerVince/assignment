document.addEventListener("DOMContentLoaded", () => {
    // Event listeners for buttons
    document.getElementById("addTask").addEventListener("click", addTaskMenuInjector);

    function addTaskMenuInjector() {
    alert("Clicked");
    }   
});