var apiObj = null;
var current_channel = null;
var socket = null;
var dispName = null;
var current_text_channel = null;
var last_id = -1;
var current_server = null
function StartMeeting(custom_roomName,dispName){
    const domain = 'meet.jit.si';
    const options = {
        roomName: custom_roomName,
        width: '100%',
        height: '100%',
        parentNode: document.querySelector('#jitsi-meet-conf-container'),
        userInfo: {
        email: 'email@jitsiexamplemail.com',
        displayName: dispName
        },
        configOverwrite: { 
        prejoinPageEnabled: false,
        startAudioOnly: true,
    }
            

    };
    apiObj = new JitsiMeetExternalAPI(domain, options);
    // apiObj.addEventListeners({
    //     participantJoined: function(data){
    //         var list_of_participants=apiObj.getParticipantsInfo();
    //         console.log("len")
    //         console.log(list_of_participants.length)
    //         var list_name=current_channel+"_list"
    //         //remove all elements
    //         var list_to_display = document.getElementById(list_name);
    //         list_to_display.innerHTML = '';
    //         //make list again
    //         list_of_participants.forEach((participant) => {
    //             let li = document.createElement("li");
    //             li.innerText = participant.displayName;
    //             list_to_display.appendChild(li);
    //         });
    //         if(list_of_participants.length==1){
    //             let li = document.createElement("li");
    //             li.innerText = dispName;
    //             list_to_display.appendChild(li);
    //         }
    //     },
    //     participantLeft: function(data){
    //         console.log("woof")
    //         console.log(data)
    //         console.log(apiObj.getDisplayName(data.id))
    //         var list_of_participants=apiObj.getParticipantsInfo();
    //         var list_name=current_channel+"_list"
    //         //remove all elements
    //         var list_to_display = document.getElementById(list_name);
    //         list_to_display.innerHTML = '';
    //         //make list again
    //         list_of_participants.forEach((participant) => {
    //             let li = document.createElement("li");
    //             li.innerText = participant.displayName;
    //             list_to_display.appendChild(li);
    //         });
    //     }
    // });
}



    var mute_btn = null ;
    var unmute_btn=null ;

function BindEvent(){
    var url = window.location.href
    var match = url.match(/server=(\d+)/)
    if (match) {
        current_server = match[1];
    }
    socket = io.connect('http://127.0.0.1:5000');
    // socket = io.connect('https://d66b-182-68-124-215.ngrok.io');
    mute_btn = document.querySelector("#mute");
    unmute_btn = document.querySelector("#unmute");
    end_call_btn = document.querySelector("#endcall");
    // dispName="tony"
    dispName = window.prompt('Enter your nick!');
                if (!dispName) {
                    dispName = "New User";
    }

    $(function(){
        $('#btnHangUp').on('click',function(){
            apiObj.executeCommand('hangup');
        });
    });

    $(function(){
        $('#btnScreenShare').on('click',function(){
            apiObj.executeCommand('toggleShareScreen');
        });
    });

    mute_btn.onclick = function(){
        apiObj.executeCommand('toggleAudio');
        unmute_btn.style.display="block"
        mute_btn.style.display="none"
    }

    unmute_btn.onclick = function(){
        apiObj.executeCommand('toggleAudio');
        unmute_btn.style.display="none"
        mute_btn.style.display="block"
    }


        socket.on('new_chat_message',(msg)=>{
            add_new_message(msg)
        })

        socket.on('get_last_20_messages',(msg,open_channel_flag)=>{
            const rev_msg=JSON.parse(msg)
            for (var i=0;i<rev_msg.length;i++){
                old_message_received(rev_msg[i],open_channel_flag)
            }
        })

        $('#messages-div').scroll(function(){
            if ($('#messages-div').scrollTop() == 0 && last_id!=-1){
                get_last_20_messages(0)
            }
            elmnt=document.getElementById("messages-div")
            scrollButton=document.getElementById("scrollButton")
            var temp=elmnt.scrollHeight - elmnt.scrollTop - elmnt.clientHeight;
            if(temp<1)scrollButton.style.display="none"
        })

        socket.emit('join-servers')
}

async function channel_click_function(elem){

    const channel_name = elem.id;
    if(channel_name!=current_channel){
        if(current_channel!=null){await end_call_click_function();}
        const msg={
            type:1,
            name:dispName,
            channel:channel_name
        }
        const msg_to_send=JSON.stringify(msg)
        socket.send(msg_to_send,current_server)
        StartMeeting(channel_name,dispName)
        current_channel=channel_name;
        console.log("changing or opening channel "+channel_name)
        unmute_btn.style.display="none"
        mute_btn.style.display="block"
        end_call_btn.style.display="block"
    }
}

function end_call_click_function(elem){
    apiObj.executeCommand('hangup');
    const msg={
        type:2,
        name:dispName,
        channel:current_channel
    }
    const msg_to_send=JSON.stringify(msg)
    socket.send(msg_to_send,current_server) 

    current_channel=null;
    mute_btn.style.display="none"
    unmute_btn.style.display="none"
    end_call_btn.style.display="none"
}

function update_lists(rev_msg){
    console.log(rev_msg)
    for (const channel_name in rev_msg){
        var list_name=channel_name+"_list"
        list_to_display = document.getElementById(list_name);
        list_to_display.innerHTML = '';
        for (const index in rev_msg[channel_name]){
            let li = document.createElement("li");
            li.innerText = rev_msg[channel_name][index];
            list_to_display.appendChild(li);
        }
    }
}

function click_text_channel(elem){
    if(current_text_channel!=null){
        // socket.emit('leave', current_text_channel);
        element = document.getElementById(current_text_channel);
        element.classList.toggle("activetextchannel");
        element.classList.toggle("channelshover");
    }
    current_text_channel=elem.id;
    // socket.emit('join', current_text_channel);
    element = document.getElementById(current_text_channel);
    element.classList.toggle("activetextchannel");
    element.classList.toggle("channelshover");
    message_list = document.getElementById("messages");
    message_list.innerHTML=''
    last_id=-1
    get_last_20_messages(1)

    elmnt=document.getElementById("channel_newmessage_"+current_text_channel)
    if(elmnt.style.display!="none"&&elmnt.style.display!=""){
        var temp=document.getElementById("all_data_for_"+current_server)
        unread=temp.getAttribute('data-unreadChannels')
        unread=parseInt(unread)
        unread=unread-1
        temp.setAttribute('data-unreadChannels',unread)
        if(unread==0){
            serverSymbol=document.getElementById("server_newmessage_"+current_server)
            serverSymbol.style.display="none"
        }
    }
    elmnt.style.display="none"

}

function scroll_to_bottom_of_chat(){
        elmnt=document.getElementById("messages-div")
        elmnt.scrollTop = elmnt.scrollHeight    
        scrollButton=document.getElementById("scrollButton")
        scrollButton.style.display="none"
}

function send_new_message(elem){
    if(elem!=""){
        // console.log(elem)
        const msg={
            text_channel: current_text_channel,
            sender: dispName,
            content: elem,
            server: current_server
        }
        const msg_to_send=JSON.stringify(msg)
        socket.emit("new_chat_message",msg_to_send)
    }
}

function test_function(elem) {
        elmnt=document.getElementById("server_newmessage_"+180)
        console.log(elmnt.unread_channels)
}

function add_new_message(msg){
        if(msg.server==current_server){
            if(msg.text_channel==current_text_channel){
                elmnt=document.getElementById("messages-div")
                scrollButton=document.getElementById("scrollButton")
                var temp=elmnt.scrollHeight - elmnt.scrollTop - elmnt.clientHeight;

                message_list = document.getElementById("messages");
                let li = document.createElement("li");

                let sender_div = document.createElement("div");
                if(dispName==msg.sender){sender_div.className="sender sent-by-me"}
                else {sender_div.className="sender"}
                sender_div.innerText=msg.sender;
                li.appendChild(sender_div)

                let content_div = document.createElement("div");
                if(dispName==msg.sender){content_div.className="sent-by-me"}
                content_div.innerText=msg.content;
                li.appendChild(content_div)

                message_list.appendChild(li);

                if (temp < 1){
                    elmnt.scrollTop = elmnt.scrollHeight    
                }
                else{
                    scrollButton.style.display="block"
                }
            }
            else{
                // console.log("channel_newmessage_"+msg.text_channel)
                elmnt=document.getElementById("channel_newmessage_"+msg.text_channel)
                if(elmnt.style.display=="none"||elmnt.style.display==""){
                    var temp=document.getElementById("all_data_for_"+msg.server)
                    unread=temp.getAttribute('data-unreadChannels')
                    unread=parseInt(unread)
                    unread=unread+1
                    temp.setAttribute('data-unreadChannels',unread)
                }
                elmnt.style.display="inline"
            }
        }
        else{
            elmnt=document.getElementById("server_newmessage_"+msg.server)
            if(elmnt.style.display=="none"||elmnt.style.display==""){
                var temp=document.getElementById("all_data_for_"+msg.server)
                unread=temp.getAttribute('data-unreadChannels')
                unread=parseInt(unread)
                unread=unread+1
                temp.setAttribute('data-unreadChannels',unread)
            }
            elmnt.style.display="inline"
            elmnt=document.getElementById("channel_newmessage_"+msg.text_channel)
            elmnt.style.display="inline"
        }
}

function get_last_20_messages(open_channel_flag){
    const msg={
            channel: current_text_channel,
            _id: last_id
    }
    const msg_to_send=JSON.stringify(msg)
    socket.emit('get_last_20_messages', msg_to_send,open_channel_flag,current_server)
}

function old_message_received(msg,open_channel_flag){
        message_list = document.getElementById("messages");
        let li = document.createElement("li");

        let sender_div = document.createElement("div");
        if(dispName==msg.sender){sender_div.className="sender sent-by-me"}
        else {sender_div.className="sender"}
        sender_div.innerText=msg.sender;
        li.appendChild(sender_div)

        let content_div = document.createElement("div");
        if(dispName==msg.sender){content_div.className="sent-by-me"}
        content_div.innerText=msg.content;
        li.appendChild(content_div)

        message_list.prepend(li);   
        last_id=msg._id
        if(open_channel_flag){
            scroll_to_bottom_of_chat();
        }
        else{
            elmnt=document.getElementById("messages-div")
            elmnt.scrollTop = elmnt.scrollTop + 5
        }

}

function open_server(elem){
    if(current_server!=null){
    elmnt=document.getElementById("all_data_for_"+current_server)
    elmnt.style.display="none"

    elmnt=document.getElementById(current_server)
    elmnt.className="sidebarList"

    }
    current_server=elem.id
    current_server=parseInt(current_server)
    elmnt=document.getElementById("all_data_for_"+current_server)
    elmnt.style.display="block"

    const msg={
        type:0,
        name:dispName
        }
    const msg_to_send=JSON.stringify(msg)
    socket.send(msg_to_send,current_server)
    socket.on('message',(msg)=>{
        const rev_msg=JSON.parse(msg)
        update_lists(rev_msg)
    })
    elmnt=document.getElementById(current_server)
    console.log(elmnt)
    elmnt.className="sidebarListSelected"
}



        // var list_name=channel_name+"_list"
        // var list_to_display = document.getElementById(list_name);
        // let li = document.createElement("li");
        // li.innerText = dispName;

////////////////////////
    //     configOverwrite: { startAudioOnly: true,
    // // toolbarButtons: [
    // //    'camera',
    // //    'chat',
    // //    'closedcaptions',
    // //    'desktop',
    // //    'download',
    // //    'embedmeeting',
    // //    'etherpad',
    // //    'feedback',
    // //    'filmstrip',
    // //    'fullscreen',
    // //    'hangup',
    // //    'help',
    // //    'invite',
    // //    'livestreaming',
    // //    'microphone',
    // //    'mute-everyone',
    // //    'mute-video-everyone',
    // //    'participants-pane',
    // //    'profile',
    // //    'raisehand',
    // //    'recording',
    // //    'security',
    // //    'select-background',
    // //    'settings',
    // //    'shareaudio',
    // //    'sharedvideo',
    // //    'shortcuts',
    // //    'stats',
    // //    'tileview',
    // //    'toggle-camera',
    // //    'videoquality',
    // //    '__end'
    // // ],
    //     // prejoinPageEnabled: false,
    //      },
    //     interfaceConfigOverwrite: { SHOW_JITSI_WATERMARK: false, },