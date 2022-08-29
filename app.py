from flask import Flask, render_template, request
from flask_socketio import SocketIO, send, emit, join_room, leave_room
from datachain import DataObject, DataChain
from data_structures import text_channel,get_message_by_id, list_of_last_20_messages,Server, get_server_by_id, user
import json
app = Flask(__name__)
app.config['SECRET_KEY'] = 'mysecret'
socketio = SocketIO(app, cors_allowed_origins='*')


##########################################################################################
# use these from database once created

troopz=Server("troopz")
troopz.add_text_channel("General")
troopz.add_text_channel("Clips")
troopz.add_text_channel("Test")

troopz.add_voice_channel("Council")
troopz.add_voice_channel("Gaming")
print("id: ")
print(troopz._id)

study=Server("study")
study.add_text_channel("Class")
study.add_text_channel("Test")
study.add_text_channel("Doubt")

study.add_voice_channel("Class")
study.add_voice_channel("Test")

user = user("tony")
user.servers.append(troopz)
user.servers.append(study)
##########################################################################################

@app.route('/home')
def meow():
    return render_template('index.html',server=troopz, list_of_servers=user.servers)

@app.route('/server=<server_id>')
def index(server_id):
    server=get_server_by_id(int(server_id))
    return render_template('index.html',server=server, list_of_servers=user.servers)

@socketio.on('join-servers')
def joinservers():
    print("joining servers")
    for i in user.servers:
        print(i._id)
        join_room(i._id)

socket_to_user={}

@socketio.on('message')
def handleMessage(msg,server_id):
    print(server_id)
    received_msg = json.loads(msg)
    print(type(server_id))
    server=get_server_by_id(server_id)
    print(request.sid)
    print(received_msg)
    if received_msg['type'] == 1 or received_msg['type'] == 0:
        joinedVoiceChannel(received_msg,server) 
    if received_msg['type'] == 2:
        leftVoiceChannel(received_msg,server) 

def joinedVoiceChannel(received_msg,server):
    name = received_msg['name']
    if received_msg['type'] == 1:
        channel = server.voice_channels[received_msg['channel']]
        channel.currect_active.append(name)
    else:
        socket_to_user[request.sid] = name
    update_list(server)

def leftVoiceChannel(received_msg,server):
    name = received_msg['name']
    channel = server.voice_channels[received_msg['channel']]
    channel.currect_active.remove(name)
    update_list(server)

@socketio.on('connect')
def connect(msg):
    print("new connection")
    print(request.sid)

@socketio.on('disconnect')
def disconnect():
    print("not implemented")
    # if request.sid in socket_to_user:
    #     print("disconntect called")
    #     name = socket_to_user[request.sid]
    #     socket_to_user.pop(request.sid)
    #     print(request.sid)
    #     print(name)
    #     print(socket_to_user)
    #     for channel in currect_active:
    #         if name in currect_active[channel]:
    #             currect_active[channel].remove(name)
    #             update_list()
    #             break

@socketio.on('new_chat_message')
def handle_new_chat_message(msg):
    received_msg = json.loads(msg)
    text_channel_of_message = received_msg['text_channel']
    newMessage = DataObject(received_msg['content'], "string", received_msg['sender'])
    server_id = received_msg['server']
    print(type(server_id))
    server = get_server_by_id(server_id)
    emit('new_chat_message', received_msg, to=server_id)
    server.text_channels[int(text_channel_of_message)].list_of_messages.IncrementObject(newMessage)


@socketio.on('get_last_20_messages')
def get_last_20_messages(msg,flag,server_id):
    server = get_server_by_id(server_id)
    received_msg = json.loads(msg)
    chain = server.text_channels[int(received_msg["channel"])].list_of_messages;
    if received_msg["_id"]!=-1:
        last_received = get_message_by_id(chain,received_msg["_id"]);
        last_received = last_received.prev_dataObj
    else:
        last_received = chain.dataObject
    lst=list_of_last_20_messages(last_received)
    msg_to_send = json.dumps(lst)
    emit('get_last_20_messages', (msg_to_send,flag))

# @socketio.on('join')
# def on_join(room_name):
#     join_room(room_name)

# @socketio.on('leave')
# def on_leave(room_name):
#     leave_room(room_name)


def update_list(server):
    temp={}
    for i in server.voice_channels.values():
        temp[i.name]=i.currect_active
    serialized_dict = json.dumps(temp)
    send(serialized_dict,to=server._id)   

if __name__ == '__main__':
    socketio.run(app)





# Message type 1: new person joined a voice channel
# Server
# Channel
# Person Name
# Person ID (unique)


    # for i in troopz.text_channels:
    #     if i.name==text_channel_of_message:
    #         i.list_of_messages.IncrementObject(newMessage)
    # for channel in troopz.text_channels:
    #     channel.list_of_messages.printAll()
        # print(channel.name)
    #     for message in  channel.list_of_messages:
    #         print(message)

    # print(received_msg)
    # for i in troopz.text_channels:
    #     if i.name==received_msg["channel"]:
    #         # print(i.name)
    #         chain = i.list_of_messages
# troopz.voice_channels=['Gaming','Council', 'Music','Test']
# troopz.text_channels=['general','codes', 'clips']
# general=text_channel("general")
# codes=text_channel("codes")
# clips=text_channel("clips")
# troopz.text_channels['general']=general
# troopz.text_channels['codes']=codes
# troopz.text_channels['clips']=clips
# class voice_channel:
#     name = "New Channel"
#     current_active = []

# class text_channel:
#     name = "New Channel"
#     message = []

# class messages:
#     sender = ""
#     content = ""

# general=text_channel()
# codes=text_channel()
# clips=text_channel()

# Gaming=voice_channel()
# Council=voice_channel()
# Music=voice_channel()

# troopz.text_channel = [general, codes, clips]
# troopz.voice_channel = [Gaming, Council, Music]


# Learning
# a_dict = { x:str(x) for x in range(5) }
# a_dict={}
# a_dict["name"]="meen"
# serialized_dict = json.dumps(a_dict)

    # temp=json.loads(msg)
    # print('Message: ')
    # print(temp['name']);
    # send(serialized_dict, broadcast=True)