let currentSet = 1;
let loadingMessages = false;

const token = localStorage.getItem("token");

const decoded = jwt_decode(token);
const currentUserId = decoded.userId;

// ye function inputs ko clear krega aur koi modal hoga to use close krega
function clearInputsAndCloseModal(...args) {
  let remainingArgs = args;
  let id;

  // agr last me id aayi hogi to use nikal lenge aur baaki ke arguments pe for loop maarenge
  // joki inputs honge aur unki values ko empty krdenge
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

// group id saath me bhej rhe h taaki group ke hisab se msg ko backend me set kra jaa ske
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

    // yhape currentSet 1 set krna kyunki jruri h
    // let say 1 set me 5 msg aate h
    // ab maan lete h kisi group pe click kra aur wha se fetch message ko call lgi aur set 1 pass hua
    // to 1-5 message aa gye aur currentSet 2 ho gya
    // ab maan lete h ki total msg 13 the
    // to user ne scroll kra top pe phuncha aur 6-10 wale msg aa gye aur currentSet 3 ho gya
    // firse user ne scroll kra top pe phuncha aur 10-13 wale msg aa gye aur currentSet 4 ho gya
    // ab user ne msg bheja aur handleMsgSubmit chla aur set 1 pass hua aur bottom tk scroll ho gya scroll bar
    // ab chatContainer me 1-5 msg h kyunki hum chat container ko khaali krke fir 1-5 msg add kiye h
    // aur ab jab user wapas se top pe jaayega to currentSet to 4 ho rkha h
    // aur msg h total 14 ab backend se msg aayenge 15-20 tk ke joki h hi nhi to msg aayenge nhi aur user purane msg dekh nhi paayega
    // aur agr humne msg 15 se uper kr bhi diye to fir sidhe 1-5 ke baad 15-20 ke msg show honge aur bich wale msg show nhi honge
    // to isiliye jb bhi user msg bhej rha h to hum currentSet ko 1 set kr rhe h taaki jb user waapas se scroll kre to msg ko backend se mangwaya jaa ske
    // agr hum nye msg ko append krte time chatContainer ko khaali naa kre to fir jrurat nhi h ye currentSet ko 1 set krne ki
    currentSet = 1;
  } catch (err) {
    console.log(err);
    alert(err.response.data.message);
    clearInputsAndCloseModal(messageInput);
  }
}

// ab message group ke hisab se mangwaye jaayenge
// jo group active hoga uske msg hi chatContainer me render honge
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

  // first time jb group create hoga to usme koi message nhi honge to hum uske No messages found show krenge
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

    //  jo hmara html me message send krne wala input h wo sirf show case ke liye h
    // kyunki usme humne jo handleMsgSubmit fxn likh rkha h wha pe groupId nhi de rkhi h
    // us input pe message send krne se group id nhi jaayegi
    // aur backend se reponse aayega ki group select kro kyunki backend pe groupId nhi phunchegi
    // aur jaise hi hum koi group select krenge to ye renderMessages fxn run hoga aur hum us nya input lga denge
    // jisme handleMsgSubmit ko us groupId ki id bhi bheji jaayegi message ke send krne pe
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
    // jb kuch message ho tbhi chatContainer ko khaali krna
    // nhi to agr message 0 hone pe bhi chatContainer ko khaali krenge
    // to hmara no message found wala html bhi ud jaayega
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

// to avoid hoisting - isko hum yha declare kr rhe h
let currentGroupId = null;

// jis bhi group me honge usi group ke message load honge scroll krne pe
document.getElementById("chat-messages").addEventListener("scroll", () => {
  const chatContainer = document.getElementById("chat-messages");
  if (chatContainer.scrollTop === 0 && !loadingMessages) {
    fetchMessages(currentSet, currentGroupId);

    prepend = true;
  }
});

/* ------------- Group Logic -------------*/

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

// Group click krne pe ye function us group se related messages laayega aur us group ki details set krega like name, desc, members etc.
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

      currentSet = 1; // ye yha pe 1 kyu set kra h iska explanation uper handleMsgSubmit me h (same hi logic h yha pe bhi)
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

// Function to fetch group details from the server
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

// Ye function basically group me add member krne ke liye h
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

// dropdown me members ko update krta h ye fxn
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
