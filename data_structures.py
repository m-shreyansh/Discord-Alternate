#All these will be replaced by database
from random import randrange
from datachain import DataObject, DataChain
class text_channel:
    def __init__(self,name):
        self.name=name
        start = DataObject("Start of conversation", "string", "server")
        self.list_of_messages = DataChain(start)
        self._id=randrange(1000)

def get_message_by_id(chain,_id):
    temp = chain.dataObject
    while temp._id != None and temp._id != _id:
        temp = temp.prev_dataObj
    return temp

def list_of_last_20_messages(last_received):
    lst=[]
    count_to_20=0
    while last_received != None and count_to_20<20:
        temp={}
        temp['sender'] = last_received.sender
        temp['content'] = last_received.data
        temp['_id'] = last_received._id
        lst.append(temp)
        last_received = last_received.prev_dataObj
        count_to_20=count_to_20+1
    return lst

class voice_channel:
    def __init__(self,name):
        self.name=name
        self.currect_active=[]

list_of_server={}
class Server:
    def __init__(self,name):
        self.name=name
        self._id = randrange(1000)
        self.text_channels = {}
        self.voice_channels = {}
        list_of_server[self._id]=self

    def add_text_channel(self,name):
        newChannel=text_channel(name)
        self.text_channels[newChannel._id]=newChannel

    def add_voice_channel(self,name):
        newChannel=voice_channel(name)
        self.voice_channels[name]=newChannel

def get_server_by_id(_id):
    print(list_of_server)
    return list_of_server[_id]
class user:
    def __init__(self,name):
        self.name=name
        self._id=randrange(1000)
        self.servers=[]
        self.unread_channels=[]
