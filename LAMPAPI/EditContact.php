<?php

    $inData = getRequestInfo();
    $ID             = $inData["ID"];
    $userID         = $inData["userID"];
    $newFirstName   = $inData["FirstName"];
    $newLastName    = $inData["LastName"];
    $newPhone       = $inData["Phone"];
    $newEmail       = $inData["Email"];

    // Connecting to the Database
    $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
    if ($conn->connect_error) returnWithError($conn->connect_error);

    else
    {
        $stmt = $conn->prepare
        (
            "UPDATE Contacts SET
            FirstName = ?,
            LastName = ?,
            Phone = ?,
            Email = ?
            WHERE ID = ? AND userID = ?");

        if (!$stmt)
        {
            returnWithError($conn->error);
            $conn->close();
            exit;
        }

        $stmt->bind_param("ssssii", $newFirstName, $newLastName, $newPhone, $newEmail, $ID, $userID);

        if ($stmt->execute()) returnWithSuccess("Successfully modified contact\n");
        else returnWithError("No contact found with ID and userID");

        $stmt->close();
        $conn->close();
    }

    function getRequestInfo()
    {
        return json_decode(file_get_contents('php://input'), true);
    }

    function sendResultInfoAsJson($obj)
    {
        header('Content-type: application/json');
        echo $obj;
    }

    function returnWithError($err)
    {
        $retValue = '{"error":"' . $err . '"}';
        sendResultInfoAsJson($retValue);
    }

    function returnWithSuccess($msg)
    {
        $retValue = '{"message":"' . $msg . '","error":""}';
        sendResultInfoAsJson($retValue);
    }
?>
