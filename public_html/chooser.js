
/* chooser.js
 * 
 * Holds data and code needed to run the cascading solutions chooser.
 */
"use strict";

const ActivityPrompt = "What do you want to do?";
const DevicePrompt = "What device do you want to use?";
const SolutionPrompt = "Possible solutions";

let Activity = function(id, text) {
    this.id = id;
    this.text = text;
}

let Device = function(id, parentid, text) {
    this.id = id;
    this.parentid = parentid;
    this.text = text;
}

let Selection = function(deviceid, text, description, createFunc, displayFunc) {
    this.deviceid = deviceid;
    this.text = text;
    this.description = description;
    this.createFunc = createFunc;
    this.displayFunc = displayFunc
}

// -----------------------------------------
// Activities
let Activities = [];
let activitySelection = 0;

Activities.push (new Activity(1, "Control Cursor Motion"));
Activities.push (new Activity(2, "Press Mouse Buttons"));
Activities.push (new Activity(3, "Scrolling"));
Activities.push (new Activity(4, "Keyboard Actions"));

// --------------------------------------------
// Devices
let Devices = [];
let deviceSelection = 0;

/* for CURSOR */
Devices.push (new Device(1, 1, "One Button"));
Devices.push (new Device(2, 1, "Two Buttons"));
Devices.push (new Device(3, 1, "Joystick"));
Devices.push (new Device(4, 1, "Gyro"));
    
/* for MOUSE_BUTTONS */
Devices.push (new Device(10, 2, "One Button"));
Devices.push (new Device(11, 2, "Two Buttons"));
Devices.push (new Device(12, 2, "Joystick"));
Devices.push (new Device(13, 2, "Gyro"));
    
/* for SCROLLING */
Devices.push (new Device(21, 3, "One Button"));
Devices.push (new Device(22, 3, "Two Buttons"));
Devices.push (new Device(23, 3, "Joystick"));
    
/* for KEYBOARD */
Devices.push (new Device(31, 4, "One Button"));

// ----------------------------------------------------------
// Solution Descriptions 
let DS_ONE_BTN_MOUSE   = "Enable left-click and control of cursor motion \
with a single button.";
let DS_TWO_BTN_MOUSE   = "Enable cursor control with two buttons. \
One button controls left-right cursor motion and the other controls \
up-down motion.";
let DS_JOYSTICK_MOUSE1 = "Control the cursor with a joystick. \
Left- and right-click capability can be added.";
let DS_JOYSTICK_MOUSE2 = "Enable cursor and scrolling control with \
the joystick and a button.";
let DS_GYRO_MOUSE      = "Using the gyroscope, control the cursor \
with head motions.";

// -- mouse buttons - one button
let DS_LEFT_CLICK       = "Create a button which generates a left-click when pressed.";
let DS_RIGHT_CLICK      = "Create a button which generates a right-click when pressed.";
let DS_LEFT_PRESS_RELEASE_TOGGLE = "Allow drag and drop without having to hold a button.";
let DS_LEFT_EMULATION   = "Create a button which acts like the left mouse button. \
It is pressed when pressed and released when released.";
let DS_THREE_FUNC_BUTTON = "Provide left-click, right-click and left press and hold \
with a single button.";

// -- mouse buttons - two button
let DS_LEFT_RIGHT_CLICK     = "Create two buttons.  One  does a left-click \
and the other does a right-click.";

// -- mouse buttons - other
let DS_JOYSTICK_CLICKS = "Generate left- and right-clicks as part of a \
<i>Joystick Mouse</i> solution.";
let DS_GYRO_CLICKS     = "Generate left- and right-clicks as part of a \
<i>Gyro Mouse</i> solution.";

// -- scrolling
let DS_SCROLL_UP_DOWN_TOGGLE  = "Control scrolling up and down with a single button.";
let DS_SCROLL_UP_DOWN  = "Create two buttons, one button scrolls up, the other scrolls down.";
let DS_JOYSTICK_SCROLL = "Control scrolling with a <i>Joystick Mouse</i>.";

// -- keyboard
let DS_KEYBOARD_TEXT     = "Type up to 20 characters by pressing a single button";
let DS_KEYBOARD_SPECIAL  = "Type a special character (e.g. Page Up, Home or F3).";
let DS_KEYBOARD_MODIFIER = "Type a character plus a modifier key (e.g. control + c) with a single button.";
let DS_UP_DOWN_ARROW_TOGGLE    = "Send up- and down-arrow keystrokes with a single button.";
let DS_KEYBOARD_SHIFT    = "Press and hold the shift key by touching a button.";
let DS_KEYBOARD_CONTROL  = "Press and hold the control key by touching a button.";

// --------------------------------------------------------
// Solution References
let SolutionRef = [];
SolutionRef.push (new Selection(1, "One Button Mouse", DS_ONE_BTN_MOUSE, makeOneButtonMouse, defaultDisplay));
SolutionRef.push (new Selection(2, "Two Button Mouse", DS_TWO_BTN_MOUSE, makeTwoButtonMouse, defaultDisplay));
SolutionRef.push (new Selection(3, "Joystick Mouse1", DS_JOYSTICK_MOUSE1, makeJoystickMouse1, defaultDisplay));
SolutionRef.push (new Selection(3, "Joystick Mouse2", DS_JOYSTICK_MOUSE2, makeJoystickMouse2, defaultDisplay));
SolutionRef.push (new Selection(4, "Gyro Mouse", DS_GYRO_MOUSE, makeGyroMouse, defaultDisplay));

SolutionRef.push (new Selection(10, "Left Click Button", DS_LEFT_CLICK, makeLeftClickButton, defaultDisplay));
SolutionRef.push (new Selection(10, "Right Click Button", DS_RIGHT_CLICK, makeRightClickButton, defaultDisplay));
SolutionRef.push (new Selection(10, "Left Press-Release Toggle", DS_LEFT_PRESS_RELEASE_TOGGLE, makeLeftPressReleaseToggle, defaultDisplay));
SolutionRef.push (new Selection(10, "Left Button Emulation", DS_LEFT_EMULATION, makeLeftButtonEmulation, defaultDisplay));
SolutionRef.push (new Selection(10, "Three Function Mouse Button", DS_THREE_FUNC_BUTTON, makeThreeFunctionButton, defaultDisplay));

// -- mouse buttons - two button
SolutionRef.push (new Selection(11, "Left-Right Click", DS_LEFT_RIGHT_CLICK, makeLeftRightClick, defaultDisplay));

// -- mouse buttons - other
SolutionRef.push (new Selection(12, "Joystick Clicks", DS_JOYSTICK_CLICKS, null, LDS_JOYSTICK_CLICKS));
SolutionRef.push (new Selection(13, "Gyro Clicks", DS_GYRO_CLICKS, null, LDS_GYRO_CLICKS));

// -- scrolling
SolutionRef.push (new Selection(21, "Scroll Up-Down Toggle", DS_SCROLL_UP_DOWN_TOGGLE, makeScrollUpDownToggle, defaultDisplay));
SolutionRef.push (new Selection(22, "Scroll Up-Down Buttons", DS_SCROLL_UP_DOWN, makeScrollUpDownButtons, defaultDisplay));
SolutionRef.push (new Selection(23, "Scroll With Joystick", DS_JOYSTICK_SCROLL, null, LDS_JOYSTICK_SCROLL));

// -- keyboard
SolutionRef.push (new Selection(31, "Send a text string", DS_KEYBOARD_TEXT, makeKeyboardText, defaultDisplay));
SolutionRef.push (new Selection(31, "Send a special character", DS_KEYBOARD_SPECIAL, makeKeyboardSpecial, defaultDisplay));
SolutionRef.push (new Selection(31, "Send a character plus a modifier", DS_KEYBOARD_MODIFIER, makeKeyboardModifier, defaultDisplay));
SolutionRef.push (new Selection(31, "Up-Down toggle", DS_UP_DOWN_ARROW_TOGGLE, makeKeyboardUpDownArrowToggle, defaultDisplay));
SolutionRef.push (new Selection(31, "Press-Release toggle for shift key", DS_KEYBOARD_SHIFT, makeKeyboardShift, defaultDisplay));
SolutionRef.push (new Selection(31, "Press-Release toggle for control key", DS_KEYBOARD_CONTROL, makeKeyboardControl, defaultDisplay));

// Show the solutions modal dialog 
function showSolutionDlg() {
    document.getElementById("solutionsDlg").style.display = "block";  
    updateDisplay();
}

// When the user clicks on <span> (x), close the modal dialog
function closeIt() {
  document.getElementById("solutionsDlg").style.display = "none";
  activitySelection = 0;
  deviceSelection = 0;
  hidePossible();
}

// Update all of the dialog, using the user's current selections.
function updateDisplay() {
    var chooserBase = document.getElementById("solutionContent");
    while (chooserBase.firstChild) {
        chooserBase.removeChild(chooserBase.lastChild);
    }
    
    var title = document.createElement("p");
    title.className = "solutionTitle";
    title.innerHTML = ActivityPrompt;
    chooserBase.appendChild(title);
    
    for (let act of Activities){
        var b = document.createElement("input");
        b.type = "button";
        b.className = "activityButton";
        b.value = act.text;
        chooserBase.appendChild(b);
        activityButtonAction(b, act);
        if (act.id == activitySelection) {
            b.style.backgroundColor = "lightblue";
            var newDiv = document.createElement("div");
            chooserBase.appendChild(newDiv);
            showDevices(newDiv, act.id);
        }
    }
}

// Show a devices list below the selected activity.
function showDevices(deviceDiv, parentID) {
    var title = document.createElement("p");
    title.className = "devicesTitle";
    title.innerHTML = DevicePrompt;
    deviceDiv.appendChild(title);
    
    for(let device of Devices) {        
        if (device.parentid == parentID) {
            var b = document.createElement("input");
            b.type = "button";
            b.className = "deviceButton";
            b.value = device.text;
            if (device.id == deviceSelection) {
                b.style.backgroundColor = "lightblue";
            }
            deviceButtonAction(b, device);
            deviceDiv.appendChild(b);
        }
    }
}

// Define what to do when an activity button is pressed.
function activityButtonAction(button, activity) {
    button.onclick = function() {
        activitySelection = activity.id;
        updateDisplay();
        hidePossible();
    };
}

// What to do when a device button is clicked.
// Open a list of available solutions.
function deviceButtonAction(btn, device) {
    btn.onclick = function(event) {
        hidePossible();
        deviceSelection = device.id;
        updateDisplay();
        let theDiv = document.getElementById("possibleSolutions");
        while(theDiv.firstChild) {  // Empty the div.
            theDiv.removeChild(theDiv.lastChild);
        }
        
        var title = document.createElement("p");
        title.innerHTML = SolutionPrompt;
        title.className = "solutionsTitle";
        theDiv.appendChild(title);
        
        for (let solRef of SolutionRef) {
            if (solRef.deviceid === device.id) {
                var innerDiv = document.createElement("div");
                innerDiv.className = "tooltipdiv";
                theDiv.appendChild(innerDiv);
                
                var b = document.createElement("input");
                b.type = "button";
                b.className = "solutionButton";
                b.value = solRef.text;
                solutionButtonAction(b, solRef);
                innerDiv.appendChild(b);  
                
                // Tool tip
                var tooltip = document.createElement("span");
                tooltip.className = "tooltip";
                tooltip.innerHTML = solRef.description;
                innerDiv.appendChild(tooltip);
            }
        }
        
        // Position and display the div.
        theDiv.style.display = "block";
        theDiv.style.position = "fixed";
        theDiv.style.top = (event.clientY - 15).toString() + "px";
        theDiv.style.left = (event.clientX + 50).toString() + "px"; 
    };
}

function hidePossible() {
    let theDiv = document.getElementById("possibleSolutions");
    theDiv.style.display = "none";
}

// Define the action when a solutions button is pressed
function solutionButtonAction(btn, solRef) {
    btn.onclick = function() {
        if (solRef.createFunc === null) {
            closeIt();
            showMessageBox("Information", solRef.displayFunc, ["OK"]);
        } else {
            addTab(solRef);
            closeIt();
        }
    };
}

// --- New Tab --------------
// addTab() is called when a solution is actually selected.
// Code to support the addition of a tab, creation of the Solution object
// and display of solution settings and options.
let nextID = 0;

function addTab(solRef) {
    nextID++;
    let currentID = nextID;
    let buttonHolder = document.getElementById("tabButtons");
    let contentHolder = document.getElementById("tabContents");
    
    let tabDiv = document.createElement("div");
    let tabButton = document.createElement("input");
    let tabClose = document.createElement("span");
    
    tabDiv.className = "tabDivItem";
    tabDiv.myID = currentID;
    
    tabButton.type = "button";
    tabButton.className = "tabButton";
    tabButton.value = solRef.text;
    tabButton.myID = currentID;
    tabButton.onclick = function() {
        setActiveTab(currentID);
    };
    
    tabClose.className = "closeTab";
    tabClose.innerHTML = "&times";
    tabClose.onclick = function() {
        showMessageBox("Please confirm", "Do you want to delete " + solRef.text + "?", ["Yes", "No"])
                .then( (response) => {
                    if (response == "Yes") {
                        removeTab(currentID);
                    }
                });
    };
    
    tabDiv.appendChild(tabButton);
    tabDiv.appendChild(tabClose);
   
    buttonHolder.appendChild(tabDiv);
    
    createContent(solRef, contentHolder, currentID);
     
    setActiveTab(currentID);
}

// Update tabs when one is clicked, to adjust its shading
// (by changing classes) and make the content div visible.
function setActiveTab(selectedID) {
    var tabs = document.getElementsByClassName("tabDivItem");
    for(let t of tabs) {
        if (t.myID === selectedID) {
            t.className = "tabDivItem activeItem";
        } else {
            t.className = "tabDivItem";
        }
    }
    var cont = document.getElementsByClassName("tabContent");
    for(let c of cont) {
        if (c.myID == selectedID) {
            c.style.display = "block";
        } else {
            c.style.display = "none";
        }
    }
}

function createContent(solRef, contentHolder, currentID) {
    let content = document.createElement("div");
    content.className = "tabContent";
    content.myID = currentID;
    contentHolder.appendChild(content);   
    
    let descriptionDiv = document.createElement("div");
    let settingsDiv = document.createElement("div");
    let optionsDiv = document.createElement("div");
        
    content.appendChild(descriptionDiv);
    content.appendChild(settingsDiv);
    content.appendChild(optionsDiv);
    
    descriptionDiv.className = "solutionBlock";
    settingsDiv.className = "solutionBlock";
    optionsDiv.className = "solutionBlock";
    
    let t1 = document.createElement("h2");
    t1.innerHTML = "Description";
    descriptionDiv.appendChild(t1);
    
    let t2 = document.createElement("h2");
    t2.innerHTML = "Settings";
    settingsDiv.appendChild(t2);
    
    let t3 = document.createElement("h2");
    t3.innerHTML = "Options";
    optionsDiv.appendChild(t3);
    
    solRef.displayFunc(solRef, descriptionDiv, settingsDiv, optionsDiv, currentID);
}

// Close button is clicked.
// We need to find and remove the content div, the tab button and 
// the Solution (in the SolutionList - in solutions.js).
function removeTab(selectedID) {
    let tabsHolder = document.getElementById("tabButtons");
    let contentHolder = document.getElementById("tabContents");

    // Remove the tab
    var tabs = document.getElementsByClassName("tabDivItem");
    for(let t of tabs) {
        if (t.myID === selectedID) {
            tabsHolder.removeChild(t);
        }
    }
    var cont = document.getElementsByClassName("tabContent");
    for(let c of cont) {
        if (c.myID === selectedID) {
            c.style.display = "none";
            contentHolder.removeChild(c);
        } 
    } 
    
    tabs = document.getElementsByClassName("activeItem");
    if (tabs.length === 0) { // we just deleted the active item.
        tabs = document.getElementsByClassName("tabDivItem");
        if (tabs.length > 0) {
            setActiveTab(tabs[0].myID);
        }
    }

    // Remove the solution item from the internal solutions list.
    SolutionList.remove(selectedID);
}

function defaultDisplay(solRef, descriptionDiv, settingsDiv, optionsDiv, currentID) {
    var theSolution = solRef.createFunc(currentID);

    var p = document.createElement("p");
    p.innerHTML = theSolution.description;
    
    descriptionDiv.appendChild(p);
    
    for (let setting of theSolution.settings) {
        addControlItem(settingsDiv, setting);
    }
    
    for (let option of theSolution.options) {
        addControlItem(optionsDiv, option);
    }
}

// theItem is a Widget.  This adds an item to either settings or options
function addControlItem(outerDiv, theItem) {
    let newDiv = document.createElement("div");
    newDiv.className = "settingDiv";
    if (theItem.isLabelFirst()) {
        newDiv.appendChild(theItem.getLabel());        
    } 
        newDiv.appendChild(theItem.getWidget());
    if (!theItem.isLabelFirst()) {
        newDiv.appendChild(theItem.getLabel());       
    }
    outerDiv.appendChild(newDiv);
}



