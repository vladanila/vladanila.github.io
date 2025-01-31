// Function to toggle between light and dark mode
function toggleMode() {
    const body = document.body;
    const modeButton = document.getElementById("mode-toggle");

    if (body.classList.contains("light-mode")) {
        body.classList.remove("light-mode");
        body.classList.add("dark-mode");
        modeButton.textContent = "🌞"; // Change button text to Sun emoji for Light mode
    } else {
        body.classList.remove("dark-mode");
        body.classList.add("light-mode");
        modeButton.textContent = "🌙"; // Change button text to Moon emoji for Dark mode
    }
}
