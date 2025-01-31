/* Default Light Mode */
body {
    font-family: Arial, sans-serif;
    text-align: center;
    background-color: white;
    color: black;
    transition: background 0.3s, color 0.3s;
}

button {
    padding: 10px;
    margin: 10px;
    cursor: pointer;
}

#theme-toggle {
    position: absolute;
    top: 10px;
    right: 10px;
    padding: 8px 12px;
    border: none;
    background-color: gray;
    color: white;
    font-size: 16px;
    border-radius: 5px;
}

/* Dark Mode */
body.dark-mode {
    background-color: #121212;
    color: white;
}

body.dark-mode #theme-toggle {
    background-color: yellow;
    color: black;
}
