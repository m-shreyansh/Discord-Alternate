import sys
from random import randrange

#We use this class to store the data
class DataObject:
    def __init__(self, data, d_type, sender):
        """
        prev_dataObj = points to the previous DataObject
        type = refers to the type of data stored in the object
        data = actual data
        """
        self.prev_dataObj = None
        self.type = d_type
        self.data = data
        self.sender = sender
        self._id = randrange(1000);

#we use this class to make a chain for continous storage of data
class DataChain:

    def __init__(self, Newobj):        
        self.dataObject = Newobj        

    #Add new object to the chain
    def IncrementObject(self, Newobj):
        temp = self.dataObject
        Newobj.prev_dataObj = temp
        self.dataObject = Newobj

    #print all of the data available on chain
    def printAll(self):
        temp = self.dataObject
        while temp != None:
            print(temp.data)
            temp = temp.prev_dataObj


# msg = DataObject(data="Some text message", d_type="string")
# msg2 = DataObject(data="Some new  text message", d_type="string")

# file = Image.open('files/casa.jpg')
# msg3 = DataObject(data=file, d_type="Image")

# chain = DataChain(msg)
# chain.IncrementObject(msg2)
# chain.IncrementObject(msg3)

# # savable_data = pickle.dumps(chain)

# # with open('files/saved_msgs.dat', 'wb') as file_obj:
# #     file_obj.write(savable_data)

# readable = None
# with open('files/saved_msgs.dat', 'rb') as file_obj:
#     readable = file_obj.read()

# loaded_obj = pickle.loads(readable)
# loaded_obj.printAll()
