let currentSet = 1;
let loadingMessages = false;

const token = localStorage.getItem("token");

const decoded = jwt_decode(token);
const currentUserId = decoded.userId;

function clearInputsAndCloseModal(...args) {
  let remainingArgs = args;
  let id;

  if (args.length > 0 && typeof args[args.length - 1] === "string") {
    id = args[args.length - 1];
    remainingArgs = args.slice(0, args.length - 1);
  }

  for (let i = 0; i < remainingArgs.length; i++) {
    remainingArgs[i].value = "";
  }

  if (id) {
    document.getElementById(`${id}`).click();
  }
}

async function handleMsgSubmit(e, groupId) {
  e.preventDefault();
  const messageInput = document.getElementById("message-input");

  try {
    await axios.post(
      "http://localhost:4000/api/user/message",
      {
        message: messageInput.value,
        groupId: groupId,
      },
      { headers: { Authorization: token } }
    );
    clearInputsAndCloseModal(messageInput);
    fetchMessages(1, groupId);

    currentSet = 1;
  } catch (err) {
    console.log(err);
    alert(err.response.data.message);
    clearInputsAndCloseModal(messageInput);
  }
}

async function fetchMessages(set, groupId) {
  try {
    if (loadingMessages) return;

    loadingMessages = true;

    const response = await axios.get(
      `http://localhost:4000/api/user/allmessages?set=${set}&groupId=${groupId}`,
      {
        headers: {
          Authorization: token,
        },
      }
    );

    const messages = response.data.messages;

    if (set > 1) {
      renderMessages(messages, true, groupId);
    } else {
      renderMessages(messages, false, groupId);
    }

    if (messages.length > 0) {
      currentSet += 1;
    }

    loadingMessages = false;
  } catch (err) {
    console.log(err);
    alert("Please login to view messages");
    localStorage.clear();
    window.location.href = "./login.html";
  }
}

function renderMessages(messages, prepend = false, groupId) {
  const chatContainer = document.getElementById("chat-messages");

  if (messages.length === 0 && !prepend) {
    chatContainer.innerHTML = "<p>No messages found</p>";
  }

  if (prepend) {
    const prevScrollHeight = chatContainer.scrollHeight;

    messages.forEach((msg) => {
      const message = document.createElement("div");
      message.className =
        msg.userId === currentUserId ? "message sender" : "message receiver";
      message.innerHTML = `
          <div class="message-content">
            <div class="message-info">
              <span class="username">${
                msg.userId === currentUserId ? "~You" : `~${msg.senderName}`
              }   <span class="timestamp">${new Date(
        msg.createdAt
      ).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })}</span>
            </div>
            <p>${msg.message}</p>
          </div>
        `;
      chatContainer.insertBefore(message, chatContainer.firstChild);
    });

    const sendForm =
      document.querySelector("#chat-area form") ||
      document.createElement("form");
    sendForm.onsubmit = (event) => handleMsgSubmit(event, groupId);
    sendForm.innerHTML = `
      <div class="chat-input">
        <input type="text" id="message-input" placeholder="Type a message..." min="1" required />
        <button type="submit" id="send-button">Send</button>
      </div>
    `;
    if (!document.querySelector("#chat-area form")) {
      document.getElementById("chat-area").appendChild(sendForm);
    }

    const newScrollHeight = chatContainer.scrollHeight;
    const gap = 100;
    chatContainer.scrollTop = newScrollHeight - prevScrollHeight - gap;
  } else {
    if (messages.length > 0) chatContainer.innerHTML = "";

    messages.reverse().forEach((msg) => {
      const message = document.createElement("div");
      message.className =
        msg.userId === currentUserId ? "message sender" : "message receiver";
      message.innerHTML = `
          <div class="message-content">
            <div class="message-info">
              <span class="username">${
                msg.userId === currentUserId ? "~You" : `~${msg.senderName}`
              }</span>
             <span class="timestamp">${new Date(
               msg.createdAt
             ).toLocaleTimeString("en-US", {
               hour: "2-digit",
               minute: "2-digit",
             })}</span>

            </div>
            <p>${msg.message}</p>
          </div>
        `;
      chatContainer.appendChild(message);
    });

    const sendForm =
      document.querySelector("#chat-area form") ||
      document.createElement("form");
    sendForm.onsubmit = (event) => handleMsgSubmit(event, groupId);
    sendForm.innerHTML = `
      <div class="chat-input">
        <input type="text" id="message-input" placeholder="Type a message..." min="1" required />
        <button type="submit" id="send-button">Send</button>
      </div>
    `;
    if (!document.querySelector("#chat-area form")) {
      document.getElementById("chat-area").appendChild(sendForm);
    }

    if (!prepend) {
      scrollToBottom();
    }
  }
}

function scrollToBottom() {
  const chatContainer = document.getElementById("chat-messages");
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

let currentGroupId = null;

document.getElementById("chat-messages").addEventListener("scroll", () => {
  const chatContainer = document.getElementById("chat-messages");
  if (chatContainer.scrollTop === 0 && !loadingMessages) {
    fetchMessages(currentSet, currentGroupId);

    prepend = true;
  }
});


window.onload = () => fetchGroups();

async function handleGroupSubmit(e) {
  e.preventDefault();
  const groupNameInput = document.getElementById("add-group-name");
  const groupDescriptionInput = document.getElementById("group-description");

  try {
    await axios.post(
      "http://localhost:4000/api/group/createGroup",
      {
        groupName: groupNameInput.value,
        groupDescription: groupDescriptionInput.value,
      },
      {
        headers: {
          Authorization: token,
        },
      }
    );

    clearInputsAndCloseModal(
      groupNameInput,
      groupDescriptionInput,
      "close-group-form"
    );

    fetchGroups();
  } catch (err) {
    console.log(err);
    alert(err.response.data.message);
    clearInputsAndCloseModal(
      groupNameInput,
      groupDescriptionInput,
      "close-group-form"
    );
  }
}

async function fetchGroups() {
  const token = localStorage.getItem("token");

  try {
    const response = await axios.get(
      "http://localhost:4000/api/group/getGroups",
      {
        headers: {
          Authorization: token,
        },
      }
    );

    const groups = response.data.groups;

    renderGroups(groups);
  } catch (err) {
    console.log(err);
    alert("Please Login, Session Expired");
    localStorage.clear();
    window.location.href = "./login.html";
  }
}

function renderGroups(groups) {
  const groupsList = document.getElementById("group-list");
  groupsList.innerHTML = "";

  groups.forEach((group) => {
    const groupItem = document.createElement("div");
    const truncated =
      group.groupDescription.length > 20
        ? group.groupDescription.slice(0, 20) + "..."
        : group.groupDescription;

    groupItem.className = "group-item";
    groupItem.innerHTML = `
            <button data-group-id="${group.id}" onclick="handleGroupClick(this) ">
              <div class="group-info">
                <p style="font-weight:700; font-size:1.2rem;" class="group-name">${group.groupName}</p>
                <span class="group-last-message">${truncated}</span>
              </div>
            </button>
    `;
    groupsList.appendChild(groupItem);
  });
}

async function handleGroupClick(buttonElement) {
  const groupId = buttonElement.getAttribute("data-group-id");

  if (groupId) {
    try {
      currentGroupId = groupId;

      const groupDetails = await fetchGroupDetails(groupId);

      document.getElementById("group-name").textContent =
        groupDetails.group.groupName;

      const maxLength = 80;
      let truncated = groupDetails.group.groupDescription;
      if (truncated.length > maxLength) {
        truncated = truncated.substring(0, maxLength) + "...";
      }

      document.getElementById("group-details").innerHTML = `${truncated}`;

      currentSet = 1;
      fetchMessages(1, groupId);
      updateDropdown(groupDetails);
    } catch (error) {
      console.error("Error fetching group details:", error);
    }
  } else {
    console.error("Group id not found, Please Login again");
    window.location.href = "./login.html";
  }
}

async function fetchGroupDetails(groupId) {
  const token = localStorage.getItem("token");

  const response = await axios.get(
    `http://localhost:4000/api/group/${groupId}`,
    {
      headers: {
        Authorization: token,
      },
    }
  );
  return response.data;
}

async function handleAddMembersSubmit(e) {
  e.preventDefault();

  const emailInput = document.getElementById("user-email");
  const memberIdInput = document.getElementById("user-id");

  if (currentGroupId === null) {
    alert("Please select a group first");
    clearInputsAndCloseModal(
      emailInput,
      memberIdInput,
      "close-add-members-form"
    );
    return;
  }

  try {
    const response = await axios.post(
      "http://localhost:4000/api/group/addMember",
      {
        email: emailInput.value,
        memberId: memberIdInput.value,
        groupId: currentGroupId,
      },
      {
        headers: {
          Authorization: token,
        },
      }
    );

    clearInputsAndCloseModal(
      emailInput,
      memberIdInput,
      "close-add-members-form"
    );
    alert(response.data.message);
    fetchGroups();
  } catch (err) {
    console.log(err);
    alert(err.response.data.message);
    clearInputsAndCloseModal(
      emailInput,
      memberIdInput,
      "close-add-members-form"
    );
  }
}

function updateDropdown(groupDetails) {
  const dropdownContent = document.getElementById("dropdown-content");

  dropdownContent.innerHTML = "";

  const adminId = groupDetails.group.groupAdmin;

  groupDetails.usersInGroup.forEach((user) => {
    const userItem = document.createElement("a");
    userItem.href = "#";

    userItem.innerHTML = `
      <div style="text-align:center;">
        <span>${user.name}</span>
        <span style="font-size: 12px; color: #F00;">ID: #${user.id} | Role: ${
      user.id == adminId ? "Admin" : "Member"
    }</span>
      </div>
    `;

    dropdownContent.appendChild(userItem);
  });
}
