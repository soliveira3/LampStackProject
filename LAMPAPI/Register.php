<?php

    require __DIR__ . '/cors.php';


    // Receiving input
    $inData = json_decode(file_get_contents('php://input'), true);
    if (empty($inData['firstName']) || empty($inData['lastName']) || empty($inData['login']) || empty($inData['password']))
        returnWithError("Provide required fields -> (firstName, lastName, login, password)");


    $firstName = $inData["firstName"];
    $lastName = $inData["lastName"];
    $login = $inData["login"];
    $password = $inData["password"];


    // Connecting the the database
    $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
    if( $conn->connect_error )
        returnWithError( $conn->connect_error );

    else
    {
        $stmt = $conn->prepare("SELECT ID FROM Users WHERE Login=?");
        $stmt->bind_param("s", $login);
        $stmt->execute();
        $result = $stmt->get_result();

        // prompt the user to pick another username since this username exists
        if ($result->num_rows > 0)
            returnWithError("User already exists");

        // Adding the user into the database
        else
        {
            $stmt = $conn->prepare("INSERT INTO Users (firstName, lastName, Login, Password) VALUES (?, ?, ?, ?)");
            $stmt->bind_param("ssss", $firstName, $lastName, $login, $password);

            // What info do I want to return
            if ($stmt->execute())
                returnWithInfo($firstName, $lastName, $conn->insert_id);

            else
                returnWithError("Error creating user");
        }

        $stmt->close();
        $conn->close();
    }


    // HELPER FUNCTIONS

    function sendResultInfoAsJson( $obj )
    {
        header('Content-type: application/json');
        echo $obj;
    }

    function returnWithError( $err )
    {
        $retValue = '{"id":0,"firstName":"","lastName":"","error":"' . $err . '"}';
        sendResultInfoAsJson( $retValue );
    }

    function returnWithInfo( $firstName, $lastName, $id )
    {
        $retValue = '{"id":' . $id . ',"firstName":"' . $firstName . '","lastName":"' . $lastName . '","error":""}';
        sendResultInfoAsJson( $retValue );
    }

?>
