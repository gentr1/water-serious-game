# water-serious-game
A multi player online serious game for water engineers. You can upload towns distributed water systems in epanet format, visualise them in 3d, set up game situations as a dungeon master, make teams of users with different and complementary roles, and have the teams compete to solve problems. Two games: the team based modena game, and the single player aqualibrium game are present.

At the moment, the hydraulic simulator that goes with the game is a little executable that only works on Windows, so you will need to install the game server on a Windows machine.


1- install mongodb database server on your machine.
- downlad and install the community version at https://www.mongodb.com/download-center#community


2 - once installed, you need to configure the database server to start automatically when your machine start. Instructions are at the bottom of the page : https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/
in the paragraph entitled "Manually Create a Windows Service for MongoDB Community Edition"
Note that in these instructions, they assume that you have installed MongoDB Community using the .msi installer with the path "C:\Program Files\MongoDB\Server\3.2\" . Your installer might have put in in a different path, so you will need to replace that path value with yours.


3- Once you have the mongodb database server running, install the robomongo little utility so you can look/change what is inside the database without programming. Free community edition available at : https://robomongo.org/buy


4- install node.js . Just download and execute the installer from https://nodejs.org/en/download/


5- install sails.js
In a command line in Admin mode, (Press the Win key, type cmd.exe, and press Ctrl + Shift + Enter to run the Command Prompt as Administrator) type : npm install -g sails


6- install the game
Unzip the game .zip file in a folder. 
Go to that folder in the command line (just in normal mode, not admin - type:  cd your_folder_path to go there)
Once you are in the folder where the file package.json is located, type: npm install
It should take a few minutes for the game to install all the dependencies, if you have done the previous steps correctly. Typically, it will give some warning while installing some of the dependencies libraries, but, in the end, you should see a command line looking like a bit like a tree like structure of what has been installed (see youtube video in link below)

7 - to run the game server: 
in the same folder place type : sails lift --port 80
and the game server will start.
You can now open your chrome browser and in the url, type: http://localhost in the url and yo can now configure/play the game.
Note that by default, the game connect to port 80 (the http port). That means you can play it on your own machine, and that other players can play it online as long as they can connect to your server if it is not stopped by some sort of special university/company firewall.


8- Configure and play the aqualibrium game the first time:
see youtube video at: 

9- to stop the game, just go to the command line where the game server is running and close it. You can restart the game by opening the command line in the same folder place and type : sails lift --port 80
The game will restart will all settings and users scores saved as they were previously.
