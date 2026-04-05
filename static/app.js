class Chatbox {
    constructor() {
        this.args = {
            openButton: document.querySelector('.chatbox__button'),
            chatBox: document.querySelector('.chatbox__support'),
            sendButton: document.querySelector('.send__button')
        }

        this.state = false;
        this.messages = [];
    }

    display() {
        const {openButton, chatBox, sendButton} = this.args;

        openButton.addEventListener('click', () => this.toggleState(chatBox))

        sendButton.addEventListener('click', () => this.onSendButton(chatBox))

        const node = chatBox.querySelector('input');
        node.addEventListener("keyup", ({key}) => {
            if (key === "Enter") {
                this.onSendButton(chatBox)
            }
        })
    }

    toggleState(chatbox) {
        this.state = !this.state;
        //  let chat_goodbye = document.getElementById('ttfn_blurb')

        // show or hides the box
        if(this.state) {
            chatbox.classList.add('chatbox--active');
            document.getElementById('data_input').focus();
        } else {
            chatbox.classList.remove('chatbox--active');
            document.getElementById('ttfn_blurb').textContent = "Ta-ta for now!";
            setTimeout(() => {
                    document.getElementById("ttfn_blurb").textContent = "";
            }, 5000);
        }
    }

    onSendButton(chatbox) {
        var textField = chatbox.querySelector('input');
        let text1 = textField.value;
        const sendButton = this.args.sendButton;
        
        console.log("sending question");
        
        if (text1 === "") {
            return;
        }

        //  disable input + button
        textField.disabled = true;
        sendButton.disabled = true;

        let msg1 = { name: "User", message: text1 };
        this.messages.push(msg1);
        this.updateChatText(chatbox);

        // temporary message
        let typingMsg = { name: "Sam", message: "Jane is thinking..." };
        this.messages.push(typingMsg);
        this.updateChatText(chatbox);

        // keep track of where the temp message is in DOM
        const messageContainer = chatbox.querySelector('.chatbox__messages');
        const typingElement = messageContainer.lastChild;

        fetch('/predict', {
            method: 'POST',
            body: JSON.stringify({ message: text1 }),
            mode: 'cors',
            headers: {
              'Content-Type': 'application/json'
            },
          })
          .then(r => r.json())
          .then(r => {
            let msg2 = { name: "Sam", message: r.answer };
  
            // replace typing text instead of adding new element
            typingElement.textContent = msg2.message;

            // also update messages array (replace temp item)
            this.messages[this.messages.length - 1] = msg2;

            messageContainer.scrollTop = messageContainer.scrollHeight;
            textField.value = ''

            })    .catch((error) => {
            console.error('Error:', error);
            
            typingElement.textContent = "Sorry, something went wrong.";

            textField.value = '';

        })
        .finally(() => {
            // re-enable input + button no matter what
            textField.disabled = false;
            sendButton.disabled = false;
            textField.focus(); // nice UX touch
        });

    }

/*    onSendButton(chatbox) {
        var textField = chatbox.querySelector('input');
        let text1 = textField.value
        const sendButton = this.args.sendButton;

        console.log("sending question");

        if (text1 === "") {
            return;
        }

        //  disable input + button
        textField.disabled = true;
        sendButton.disabled = true;

        let msg1 = { name: "User", message: text1 };
        this.messages.push(msg1);
        this.updateChatText(chatbox);

        fetch('/predict', {
            method: 'POST',
            body: JSON.stringify({ message: text1 }),
            mode: 'cors',
            headers: {
              'Content-Type': 'application/json'
            },
          })
          .then(r => r.json())
          .then(r => {
            let msg2 = { name: "Sam", message: r.answer };
            this.messages.push(msg2);
 
            const messageContainer = chatbox.querySelector('.chatbox__messages');
            this.appendMessage(messageContainer, msg2);

            messageContainer.scrollTop = messageContainer.scrollHeight;
            textField.value = ''

            })    .catch((error) => {
            console.error('Error:', error);
        })
        .finally(() => {
            // re-enable input + button no matter what
            textField.disabled = false;
            sendButton.disabled = false;
            textField.focus(); // nice UX touch
        });

    }



/*    onSendButton(chatbox) {
        var textField = chatbox.querySelector('input');
        let text1 = textField.value
        console.log("sending question");
        if (text1 === "") {
            return;
        }

        let msg1 = { name: "User", message: text1 };
        this.messages.push(msg1);
	this.updateChatText(chatbox);

        fetch('/predict', {
            method: 'POST',
            body: JSON.stringify({ message: text1 }),
            mode: 'cors',
            headers: {
              'Content-Type': 'application/json'
            },
          })
          .then(r => r.json())
          .then(r => {

            let msg2 = { name: "Sam", message: r.answer };
            this.messages.push(msg2);

            const messageContainer = chatbox.querySelector('.chatbox__messages');
            this.appendMessage(messageContainer, msg2);

            messageContainer.scrollTop = messageContainer.scrollHeight;
            textField.value = ''

/*            let msg2 = { name: "Sam", message: r.answer };
            this.messages.push(msg2);
            this.updateChatText(chatbox)
            textField.value = ''

        }).catch((error) => {
            console.error('Error:', error);
            this.updateChatText(chatbox)
            textField.value = ''
          });
    }*/

    appendMessage(container, message) {
        const div = document.createElement('div');
        div.classList.add('messages__item');

        div.classList.add(
            message.name === "Sam"
                ? 'messages__item--visitor'
                : 'messages__item--operator'
        );

        div.textContent = message.message;
        container.appendChild(div);
    }

    updateChatText(chatbox) {
        console.log("updating chat text");

        const messageContainer = chatbox.querySelector('.chatbox__messages');
        const lastMessage = this.messages.at(-1);

        if (lastMessage) {
            this.appendMessage(messageContainer, lastMessage);
            messageContainer.scrollTop = messageContainer.scrollHeight;
        }
    }

/*    updateChatText(chatbox) {
        console.log("updating chat text");

        const messageContainer = chatbox.querySelector('.chatbox__messages');

        const lastMessages = this.messages.slice(-2);

        lastMessages.forEach(msg => {
            this.appendMessage(messageContainer, msg);
        });
                     // auto-scroll
            messageContainer.scrollTop = messageContainer.scrollHeight;
    }


 /*   updateChatText(chatbox) {
        console.log("updating chat text");

        const lastMessage = this.messages.at(-1);

        if (lastMessage) {
            const messageContainer = chatbox.querySelector('.chatbox__messages');

            this.appendMessage(messageContainer, lastMessage);

            // auto-scroll
            messageContainer.scrollTop = messageContainer.scrollHeight;
        }
    }*/


}


const chatbox = new Chatbox();
chatbox.display();



/*         if (html.length > 56) {
            console.log("too big")
            var elements = document.getElementsByClassName("chatbox__support")
            // Set the new width to 800 pixels
            elements[0].style.width = "800px";
            elements[0].style.height = "800px";
        }

        else 
            console.log("too small")
 */        
