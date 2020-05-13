# button_clicks

* Running the application for development enviorment --  npm run dev

Button clicks include socket programming which helps in updating real time information on the system .
1. It stores the user count i.e active users on the system and a click button which saves the total clicks made by all the users and which user made the last click. It updates all information over the broadcasting channel so every user get real time update about it. 
2. It passes a welcome message which is visible to newly created and use where it maintains the user name as well, each time a user is created all other users become aware of it.
3. It gives the functionality to the user to lock and unlock button for the remaining user. The lock button locks the click button for all other user except the user who locked it. The user can unlock all users again, all remaining user cant perfrom the click function untill they are unlocked. The user who locked the button if sometimes leaves before unlocking the system than the system gets back to unlock state resolving deadlock condition and also user count is decresed when a user leaves the system.
