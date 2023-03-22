import socket
import os

HOST = '127.0.0.1' # socket.gethostbyname(socket.gethostname())
PORT = 1337
ADDR = (HOST,PORT)
SIZE = 10
FORMAT = 'utf-8'

def main():
    print("Server is starting.");
    
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM);
    server.bind(ADDR);
    
    server.listen()
    print(f'Server listening on {HOST}:{PORT}')
    
    while True:
        connection, address = server.accept()
        print(f"[NEW CONNECTION] {address} connected.")
        
        availableFiles = os.listdir('Server Data/');
        availableFiles = str(availableFiles)
        availableFiles = availableFiles.encode()
        connection.send(availableFiles)
        print("Available file list sent.")
        
        fileName = connection.recv(1024).decode('utf-8')
        if(not fileName):
            print(f"[DISCONNECTED] {address} disconnected.")
            continue
        print("Received the file name.")
        
        file = open(f'Server Data/{fileName}', "rb")
        data = file.read(SIZE)
        
        while data:
            connection.send(data)
            data = file.read(SIZE)
        print("File sent.")
        
        file.close()
        connection.close() 
        print(f"[DISCONNECTED] {address} disconnected.")
        
if __name__ == "__main__":
    main()