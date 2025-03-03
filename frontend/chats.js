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
// jb bhi kisi group pe click hoga to hum us group ke admin ki id isme set kr denge
// taki jb bhi us group me members ko add krna ho to hum us time pe is variable ka use krke konsa user admin h ye pta kr paaye
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
      currentGroupAdminId = groupDetails.group.groupAdmin; // setting the group admin id into currentGroupAdminId variable
      // group pe click krne pe hum us group ke users ko added-member element me add kr rhe h
      // taaki jb view added members button pe click hoto us group ke members ko show kra jaa ske
      // updateDropdown wala kaam hi kr rhe h
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

// Pahle humne html me code add kr rkha tha jaha pe add member button tha
// aur uspe click se form modal open hota tha aur uske submit pe handleAddMembersSubmit function call hota tha
// aur handleAddMembersSubmit fxn add member route pe request maarta tha aur backend pe addMember fxn run hota tha group controller me
// aur group me member add ho jaata tha
// aur uske baad hum fetchGroups ko call lgate the jo us user se related group laake render group ko call lgata tha jo groups ko up pe render kr deta tha
// aur fir un rendered groups pe click krne pe handleGroupClick fxn un groups se related info ui pe add kr deta tha

// To abhi kya logic h?
// humne html me search input pe type krne pe searchUsers fxn ko call lga rkhi h
// to jaise hi user kuch search krega to searchUsers fxn ko call lgegi
// jo response me wo saare users laake dega jo bhi input me types string se match krega
// aur unko render krne ke liye renderUsers fxn ko call lgayega
// Ab un users pe add button lga h jiske click ke handleAddMemeberClick fxn run hoga jisko id pass hogi jis bhi user pe click kra h uski
// ab ye fxn renderAddedMembers ko call lgata h jo added-member id wale element me us user ko add kr deta h
//

// this fxn gives the matching users as per the search input query
let timeoutId;
async function searchUsers(value) {
  /*
Debouncing:
This function is using a debounce technique to limit the number of API calls made while the user is typing. This is achieved using setTimeout and clearTimeout.
timeoutId is used to store the ID of the timeout. If the function is called again before the timeout completes, the previous timeout is cleared, and a new one is set.

Search Logic:
When the searchUsers function is called, it first checks if there is an existing timeout. If so, it clears it to prevent the previous search from executing.
It then sets a new timeout to execute the search after 300 milliseconds.
If the value (search input) is empty, it logs an empty array and returns early.

API Call:
If there is a search value, it makes an asynchronous GET request to the server to search for users by name.
The search query is URL-encoded using encodeURIComponent to ensure it is properly formatted for the URL.
The request includes an authorization token in the headers.

Rendering Results:
On a successful response, it calls the renderUsers function to display the search results.
If an error occurs during the API call, it logs the error to the console.

In simple words, this function uses a debounce technique to limit the number of API calls made while the user is typing, 
and if there is any response from the server, it then calls the renderUsers function to display the search results.
*/
  if (timeoutId) {
    clearTimeout(timeoutId);
  }

  //debounced search
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

// search result me jo users aayenge usko searc-results div me render krega ye fxn
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

// this fxn adds members into group on click of add button
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
    clearInputsAndCloseModal(searchUserInput); // yhape modal ko close nhi kr rhe taaki admin jitne user chahe utne user add krne ke baad apne app modal ko close kr ske

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

// pahle hum admin ki id updateDropdown me hi nikal rhe the
// kyunki pahle hum updateDropdown ko sirf group pe click krne ke call kr rhe the
// aur wha se hum updateDropdown ko group details bhej rhe the jisme se hum admin ki id nikal skte the the
// but ab hum admin ki id globally store kr rhe h 
// kyunki ab renderAddedMembers fxn ko group pe click ke saath saath member add or remove krne pe bhi call lgayi jaa rhi h 
// aur member add/remove ke time hume sirf user ki details bheji jaati h naaki group ki to tb hume admin ki id nhi milegi
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
      })">Remove</button>
    `;

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
