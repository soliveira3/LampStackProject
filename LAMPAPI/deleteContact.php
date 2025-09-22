<?php
    $inData = getRequestInfo();

    $userId    = isset($inData["userId"]) ? $inData["userId"] : null;
    $contactId = isset($inData["contactId"]) ? $inData["contactId"] : null;

    if ($userId === null || $contactId === null) {
        returnWithError("Missing required fields: userId and contactId");
        exit;
    }

    // Connect to DB
    $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
    if ($conn->connect_error)
    {
        returnWithError($conn->connect_error);
        exit;
    }

    $stmt = $conn->prepare("DELETE FROM Contacts WHERE ID = ? AND UserID = ?");
    if (!$stmt)
    {
        returnWithError($conn->error);
        $conn->close();
        exit;
    }

    $stmt->bind_param("ii", $contactId, $userId);

    if ($stmt->execute())
    {
        if ($stmt->affected_rows > 0) {
            returnWithSuccess("Contact deleted successfully");
        } else {
            returnWithError("Contact not found for this user");
        }
    }
    else
    {
        returnWithError($stmt->error);
    }

    $stmt->close();
    $conn->close();

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