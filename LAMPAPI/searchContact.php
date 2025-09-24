<?php

    $inData = getRequestInfo();
    $searchName = $inData["searchName"];
    $userID     = $inData["userID"];

    // Connecting to the Database
    $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
    if ($conn->connect_error) returnWithError($conn->connect_error);

    else
    {
        $searchTerm = "%" . $searchName . "%";
        $stmt = $conn->prepare("
            SELECT * 
            FROM Contacts 
            WHERE (FirstName LIKE ? 
                OR LastName LIKE ? 
                OR Phone LIKE ? 
                OR Email LIKE ?) 
            AND UserID = ?
        ");

        if (!$stmt)
        {
            returnWithError($conn->error);
            $conn->close();
            exit;
        }

        $stmt->bind_param("ssssi", $searchTerm, $searchTerm, $searchTerm, $searchTerm, $userID);

        if ($stmt->execute())
        {
            $res = $stmt->get_result();
            $contacts = [];

            while ($row = $res->fetch_assoc())
                $contacts[] = $row;

            sendResultInfoAsJson(json_encode($contacts));
        }

        else returnWithError($stmt->error);

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
