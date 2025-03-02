let currentSet = 1;
let loadingMessages = false;

const token = localStorage.getItem("token");

const decoded = jwt_decode(token);
const currentUserId = decoded.userId;

window.onload = () => fetchMessages(currentSet);

async function handleMsgSubmit(e) {
  e.preventDefault();
  const messageInput = document.getElementById("message-input");

  try {
    await axios.post(
      "http://localhost:4000/api/user/message",
      {
        message: messageInput.value,
      },
      { headers: { Authorization: token } }
    );
    messageInput.value = "";
    fetchMessages(1);
  } catch (err) {
    console.log(err);
    alert(err.response.data.message);
  }
}

async function fetchMessages(set) {
  try {
    if (loadingMessages) return;

    loadingMessages = true;

    const response = await axios.get(
      `http://localhost:4000/api/user/allmessages?set=${set}`,
      {
        headers: {
          Authorization: token,
        },
      }
    );

    const messages = response.data.messages;

    if (set > 1) {
      renderMessages(messages, true);
    } else {
      renderMessages(messages, false);
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

function renderMessages(messages, prepend = false) {
  const chatContainer = document.getElementById("chat-messages");

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
    const newScrollHeight = chatContainer.scrollHeight;
    const gap = 100;
    chatContainer.scrollTop = newScrollHeight - prevScrollHeight - gap;
  } else {
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

    if (!prepend) {
      scrollToBottom();
    }
  }
}

function scrollToBottom() {
  const chatContainer = document.getElementById("chat-messages");
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

document.getElementById("chat-messages").addEventListener("scroll", () => {
  const chatContainer = document.getElementById("chat-messages");
  if (chatContainer.scrollTop === 0 && !loadingMessages) {
    fetchMessages(currentSet);

    prepend = true;
  }
});

/* ------------- Group Logic -------------*/

window.onload = () => fetchGroups();

async function handleGroupSubmit(e) {
  e.preventDefault();
  const groupName = document.getElementById("add-group-name").value;
  const groupDescription = document.getElementById("group-description").value;

  try {
    await axios.post(
      "http://localhost:4000/api/group/createGroup",
      {
        groupName,
        groupDescription,
      },
      {
        headers: {
          Authorization: token,
        },
      }
    );

    document.getElementById("add-group-name").value = "";
    document.getElementById("group-description").value = "";
    document.getElementById("close-group-form").click();

    fetchGroups();
  } catch (err) {
    console.log(err);
    alert(err.response.data.message);
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
