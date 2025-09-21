<?php
    $inData = getRequestInfo();

    $userId    = $inData["userId"];
    $firstName = $inData["firstName"];
    $lastName  = $inData["lastName"];
    $phone     = $inData["phone"];
    $email     = $inData["email"];

    // Connect to DB
    $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
    if ($conn->connect_error)
    {
        returnWithError($conn->connect_error);
    }
    else
    {
        $stmt = $conn->prepare(
            "INSERT INTO Contacts (UserID, FirstName, LastName, Phone, Email) VALUES (?,?,?,?,?)"
        );

        if (!$stmt)
        {
            returnWithError($conn->error);
            $conn->close();
            exit;
        }

        $stmt->bind_param("sssss", $userId, $firstName, $lastName, $phone, $email);

        $stmt->execute();
        $stmt->close();
        $conn->close();

        returnWithError("");
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
?>
