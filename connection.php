<?php

//connect to local mySQL server
$username = "root";
$conn = new mysqli("localhost", $username, "", "calendarproject");
$conn->set_charset("utf8mb4"); ?>