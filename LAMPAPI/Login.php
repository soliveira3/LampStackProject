<?php

	require __DIR__ . '/cors.php';

	$inData = json_decode(file_get_contents('php://input'), true);

	$id = 0;
	$firstName = "";
	$lastName = "";
	$login = trim($inData["login"]);
	$password = $inData["password"];
	
	// Input validation
	if (empty($login) || empty($password)) {
		returnWithError("Please provide both login and password");
		return;
	}

	// Logging into the database
	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
	if( $conn->connect_error )
		returnWithError( $conn->connect_error );

	else
	{
		$stmt = $conn->prepare("SELECT ID, firstName, lastName, Password FROM Users WHERE Login=?");
		$stmt->bind_param("s", $login);
		$stmt->execute();
		$result = $stmt->get_result();

		if( $row = $result->fetch_assoc()  )
		{
			// Verify the password against the stored hash
			if (password_verify($password, $row['Password'])) {
				returnWithInfo( $row['firstName'], $row['lastName'], $row['ID'] );
			} else {
				returnWithError("Invalid login credentials");
			}
		}
		else
			returnWithError("Invalid login credentials");

		$stmt->close();
		$conn->close();
	}


	/*
	HELPER FUNCTIONS
	*/

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
