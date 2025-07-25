<?php
// connect to database
include "connection.php";

$successMsg = '';
$errorMsg = '';
$eventsFromDB = []; //initialize a new array to store the fetched events

// Handle Add Appointment
if ($_SERVER["REQUEST_METHOD"] === "POST" && ($_POST['action'] ?? '') === "add") {
    //i.e check if the method used in the form is post and if the post action is add (the default action value)
    $course      = trim($_POST["course_name"] ?? '');//if there is a value in form take it, else initialize it as empty
    $instructor  = trim($_POST["instructor_name"] ?? '');
    $start       = $_POST["start_date"] ?? '';
    $end         = $_POST["end_date"] ?? '';
    $startTime   = $_POST["start_time"] ?? '';
    $endTime     = $_POST["end_time"] ?? '';

    if ($course && $instructor && $start && $end && $startTime && $endTime) {//i.e if they are not empty
        $stmt = $conn->prepare(
            "INSERT INTO appointments (course_name, instructor_name, start_date, end_date, start_time, end_time) 
             VALUES (?, ?, ?, ?, ?, ?)"
        );
        $stmt->bind_param("ssssss", $course, $instructor, $start, $end, $startTime, $endTime);
        $stmt->execute();
        $stmt->close();

        header("Location: " . $_SERVER["PHP_SELF"] . "?success=1");//if the stmnt operation succeed we will send the submitted form data to the page itself with the success=1 parameter, instead of jumping to a different page
        exit;//it will exit out from the if statment
    } 

    else {
        header("Location: " . $_SERVER["PHP_SELF"] . "?error=1"); //the user will get error messages on the same page as the form.
        exit;
    }
}

// Edit Appointment
if ($_SERVER["REQUEST_METHOD"] === "POST" && ($_POST['action'] ?? '') === "edit") {
    $id          = $_POST["event_id"] ?? null; //because the event already exist in the db with a specific id
    $course      = trim($_POST["course_name"] ?? '');
    $instructor  = trim($_POST["instructor_name"] ?? '');
    $start       = $_POST["start_date"] ?? '';
    $end         = $_POST["end_date"] ?? '';
    $startTime   = $_POST["start_time"] ?? '';
    $endTime     = $_POST["end_time"] ?? '';

    if ($id && $course && $instructor && $start && $end && $startTime && $endTime) {
        $stmt = $conn->prepare(
            "UPDATE appointments SET course_name = ?, instructor_name = ?, start_date = ?, end_date = ?, start_time = ?, end_time = ? 
             WHERE id = ?"
        );
        $stmt->bind_param("ssssssi", $course, $instructor, $start, $end, $startTime, $endTime, $id);
        $stmt->execute();
        $stmt->close();

        header("Location: " . $_SERVER["PHP_SELF"] . "?success=2");
        exit;
    } else {
        header("Location: " . $_SERVER["PHP_SELF"] . "?error=2");
        exit;
    }
}

//Delete Appointment
if ($_SERVER["REQUEST_METHOD"] === "POST" && ($_POST['action'] ?? '') === "delete") {
    $id = $_POST["event_id"] ?? null;

    if ($id) {
        $stmt = $conn->prepare("DELETE FROM appointments WHERE id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $stmt->close();

        header("Location: " . $_SERVER["PHP_SELF"] . "?success=3");
        exit;
    }
}

// Success & Error Messages
if (isset($_GET["success"])) {
    $successMsg = match ($_GET["success"]) { // check if it matches any of these numbers
        '1' => "✅ Appointment added successfully",
        '2' => "✅ Appointment updated successfully",
        '3' => "🗑️ Appointment deleted successfully",
        default => ''
    };
}

if (isset($_GET["error"])) {
    $errorMsg = '❌ Something went wrong. Please check your inputs.';
}

//select (fetch) all appointments
$result = $conn->query("SELECT * FROM appointments");

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $start = new DateTime($row["start_date"]);//DateTime allows us to use many methods like format, difference, modify...
        $end   = new DateTime($row["end_date"]);

        while ($start <= $end) {
            $eventsFromDB[] = [
                "id"          => $row["id"],
                "title"       => "{$row['course_name']} - {$row['instructor_name']}",//use curly braces because it's the safest way to embed array values inside a double-quoted string. we can use (.) concatenation but { } is better
                "date"        => $start->format('Y-m-d'),//make the date appear in this format
                "start"       => $row["start_date"],
                "end"         => $row["end_date"],
                "start_time"  => $row["start_time"],
                "end_time"    => $row["end_time"],
            ];
            $start->modify('+1 day');// it increments the day by one. ex:if the day was 10 it will be 11 (it is like i++ in any loop)
        }
    }
}

$conn->close();

?>