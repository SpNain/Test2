let currentSet = 1;
let loadingMessages = false;
const socket = io(`http://localhost:4000`);

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
    socket.emit("sendMessage", {
      message: messageInput.value,
      groupId: groupId,
      token,
    });
    clearInputsAndCloseModal(messageInput);
    currentSet = 1;
  }
  catch(err){
    console.log(err); 
  }
}

socket.on("receiveMessage", (msg) => {
  if (msg.groupId === currentGroupId) {
    renderSentMessage([msg]);
  }
});

function renderSentMessage(messages) {
  const chatContainer = document.getElementById("chat-messages");

  messages.forEach((msg) => {
    const message = document.createElement("div");

    message.className =
      msg.userId === currentUserId ? "message sender" : "message receiver";

    message.innerHTML = `
    <div class="message-content">
      <div class="message-info">
        <span class="username">
          ${
            msg.userId === currentUserId
              ? "~You" // If the message was sent by the current user, show "You"
              : `~${msg.senderName}` // Otherwise, show the sender's name
          } 
          ${
            msg.userId != currentUserId
              ? `<span class="message-timestamp">new</span>` // "New" label for received messages
              : ` <span class="timestamp">${new Date(
                  msg.createdAt
                ).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}</span>` // Timestamp for sent messages
          }
        </span>
      </div>
      <p>${msg.message}</p>
    </div>`;

    chatContainer.appendChild(message);

    if (msg.userId === currentUserId) {
      scrollToBottom();
    }
  });
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
let currentGroupAdminId = null;

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
      currentGroupAdminId = groupDetails.group.groupAdmin;
      renderAddedMembers(groupDetails.usersInGroup);
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

let timeoutId;
async function searchUsers(value) {
  if (timeoutId) {
    clearTimeout(timeoutId);
  }

  timeoutId = setTimeout(async () => {
    if (!value) {
      console.log([]);
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:4000/api/user/searchusers?name=${encodeURIComponent(
          value
        )}`,
        {
          headers: {
            Authorization: token,
          },
        }
      );

      renderUsers(response.data.users);
    } catch (err) {
      console.log(err);
    }
  }, 300);
}

function renderUsers(users) {
  const searchResultsDiv = document.getElementById("search-results");
  searchResultsDiv.innerHTML = "";

  users.forEach((user) => {
    const userItem = document.createElement("div");
    userItem.className = "search-item";
    userItem.innerHTML = `
   <div class="user-card card">
  <div class="p-2 d-flex justify-content-between align-items-center">
  <div style="display:flex; justify-content:center; align-items:center; gap:15px;">
      <h5 class="user-name mb-1">${user.name}</h5>
      <p class="user-phone mb-0 text-muted">Phone: ${user.phoneNumber}</p> 
      </div>
      <button class="btn btn-primary btn-sm" onclick="handleAddMemberClick(${user.id})">Add</button>
   
  </div>
</div>

    `;
    searchResultsDiv.appendChild(userItem);
  });
}

async function handleAddMemberClick(id) {
  const searchResultsDiv = document.getElementById("search-results");
  const searchUserInput = document.getElementById("search-user");

  if (currentGroupId === null) {
    alert("Please select a group first");
    searchResultsDiv.innerHTML = "";
    clearInputsAndCloseModal(searchUserInput, "close-add-members-form");
    return;
  }

  try {
    const response = await axios.post(
      "http://localhost:4000/api/group/addMember",
      {
        id,
        groupId: currentGroupId,
      },
      {
        headers: {
          Authorization: token,
        },
      }
    );

    searchResultsDiv.innerHTML = "";
    clearInputsAndCloseModal(searchUserInput);

    alert(response.data.message);
    renderAddedMembers(response.data.users);
    fetchGroups();
  } catch (err) {
    console.log(err);
    searchResultsDiv.innerHTML = "";
    clearInputsAndCloseModal(searchUserInput, "close-add-members-form");
    alert(err.response.data.message);
  }
}

function renderAddedMembers(members) {
  const addedMembersContainer = document.getElementById("added-members");
  addedMembersContainer.innerHTML = "";

  if (members.length === 0) {
    addedMembersContainer.innerHTML = "<p>No members added yet.</p>";
    return;
  }

  members.forEach((member) => {
    const memberCard = document.createElement("div");
    memberCard.className =
      "added-member d-flex justify-content-between align-items-center my-2 p-2 border rounded";

    memberCard.innerHTML = `
      <span class="member-name">${member.name}</span>
      <span class="member-role">${
        member.id == currentGroupAdminId ? "admin" : "member" //used currentGroupAdminId variable here to check who is admin
      }</span>
      <span class="member-phone">Phone: ${member.phoneNumber}</span>  
      <button class="btn btn-danger btn-sm" onclick="handleRemoveMemberClick(${
        member.id
      })">Remove</button>`;

    addedMembersContainer.appendChild(memberCard);
  });
}

async function handleRemoveMemberClick(id) {
  if (currentGroupId === null) {
    alert("Please select a group first");
    return;
  }

  const groupId = currentGroupId;

  try {
    const response = await axios.delete(
      `http://localhost:4000/api/group/removeMember?id=${id}&groupId=${groupId}`,
      {
        headers: {
          Authorization: token,
        },
      }
    );

    alert(response.data.message);

    renderAddedMembers(response.data.users);
  } catch (err) {
    console.log(err);
    alert(err.response.data.message);
  }
}
