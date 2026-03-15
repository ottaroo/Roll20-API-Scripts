# D&D Roll20 API Script: dndscripts.js
This script was designed to be used with the Roll20 API.  
It's not optimal but tries to work without the new Beacon API, since its not yet available.  

Primary function is to swap token when doing wildshape as a druid.

## Commands

``` 
!wildshape
!wildshap-cancel
!fixtoken
!adjustsize <size>
!resetsize
```

### !wildshape
To use this command you need to have a roll20 D&D 5e 2024 character sheet.  
For each shape you know, you add another character sheet, but you choose the NPC edition.  
In addition you must give the NPC sheet name to match your main PC character sheet + ' - Beast Name'.  
For example:  
You have a PC character sheet named `Diarmuid O’Duibne`  
And you know the wildshape forms of Brown bear and Tiger you will add two NPC sheets:  
One named `Diarmuid O’Duibne - Brown bear`    
And `Diarmuid O’Duibne - Tiger`  
And so on for each shape you know.  

Select your token and type `!wildshape`  
You will be prompted in the chat with a button for each available form.  
Clicking the button will swap your token with the corresponding form.  
The prompt also contains a button to cancel the wildshape.

### !wildshape-cancel
To cancel the wildshape, select your token and type `!wildshape-cancel`.  
Or you can click the button in the wildshape prompt.

### !adjustsize
This command allows you to adjust the size of the token.    
The size of the token is determined by the `size` attribute.    
The `size` attribute can be set to one of the following values:  
* `t` or `T` - which is the tiny size of a token.    
* `s` or `S` - which is the small size of a token.    
* `m` or `M` - which is the medium size of a token (default).      
* `l` or `L` - which is the large size of a token.   
* `h` or `H` - which is the huge size of a token.   
* `g` or `G` - which is the gargantuan size of a token.    
* `c` or `C` - which is the colossal size of a token.

Example usage:
```
!adjustsize h
```
This will set the size of the current selected token to huge.  

### !resetsize
This command resets the size of the selected token to the default value.

### !fixtoken
This is a command to set most of the token's attributes to the default values we use in our campaign.  
It sets the following attributes:  

* `showname: true`  
   this will display name plate to controllers of the token.      
* `showplayers_name: true`  
   this will display token name plate to other players.    
* `showplayers_bar1: true`  
   this will display HP bar to other players.    
* `playersedit_bar1: true`  
   this will allow players to edit HP bar.                
* `bar1_num_permission: "everyone"`  
   this will allow anyone to see the numeric value of the HP bar.    
* `bar1_link: "hp"`  
   this will link the HP bar to the linked character sheet's HP attribute.     
* `showplayers_bar2: true`  
  this will display Temporary HP bar to other players.
* `playersedit_bar2: true`  
  this will allow players to edit Temporary HP bar.
* `bar2_num_permission: "everyone"`  
  this will allow anyone to see the numeric value of the Temporary HP bar.
* `bar2_link: "hp_temp"`  
  this will link the Temporary HP bar to the linked character sheet's Temporary HP attribute.  
* `showplayers_bar3: true`  
  this will display custom bar to other players.
* `playersedit_bar3: true`  
  this will allow players to edit their custom bar.  
* `bar3_num_permission: "everyone"`  
  this will allow anyone to see the numeric value of the custom bar.  
* `showplayers_aura1: true`  
  this will allow players to see the first aura if it exists on the token.  
* `showplayers_aura2: true`  
  this will allow players to see the second aura if it exists on the token.  
* `playersedit_aura1: true`  
  this will allow players to edit their first aura on the token.  
* `playersedit_aura2: true`  
  this will allow players to edit their second aura on the token.  
* `has_bright_light_vision: true`  
  this will turn on bright light vision for the token.  
* `has_night_vision: true`  
  this will turn on night vision for the token if it has any darkvision.  
* `night_vision_distance: <darkvision>`  
  this will set the night vision distance to the character's darkvision value.  

The GM must complete the setup of the token:  
The GM might need to update other `Dynamic Lighting` settings manually.  
When all values are set, the GM can click `Update Default Token` under `Details` to save all the changes for future use of the token.  
Now every time the GM or the players add the token to the map, the token will be ready to use.  

**NOTE:**  
The GM can select multiple tokens and run the command on them in a single operation.  
However, the script does not check if the token is controlled by a player if executed by a GM.  
Which means the GM could run this on NPC token and set everything visible accidentally.  

