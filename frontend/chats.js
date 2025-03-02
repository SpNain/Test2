// We ditch the code to store chats in local storage
// because maybe that can be good to retrieve chats quickly and limit the no of chats
// but we aren't going to use it

let currentSet = 1;
let loadingMessages = false;

// on window load we will fetch first set of messages
window.onload = () => fetchMessages(currentSet);

const token = localStorage.getItem("token");

const decoded = jwt_decode(token);
const currentUserId = decoded.userId;

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

// this function will fetch the messages
async function fetchMessages(set) {
  try {
    // If loadingMessages is true, the function returns early to prevent multiple fetch operations from occurring simultaneously.
    if (loadingMessages) return;

    // This line sets loadingMessages to true, indicating that a message fetch operation is now in progress.
    loadingMessages = true;

    // making API request to get the messages
    const response = await axios.get(
      `http://localhost:4000/api/user/allmessages?set=${set}`,
      {
        headers: {
          Authorization: token,
        },
      }
    );

    const messages = response.data.messages;

    // messages agr first time aa rhe h to messages prepend false ke hisab se render honge
    // messages agr second time ya uske baad aa rhe h to messages prepend true ke hisab se render honge
    // prepend ke hisab se messages kaise render honge ye maine renderMessages fxn me smjha rkha h
    if (set > 1) {
      renderMessages(messages, true);
    }
    else {
      renderMessages(messages, false);
    }

    // agr ek baar message aa jaate h
    if (messages.length > 0) {
      currentSet += 1;
    }

    // This line sets loadingMessages to false, indicating that the message fetch operation has completed.
    loadingMessages = false;
  } catch (err) {
    console.log(err);
    alert("Please login to view messages");
    localStorage.clear();
    window.location.href = "./login.html";
  }
}

// ye function messages ko render krega depending upon the prepend
// CASE 1 : PREPEND IS FALSE
// Agr prepend false h to messages last me add honge means niche add honge
// because prepend false hum tbhi bhej rhe h jb nye messages add kr rhe h h(by default false hi h)
// messages.reverse() reverses the order of the messages array so that the oldest messages are added first and latest message added last
// hmare messages array me 0th index pe sbse lastest message pda hoga, 1st se usse purana and so on
// ab hum kya kr rhe h ki 10th wale message ko pahle add kr rhe h, fir 9th wale ko and so on
// ab 0th wala messages which is latest wo sbse last me add hoga
// to aise krke hum ek ek message ko add kr rhe h
// CASE 2 : PREPEND IS TRUE
// Prepend true h means ki messages current messages ke uper add krne
// ye case jb hoga jb user scroll krke pahle wale messages dekhna chahta h
// humne yha pe reverse isiliye nhi kr rkha kyunki hum append ki bjaye first se pahle insert kr rhe h
// means ki ab jo 0th index pe message h wo sbse pahle add hoga but wo current messages je uper add hoga
// aur 1st index wala 0th ke uper, 2nd index wala 1st ke uper and so on
// Ye scroll height ka kya scene h?
// humne prevScrollHeight nikali lets say ye aayi 8000px
// ab maanlo messages jo aaye h unki height h 3000px
// to ab chatContainer pe ye messages add hone pe hmari newScrollheight aayegi 11000px
// ab pahle jaha tak user ne scroll kr rkha tha wo top tha but new message aane ke baad wo top nhi rha
// ab hum chahe to us scroll ko thoda sa uper kr skte h taaki user ko pta lg jaaye ki msg aa chuke h
// jaise filhaal scroll 8000 pe h to hum scroll ko 8500 kr rhe h
// lekin hum chahe to naa bhi scroll kre but fir user ko manually thodi thodi der me scroll krke dekhna pdega ki msg aaye ya nhi
// to jo hum ye scroll ko thoda sa uper kr rhe h wo bas user ko ye btane ke liye h ki msg aa gye h
function renderMessages(messages, prepend = false) {
  const chatContainer = document.getElementById("chat-messages");

  if (prepend) {
    var prevScrollHeight = chatContainer.scrollHeight;
    console.log(prevScrollHeight);
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
    const gap = 500; // Define the gap size as needed
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

// Isse jb bhi new messages add honge to scroll bar apne aap niche scroll hota rhega
function scrollToBottom() {
  const chatContainer = document.getElementById("chat-messages");
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Humne setInterval wala code hta diya kyunki ab hum scroll ke hisab se messages fetch kr rhe h
// to ab har interval pe messages fetch krne ki jrurat nhi h ab messages hum tabhi fetch krenge jb user scroll krenge
// setInterval(() => {
//   fetchMessages();
// }, 5000);

// jb bhi user scroll krega to callback fxn ka code run hoga
// agr chat container nikalte h
// aur check krte h ki kya user scroll krte krte container ke top pe phunch gya h kya
// aur check krte h ki filhaal koi messages load ho rhe h ya nhi
// aur agr user top pe h aur messages load nhi ho rhe to hum fetch messages ko call lga dete h currentSet pass krke
// aur prepend ko true set kr dete h kyunki hum chahte h ki jo bhi nye message aaye wo current messages ke uper add ho
// user scroll krte krte top pe phunch gya iska kya matlab h?
// maanlo hmare pass 100 messages h aur ek baar me hum 10 messages load kr rhe h
// to jb messages load ho jaayenge to wo kuch height bhi lenge maan lete h un 10 messages ne height li 800px to chatContainer ki height bhi ho jaayegi 80px
// but screen pe sirf 300 px ka hi chatContainer show ho rha h baaki scroll krke dekh skte h to user 300 px me maan lete h ki 4 message hi dekh paa rha h
// to user usse pahle ke messages dekhne ke liye uper scroll krega aur jaise hi wo in 10 messages ke set ke ka 1st message tk phunch jaayega
// means ki ab user container me top pe scroll kr chuka h
// hum messages ko niche se add krna start krte h means ki last message jo aaya hua h wo sbse pahle add hota h
// aur uske baad usse pahle wala and so on
// to maanlo jb user scroll kr rha h tb tk saare messages (10) load nhi hue h
// to us case me bhi hum aur messages fetch nhi krte h
// to jaise hi hmari ye do conditon fulfill hoti h to hum new messages mangwate h
// aur firsr 10 aur messages aate h aur ab user agr top tak jaata h to aur messages aayenge same pahle wala case hoga
// but agr user niche scroll krta h to us case me user top pe nhi hoga aur hum aur messages nhi mangwayenge
document.getElementById("chat-messages").addEventListener("scroll", () => {
  const chatContainer = document.getElementById("chat-messages");
  if (chatContainer.scrollTop === 0 && !loadingMessages) {
    fetchMessages(currentSet);

    prepend = true;
  }
});
