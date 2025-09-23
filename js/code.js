let userId = 0;
let firstName = "";
let lastName = "";
let contacts = [];

// login interface
(function () {
  const loginOverlay = document.getElementById("login-overlay");
  const registerOverlay = document.getElementById("register-overlay");

  // Login overlay handlers
  if (loginOverlay) {
    // openers: any element with data-open-login
    document.querySelectorAll("[data-open-login]").forEach((el) => {
      el.addEventListener("click", (e) => {
        // if it's an <a>, stop navigation
        if (el.tagName === "A") e.preventDefault();
        openLogin();
      });
    });

    // close button
    loginOverlay
      .querySelector(".login-close")
      ?.addEventListener("click", closeLogin);

    // click outside the card closes
    loginOverlay.addEventListener("click", (e) => {
      if (e.target === loginOverlay) closeLogin();
    });
  }

  // Register overlay handlers
  if (registerOverlay) {
    // openers: any element with data-open-register
    document.querySelectorAll("[data-open-register]").forEach((el) => {
      el.addEventListener("click", (e) => {
        // if it's an <a>, stop navigation
        if (el.tagName === "A") e.preventDefault();
        openRegister();
      });
    });

    // close button
    registerOverlay
      .querySelector(".register-close")
      ?.addEventListener("click", closeRegister);

    // click outside the card closes
    registerOverlay.addEventListener("click", (e) => {
      if (e.target === registerOverlay) closeRegister();
    });
  }

  // ESC to close any open overlay
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (loginOverlay && loginOverlay.classList.contains("open")) closeLogin();
      if (registerOverlay && registerOverlay.classList.contains("open"))
        closeRegister();
    }
  });

  function openLogin() {
    if (registerOverlay) closeRegister();
    if (loginOverlay) {
      loginOverlay.classList.add("open");
      loginOverlay.setAttribute("aria-hidden", "false");
      // focus first input for accessibility
      const first = loginOverlay.querySelector('input[name="username"]');
      setTimeout(() => first?.focus(), 60);
    }
  }

  function closeLogin() {
    if (loginOverlay) {
      loginOverlay.classList.remove("open");
      loginOverlay.setAttribute("aria-hidden", "true");
    }
  }

  function openRegister() {
    if (loginOverlay) closeLogin();
    if (registerOverlay) {
      registerOverlay.classList.add("open");
      registerOverlay.setAttribute("aria-hidden", "false");
      // focus first input for accessibility
      const first = registerOverlay.querySelector("#regFirstName");
      setTimeout(() => first?.focus(), 60);
    }
  }

  function closeRegister() {
    if (registerOverlay) {
      registerOverlay.classList.remove("open");
      registerOverlay.setAttribute("aria-hidden", "true");
    }
  }

  // Make functions globally available
  window.openLogin = openLogin;
  window.closeLogin = closeLogin;
  window.openRegister = openRegister;
  window.closeRegister = closeRegister;
})();

function doRegister() {
  let firstName = document.getElementById("regFirstName").value.trim();
  let lastName = document.getElementById("regLastName").value.trim();
  let login = document.getElementById("regLogin").value.trim();
  let password = document.getElementById("regPassword").value;
  let confirmPassword = document.getElementById("regConfirmPassword").value;

  document.getElementById("registerResult").innerHTML = "";

  // Validation
  if (!firstName || !lastName || !login || !password) {
    document.getElementById("registerResult").innerHTML =
      "Please fill in all fields";
    return;
  }

  if (password !== confirmPassword) {
    document.getElementById("registerResult").innerHTML =
      "Passwords do not match";
    return;
  }

  if (password.length < 6) {
    document.getElementById("registerResult").innerHTML =
      "Password must be at least 6 characters";
    return;
  }

  // Hash password with MD5 before sending
  let hashedPassword = md5(password);

  // Make API call to register endpoint
  let tmp = {
    firstName: firstName,
    lastName: lastName,
    login: login,
    password: hashedPassword,
  };
  let jsonPayload = JSON.stringify(tmp);

  let url = "LAMPAPI/Register.php";

  let xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

  try {
    xhr.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        let jsonObject = JSON.parse(xhr.responseText);

        if (jsonObject.error === "") {
          // Registration successful
          document.getElementById("registerResult").innerHTML =
            "Registration successful! You can now login.";

          // Clear form
          document.getElementById("regFirstName").value = "";
          document.getElementById("regLastName").value = "";
          document.getElementById("regLogin").value = "";
          document.getElementById("regPassword").value = "";
          document.getElementById("regConfirmPassword").value = "";

          // Switch to login view after 2 seconds
          setTimeout(() => {
            closeRegister();
            openLogin();
          }, 2000);
        } else {
          // Registration failed
          document.getElementById("registerResult").innerHTML =
            jsonObject.error;
        }
      }
    };
    xhr.send(jsonPayload);
  } catch (err) {
    document.getElementById("registerResult").innerHTML =
      "Connection error. Please try again.";
  }
}

function doLogin() {
  userId = 0;
  firstName = "";
  lastName = "";

  let login = document.getElementById("loginName").value;
  let password = document.getElementById("loginPassword").value;

  document.getElementById("loginResult").innerHTML = "";

  if (login.trim() === "" || password.trim() === "") {
    document.getElementById("loginResult").innerHTML =
      "Please enter both username and password";
    return;
  }

  // Hash password with MD5 before sending
  let hashedPassword = md5(password);

  // Make actual API call to login endpoint
  let tmp = { login: login, password: hashedPassword };
  let jsonPayload = JSON.stringify(tmp);

  let url = "LAMPAPI/Login.php";

  let xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

  try {
    xhr.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        let jsonObject = JSON.parse(xhr.responseText);

        if (jsonObject.error === "") {
          // Successful login
          userId = jsonObject.id;
          firstName = jsonObject.firstName;
          lastName = jsonObject.lastName;

          saveCookie();
          window.location.href = "contacts.html";
        } else {
          // Login failed
          document.getElementById("loginResult").innerHTML = jsonObject.error;
        }
      }
    };
    xhr.send(jsonPayload);
  } catch (err) {
    document.getElementById("loginResult").innerHTML =
      "Connection error. Please try again.";
  }
}

function saveCookie() {
  let minutes = 20;
  let date = new Date();
  date.setTime(date.getTime() + minutes * 60 * 1000);
  document.cookie =
    "firstName=" +
    firstName +
    ",lastName=" +
    lastName +
    ",userId=" +
    userId +
    ";expires=" +
    date.toGMTString();
}

function readCookie() {
  userId = -1;
  let data = document.cookie;
  let splits = data.split(",");
  for (var i = 0; i < splits.length; i++) {
    let thisOne = splits[i].trim();
    let tokens = thisOne.split("=");
    if (tokens[0] == "firstName") {
      firstName = tokens[1];
    } else if (tokens[0] == "lastName") {
      lastName = tokens[1];
    } else if (tokens[0] == "userId") {
      userId = parseInt(tokens[1].trim());
    }
  }

  if (userId < 0) {
    window.location.href = "index.html";
  } else {
    document.getElementById("userName").innerHTML =
      "Logged in as " + firstName + " " + lastName;
  }
}

function doLogout() {
  userId = 0;
  firstName = "";
  lastName = "";
  document.cookie = "firstName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
  window.location.href = "index.html";
}

function addContact() {
  let newFirstName = document.getElementById("contactFirstName").value.trim();
  let newLastName = document.getElementById("contactLastName").value.trim();
  let newPhone = document.getElementById("contactPhone").value.trim();
  let newEmail = document.getElementById("contactEmail").value.trim();
  document.getElementById("contactAddResult").innerHTML = "";

  if (newFirstName === "" || newLastName === "") {
    document.getElementById("contactAddResult").innerHTML =
      "Please enter both First and Last names";
    return;
  }

  let tmp = {
    userId: userId,
    firstName: newFirstName,
    lastName: newLastName,
    phone: newPhone,
    email: newEmail,
  };
  let jsonPayload = JSON.stringify(tmp);
  let url = "LAMPAPI/addContact.php";

  let xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

  try {
    xhr.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        let jsonObject = JSON.parse(xhr.responseText);

        if (jsonObject.error === "") {
          document.getElementById("contactAddResult").innerHTML =
            "Contact has been added successfully";

          // Clear form fields
          document.getElementById("contactFirstName").value = "";
          document.getElementById("contactLastName").value = "";
          document.getElementById("contactPhone").value = "";
          document.getElementById("contactEmail").value = "";

          // Refresh the contact list
          loadContacts();
        } else {
          document.getElementById("contactAddResult").innerHTML =
            jsonObject.error;
        }
      }
    };
    xhr.send(jsonPayload);
  } catch (err) {
    document.getElementById("contactAddResult").innerHTML =
      "Connection error. Please try again.";
  }
}

function searchContact() {
  let search = document.getElementById("searchText").value.trim();
  document.getElementById("contactSearchResult").innerHTML = "";

  if (search === "") {
    showAllContacts();
    return;
  }

  let tmp = { searchName: search, userID: userId };
  let jsonPayload = JSON.stringify(tmp);
  let url = "LAMPAPI/searchContact.php";

  let xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

  try {
    xhr.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        try {
          let jsonResponse = JSON.parse(xhr.responseText);
          let filteredContacts = [];

          if (Array.isArray(jsonResponse)) {
            filteredContacts = jsonResponse.map((contact) => ({
              id: contact.ID,
              userId: contact.UserID,
              firstName: contact.FirstName,
              lastName: contact.LastName,
              phone: contact.Phone,
              email: contact.Email,
            }));
          }

          let contactHTML = "";

          if (filteredContacts.length === 0) {
            contactHTML = "<p>No contacts found matching your search.</p>";
          } else {
            for (let i = 0; i < filteredContacts.length; i++) {
              let contact = filteredContacts[i];
              contactHTML += `
                                <div class="contact-card">
                                    <div class="contact-main">
                                        <div class="contact-name">${
                                          contact.firstName
                                        } ${contact.lastName}</div>
                                        <div class="contact-meta">
                                            ${
                                              contact.phone
                                                ? `Phone: ${contact.phone}`
                                                : ""
                                            }
                                            ${
                                              contact.phone && contact.email
                                                ? " • "
                                                : ""
                                            }
                                            ${
                                              contact.email
                                                ? `Email: ${contact.email}`
                                                : ""
                                            }
                                        </div>
                                    </div>
                                    <div class="contact-actions">
                                        <button class="edit-btn" onclick="editContact(${
                                          contact.id
                                        })">Edit</button>
                                        <button class="delete-btn" onclick="deleteContact(${
                                          contact.id
                                        })">Delete</button>
                                    </div>
                                </div>
                            `;
            }
          }

          document.getElementById("contactList").innerHTML = contactHTML;
          document.getElementById(
            "contactSearchResult"
          ).innerHTML = `Found ${filteredContacts.length} contact(s)`;
        } catch (parseErr) {
          document.getElementById("contactSearchResult").innerHTML =
            "Error searching contacts";
          console.error("Error parsing search results:", parseErr);
        }
      }
    };
    xhr.send(jsonPayload);
  } catch (err) {
    document.getElementById("contactSearchResult").innerHTML =
      "Connection error. Please try again.";
    console.error("Error searching contacts:", err);
  }
}

function editContact(contactId) {
  let contact = contacts.find((c) => c.id === contactId);
  if (!contact) {
    alert("Contact not found!");
    return;
  }

  // Pre-fill form with contact data
  document.getElementById("contactFirstName").value = contact.firstName;
  document.getElementById("contactLastName").value = contact.lastName;
  document.getElementById("contactPhone").value = contact.phone || "";
  document.getElementById("contactEmail").value = contact.email || "";

  // Change button text and function
  let addButton = document.getElementById("addContactButton");
  addButton.innerHTML = "Update Contact";
  addButton.onclick = function (event) {
    event.preventDefault();
    updateContact(contactId);
  };

  // Add cancel button
  if (!document.getElementById("cancelEditButton")) {
    let cancelButton = document.createElement("button");
    cancelButton.id = "cancelEditButton";
    cancelButton.className = "btn-ghost";
    cancelButton.innerHTML = "Cancel";
    cancelButton.onclick = function (event) {
      event.preventDefault();
      cancelEdit();
    };
    addButton.parentNode.insertBefore(cancelButton, addButton.nextSibling);
  }

  // Scroll to form
  document
    .getElementById("contactFirstName")
    .scrollIntoView({ behavior: "smooth" });
}

function updateContact(contactId) {
  let firstName = document.getElementById("contactFirstName").value.trim();
  let lastName = document.getElementById("contactLastName").value.trim();
  let phone = document.getElementById("contactPhone").value.trim();
  let email = document.getElementById("contactEmail").value.trim();

  if (!firstName || !lastName) {
    document.getElementById("contactAddResult").innerHTML =
      "Please enter both First and Last names";
    return;
  }

  // Make API call to update contact
  let tmp = {
    ID: contactId,
    userID: userId,
    FirstName: firstName,
    LastName: lastName,
    Phone: phone,
    Email: email,
  };
  let jsonPayload = JSON.stringify(tmp);
  let url = "LAMPAPI/editContact.php";

  let xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

  try {
    xhr.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        try {
          let cleanResponse = xhr.responseText.trim().replace(/[\x00-\x1F\x7F]/g, '');
          let jsonObject = JSON.parse(cleanResponse);

        if (jsonObject.error === "") {
          document.getElementById("contactAddResult").innerHTML =
            "Contact has been updated successfully";

          // Clear form fields
          document.getElementById("contactFirstName").value = "";
          document.getElementById("contactLastName").value = "";
          document.getElementById("contactPhone").value = "";
          document.getElementById("contactEmail").value = "";

          // Restore add button
          let addButton = document.getElementById("addContactButton");
          addButton.innerHTML = "Add Contact";
          addButton.onclick = function (event) {
            event.preventDefault();
            addContact();
          };

          // Remove cancel button
          let cancelButton = document.getElementById("cancelEditButton");
          if (cancelButton) {
            cancelButton.remove();
          }

          // Clear search and refresh the contact list
          document.getElementById("searchText").value = "";
          document.getElementById("contactSearchResult").innerHTML = "";

          // Force refresh the contact list after a small delay to ensure update is complete
          setTimeout(function () {
            loadContacts();
          }, 100);
        } else {
          document.getElementById("contactAddResult").innerHTML =
            jsonObject.error;
        }
        } catch (parseErr) {
          console.error("JSON parsing error:", parseErr);
          document.getElementById("contactAddResult").innerHTML =
            "Error processing server response. Please try again.";
        }
      }
    };
    xhr.send(jsonPayload);
  } catch (err) {
    document.getElementById("contactAddResult").innerHTML =
      "Connection error. Please try again.";
  }
}

function cancelEdit() {
  // Clear form fields
  document.getElementById("contactFirstName").value = "";
  document.getElementById("contactLastName").value = "";
  document.getElementById("contactPhone").value = "";
  document.getElementById("contactEmail").value = "";

  // Restore add button
  let addButton = document.getElementById("addContactButton");
  addButton.innerHTML = "Add Contact";
  addButton.onclick = function (event) {
    event.preventDefault();
    addContact();
  };

  // Remove cancel button
  let cancelButton = document.getElementById("cancelEditButton");
  if (cancelButton) {
    cancelButton.remove();
  }

  // Clear result message
  document.getElementById("contactAddResult").innerHTML = "";
}

function deleteContact(contactId) {
  let contact = contacts.find((c) => c.id === contactId);
  if (!contact) {
    alert("Contact not found!");
    return;
  }

  if (
    confirm(
      `Are you sure you want to delete ${contact.firstName} ${contact.lastName}?`
    )
  ) {
    let tmp = { userId: userId, contactId: contactId };
    let jsonPayload = JSON.stringify(tmp);
    let url = "LAMPAPI/deleteContact.php";

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    try {
      xhr.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
          let jsonObject = JSON.parse(xhr.responseText);

          if (jsonObject.error === "") {
            alert(
              `${contact.firstName} ${contact.lastName} has been deleted successfully`
            );
            loadContacts(); // Reload contacts from server
          } else {
            alert("Error deleting contact: " + jsonObject.error);
          }
        }
      };
      xhr.send(jsonPayload);
    } catch (err) {
      alert("Connection error. Please try again.");
    }
  }
}

// Function to show all contacts
function showAllContacts() {
  document.getElementById("searchText").value = ""; // Clear search

  // First load contacts from API, then display them
  loadContacts();
}

function loadContacts() {
  let tmp = { userID: userId };
  let jsonPayload = JSON.stringify(tmp);
  let url = "LAMPAPI/showAllContacts.php";

  let xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

  try {
    xhr.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        try {
          let jsonResponse = JSON.parse(xhr.responseText);
          if (Array.isArray(jsonResponse)) {
            contacts = jsonResponse.map((contact) => ({
              id: contact.ID,
              userId: contact.UserID,
              firstName: contact.FirstName,
              lastName: contact.LastName,
              phone: contact.Phone,
              email: contact.Email,
            }));
          } else {
            contacts = [];
          }

          // Update the display
          displayContacts();
        } catch (parseErr) {
          console.error("Error parsing contacts:", parseErr);
          contacts = [];
        }
      }
    };
    xhr.send(jsonPayload);
  } catch (err) {
    console.error("Error loading contacts:", err);
    contacts = [];
  }
}

function displayContacts() {
  let contactHTML = "";

  if (contacts.length === 0) {
    contactHTML =
      "<p>No contacts available. Add some contacts to get started!</p>";
  } else {
    for (let i = 0; i < contacts.length; i++) {
      let contact = contacts[i];
      contactHTML += `
                <div class="contact-card">
                    <div class="contact-main">
                        <div class="contact-name">${contact.firstName} ${
        contact.lastName
      }</div>
                        <div class="contact-meta">
                            ${contact.phone ? `Phone: ${contact.phone}` : ""}
                            ${contact.phone && contact.email ? " • " : ""}
                            ${contact.email ? `Email: ${contact.email}` : ""}
                        </div>
                    </div>
                    <div class="contact-actions">
                        <button class="edit-btn" onclick="editContact(${
                          contact.id
                        })">Edit</button>
                        <button class="delete-btn" onclick="deleteContact(${
                          contact.id
                        })">Delete</button>
                    </div>
                </div>
            `;
    }
  }

  document.getElementById("contactList").innerHTML = contactHTML;
  document.getElementById(
    "contactSearchResult"
  ).innerHTML = `Showing all ${contacts.length} contact(s)`;
}
