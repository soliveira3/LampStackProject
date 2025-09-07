let userId = 0;
let firstName = "";
let lastName = "";

// login interface
(function () {
  const overlay = document.getElementById("login-overlay");
  if (!overlay) return;

  // openers: any element with data-open-login
  document.querySelectorAll("[data-open-login]").forEach((el) => {
    el.addEventListener("click", (e) => {
      // if it's an <a>, stop navigation
      if (el.tagName === "A") e.preventDefault();
      openLogin();
    });
  });

  // close button
  overlay.querySelector(".login-close")?.addEventListener("click", closeLogin);

  // click outside the card closes
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeLogin();
  });

  // ESC to close
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("open")) closeLogin();
  });

  function openLogin() {
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
    // focus first input for accessibility
    const first = overlay.querySelector('input[name="username"]');
    setTimeout(() => first?.focus(), 60);
  }
  function closeLogin() {
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
  }
})();

// Local storage for contacts (temporary - not persistent across browser sessions)
let contacts = [
  { id: 1, name: "John Doe", phone: "(555) 123-4567", email: "john.doe@email.com" },
  { id: 2, name: "Jane Smith", phone: "(555) 987-6543", email: "jane.smith@email.com" },
  { id: 3, name: "Bob Johnson", phone: "(555) 456-7890", email: "bob.johnson@email.com" }
];
let nextContactId = 4;

function doLogin() {
  userId = 0;
  firstName = "";
  lastName = "";

  let login = document.getElementById("loginName").value;
  let password = document.getElementById("loginPassword").value;

  document.getElementById("loginResult").innerHTML = "";

  if (login.trim() === "" || password.trim() === "") {
    document.getElementById("loginResult").innerHTML = "Please enter both username and password";
    return;
  }

  // Pure frontend login - always succeeds
  userId = 1;
  firstName = login; // Use entered username as first name
  lastName = "User";

  saveCookie();
  window.location.href = "contacts.html";
}

function saveCookie() {
  let minutes = 20;
  let date = new Date();
  date.setTime(date.getTime() + (minutes * 60 * 1000));
  document.cookie = "firstName=" + firstName + ",lastName=" + lastName + ",userId=" + userId + ";expires=" + date.toGMTString();
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
    document.getElementById("userName").innerHTML = "Logged in as " + firstName + " " + lastName;
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
  let newName = document.getElementById("contactName").value;
  let newPhone = document.getElementById("contactPhone").value;
  let newEmail = document.getElementById("contactEmail").value;
  document.getElementById("contactAddResult").innerHTML = "";

  if (newName.trim() === "") {
    document.getElementById("contactAddResult").innerHTML = "Contact name is required";
    return;
  }

  // Add contact to local array
  let newContact = {
    id: nextContactId++,
    name: newName,
    phone: newPhone,
    email: newEmail
  };

  contacts.push(newContact);

  document.getElementById("contactAddResult").innerHTML = "Contact has been added successfully";

  // Clear form fields
  document.getElementById("contactName").value = "";
  document.getElementById("contactPhone").value = "";
  document.getElementById("contactEmail").value = "";

  // Refresh search results if there's a current search
  let searchText = document.getElementById("searchText").value;
  if (searchText.trim() !== "") {
    searchContact();
  }
}

function searchContact() {
  let srch = document.getElementById("searchText").value.toLowerCase();
  document.getElementById("contactSearchResult").innerHTML = "";

  if (srch.trim() === "") {
    document.getElementById("contactList").innerHTML = "";
    return;
  }

  // Filter contacts based on search term
  let filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(srch) ||
    contact.phone.includes(srch) ||
    contact.email.toLowerCase().includes(srch)
  );

  let contactHTML = "";

  if (filteredContacts.length === 0) {
    contactHTML = "<p>No contacts found matching your search.</p>";
  } else {
    for (let i = 0; i < filteredContacts.length; i++) {
      let contact = filteredContacts[i];
      contactHTML += `
				<div class="contact-item">
					<div class="contact-info">
						<strong>${contact.name}</strong><br>
						Phone: ${contact.phone}<br>
						Email: ${contact.email}
					</div>
					<div class="contact-actions">
						<button class="edit-btn" onclick="editContact(${contact.id})">Edit</button>
						<button class="delete-btn" onclick="deleteContact(${contact.id})">Delete</button>
					</div>
				</div>
			`;
    }
  }

  document.getElementById("contactList").innerHTML = contactHTML;
  document.getElementById("contactSearchResult").innerHTML = `Found ${filteredContacts.length} contact(s)`;
}

function editContact(contactId) {
  let contact = contacts.find(c => c.id === contactId);
  if (!contact) {
    alert("Contact not found!");
    return;
  }

  // Pre-fill form with contact data
  document.getElementById("contactName").value = contact.name;
  document.getElementById("contactPhone").value = contact.phone;
  document.getElementById("contactEmail").value = contact.email;

  // Change button text and function
  let addButton = document.getElementById("addContactButton");
  addButton.innerHTML = "Update Contact";
  addButton.onclick = function () { updateContact(contactId); };

  // Add cancel button
  if (!document.getElementById("cancelEditButton")) {
    let cancelButton = document.createElement("button");
    cancelButton.id = "cancelEditButton";
    cancelButton.className = "buttons";
    cancelButton.innerHTML = "Cancel";
    cancelButton.onclick = cancelEdit;
    addButton.parentNode.insertBefore(cancelButton, addButton.nextSibling);
  }

  // Scroll to form
  document.getElementById("contactName").scrollIntoView({ behavior: "smooth" });
}

function updateContact(contactId) {
  let newName = document.getElementById("contactName").value;
  let newPhone = document.getElementById("contactPhone").value;
  let newEmail = document.getElementById("contactEmail").value;

  if (newName.trim() === "") {
    document.getElementById("contactAddResult").innerHTML = "Contact name is required";
    return;
  }

  // Find and update contact
  let contactIndex = contacts.findIndex(c => c.id === contactId);
  if (contactIndex !== -1) {
    contacts[contactIndex] = {
      id: contactId,
      name: newName,
      phone: newPhone,
      email: newEmail
    };

    document.getElementById("contactAddResult").innerHTML = "Contact has been updated successfully";

    // Clear form and restore add button
    cancelEdit();

    // Refresh search results
    let searchText = document.getElementById("searchText").value;
    if (searchText.trim() !== "") {
      searchContact();
    }
  } else {
    document.getElementById("contactAddResult").innerHTML = "Error updating contact";
  }
}

function cancelEdit() {
  // Clear form fields
  document.getElementById("contactName").value = "";
  document.getElementById("contactPhone").value = "";
  document.getElementById("contactEmail").value = "";

  // Restore add button
  let addButton = document.getElementById("addContactButton");
  addButton.innerHTML = "Add Contact";
  addButton.onclick = addContact;

  // Remove cancel button
  let cancelButton = document.getElementById("cancelEditButton");
  if (cancelButton) {
    cancelButton.remove();
  }

  // Clear result message
  document.getElementById("contactAddResult").innerHTML = "";
}

function deleteContact(contactId) {
  let contact = contacts.find(c => c.id === contactId);
  if (!contact) {
    alert("Contact not found!");
    return;
  }

  if (confirm(`Are you sure you want to delete ${contact.name}?`)) {
    // Remove contact from array
    contacts = contacts.filter(c => c.id !== contactId);

    // Refresh search results
    let searchText = document.getElementById("searchText").value;
    if (searchText.trim() !== "") {
      searchContact();
    } else {
      document.getElementById("contactList").innerHTML = "";
    }

    alert(`${contact.name} has been deleted successfully`);
  }
}

// Function to show all contacts
function showAllContacts() {
  document.getElementById("searchText").value = ""; // Clear search

  let contactHTML = "";

  if (contacts.length === 0) {
    contactHTML = "<p>No contacts available. Add some contacts to get started!</p>";
  } else {
    for (let i = 0; i < contacts.length; i++) {
      let contact = contacts[i];
      contactHTML += `
				<div class="contact-item">
					<div class="contact-info">
						<strong>${contact.name}</strong><br>
						Phone: ${contact.phone}<br>
						Email: ${contact.email}
					</div>
					<div class="contact-actions">
						<button class="edit-btn" onclick="editContact(${contact.id})">Edit</button>
						<button class="delete-btn" onclick="deleteContact(${contact.id})">Delete</button>
					</div>
				</div>
			`;
    }
  }

  document.getElementById("contactList").innerHTML = contactHTML;
  document.getElementById("contactSearchResult").innerHTML = `Showing all ${contacts.length} contact(s)`;
}