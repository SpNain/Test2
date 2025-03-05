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

  // When i click on close button, modal remains in focus and area-hidden="true" did not get removed properly
  // so i am getting this error - Blocked aria-hidden on an element because its descendant retained focus. The focus must not be hidden from assistive technology users.
  // so resolve this issue i removed the focus from modal first then remove it
  if (id) {
    // Move focus to the body before hiding the modal
    document.activeElement.blur();
    document.body.focus();
    document.getElementById(`${id}`).click();
  }
}

async function handleMsgSubmit(e, groupId) {
  e.preventDefault();
  const messageInput = document.getElementById("message-input");

  // agr file aati h to file ko adjust krke upload krne ke liye bhej dete h
  // aur response me se jo fileUrl aayega uske socket ki mdad se backend pe bhej denge sendMessage wale socket connection pe
  // aur wha se jo response aayega use recieveMessage connection pe receive krke message ko render krne ke liye bhej denge joki message ko up pe render kr dega
  const fileInput = document.getElementById("file-input");
  const message = messageInput.value.trim();

  let fileUrl = null;

  if (fileInput.files.length > 0) {
    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    try {
      const response = await axios.post(
        "http://localhost:4000/api/user/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token,
          },
        }
      );
      fileUrl = response.data.fileUrl;

      document.getElementById("file-preview-container").style.display = "none";
    } catch (error) {
      alert("Error uploading file, please try again");
      return;
    }
  }

  try {
    socket.emit("sendMessage", {
      message: message.length > 0 ? message : "file sent",
      groupId: groupId,
      fileUrl: fileUrl || null,
      token,
    });
    clearInputsAndCloseModal(messageInput, fileInput);
    currentSet = 1;
  } catch (err) {
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
  //jb kisi group pe koi message nhi hota to hum No message found show krte h
  // but jb hum first message send krenge to hum chat container ko empty kr denge kyunki ab chatContainer me msg append hoga
  if (chatContainer.innerHTML.trim() === "<p>No messages found</p>") {
    chatContainer.innerHTML = "";
  }

  messages.forEach((msg) => {
    chatContainer.appendChild(createMsgUI(msg));

    if (msg.userId === currentUserId) {
      scrollToBottom();
    }
  });
}
// hum same kaam 3 jagah kr rhe the, renderSentMessage me aur renderMessages ke if else block dono me
// isiliye us code ka ek fxn bna diya aur teeno jgah se iss fxn ko call lga di
// image or video ki ui create krne ke liye iss fxn me le code me kuch updates bhi kre h
// ye fxn msg lega aur ui create krke return krega
function createMsgUI(msg) {
  const message = document.createElement("div");
  message.className =
    msg.userId === currentUserId ? "message sender" : "message receiver";

  // get the message content - matlab ki message file h ya text h aur agr file h to image h ya video us hisab se content create krlo
  let content = null;
  if (msg.fileUrl) {
    const extension = msg.fileUrl.split(".").pop().toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension)) {
      content = `<img src="${msg.fileUrl}" alt="Sent image" class="message-file" />`;
    }
    else if (["mp4", "webm", "ogg", "mov"].includes(extension)) {
      content = `<video controls class="message-file"><source src="${msg.fileUrl}" type="video/mp4">Your browser does not support videos.</video>`;
    }
    else {
      content = `<p>File Type not supported</p>`
    }
  } else {
    content = `<p>${msg.message}</p>`;
  }
  message.innerHTML = `
  <div class="message-content">
      <div class="message-info">
          <span class="username">${
            msg.userId === currentUserId ? "~You" : `~${msg.senderName}`
          }</span>
          <span class="timestamp">${new Date(msg.createdAt).toLocaleTimeString(
            "en-US",
            {
              hour: "2-digit",
              minute: "2-digit",
            }
          )}</span>
      </div>
      ${content}
  </div>
  `;
  return message;
}

// jb bhi message me file hogi to uska pahle preview dhikega
// ye fxn jb bhi file input me change hoga to trigger hoga
// matlab jaise hi koi file aayegi to ye fxn run hoga
// humne file input me sirf image/video accept kr rkha h
// aur hum bas unhi ka preview set kr rhe h
// aur agr file bhej rhe h to hum msg nhi bhej skte
// isiliye humne message wale input ko disable kr diya h
function showFilePreview() {
  const fileInput = document.getElementById("file-input");
  const filePreview = document.getElementById("file-preview");
  const videoPreview = document.getElementById("video-preview");
  const filePreviewContainer = document.getElementById(
    "file-preview-container"
  );

  const file = fileInput.files[0];

  if (file) {
    const fileURL = URL.createObjectURL(file);
    filePreviewContainer.style.display = "block";

    if (file.type.startsWith("image/")) {
      filePreview.src = fileURL;
      filePreview.style.display = "block";
      videoPreview.style.display = "none";
    } else if (file.type.startsWith("video/")) {
      videoPreview.src = fileURL;
      videoPreview.style.display = "block";
      filePreview.style.display = "none";
    }
  } else {
    filePreviewContainer.style.display = "none";
  }
  const messageInput = document.getElementById("message-input");

  messageInput.setAttribute("disabled", "true");
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
      chatContainer.insertBefore(createMsgUI(msg), chatContainer.firstChild);
    });

    appendSendFormUI(groupId);

    const newScrollHeight = chatContainer.scrollHeight;
    const gap = 100;
    chatContainer.scrollTop = newScrollHeight - prevScrollHeight - gap;
  } else {
    if (messages.length > 0) chatContainer.innerHTML = "";

    messages.reverse().forEach((msg) => {
      chatContainer.appendChild(createMsgUI(msg));
    });

    appendSendFormUI(groupId);

    if (!prepend) {
      scrollToBottom();
    }
  }
}

// ye send form ki ui ko append krne wala kaam rednerMessages ke if else dono block me jo rha tha
// to wha se code utha ke fxn bna diya aur un dono jgah iss fxn ko call lga di
function appendSendFormUI(groupId) {
  const sendForm =
    document.querySelector("#chat-area form") || document.createElement("form");
  sendForm.onsubmit = (event) => handleMsgSubmit(event, groupId);
  sendForm.innerHTML = `
      <div class="chat-input">
        <input type="text" id="message-input" placeholder="Type a message..." min="1" required />
        <input type="file" id="file-input" accept="image/*,video/*" onchange="showFilePreview()" />
        <button type="submit" id="send-button">Send</button>
      </div>
      <div id="file-preview-container" class="file-preview">
        <img id="file-preview" src="" alt="File Preview" style="display: none;" />
        <video id="video-preview" controls style="display: none;"></video>
      </div>
    `;
  if (!document.querySelector("#chat-area form")) {
    document.getElementById("chat-area").appendChild(sendForm);
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
