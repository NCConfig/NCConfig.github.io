
/* chooser.js
 * 
 * Holds data and code needed to run the cascading solutions chooser.
 */
"use strict";

const ActivityPrompt = "What do you want to do?";
const DevicePrompt = "What device do you want to use?";
const SolutionPrompt = "Possible solutions";

// ----------------------------------------------------------
// Solution Descriptions 
const DS_ONE_BTN_MOUSE   = "Enable left-click and control of cursor motion \
with a single button.";
const DS_TWO_BTN_MOUSE   = "Enable cursor control with two buttons. \
One button controls left-right cursor motion and the other controls \
up-down motion.";
const DS_JOYSTICK_MOUSE1 = "Control the cursor with a joystick. \
Left- and right-click capability can be added.";
const DS_JOYSTICK_MOUSE2 = "Enable cursor and scrolling control with \
the joystick and a button.";
const DS_GYRO_MOUSE      = "Using the gyroscope, control the cursor \
with head motions.";

// -- mouse buttons - one button
const DS_LEFT_CLICK       = "Create a button which generates a left-click when pressed.";
const DS_RIGHT_CLICK      = "Create a button which generates a right-click when pressed.";
const DS_LEFT_PRESS_RELEASE_TOGGLE = "Allow drag and drop without having to hold a button.";
const DS_LEFT_EMULATION   = "Create a button which acts like the left mouse button. \
It is pressed when pressed and released when released.";
const DS_THREE_FUNC_BUTTON = "Provide left-click, right-click and left press and hold \
with a single button.";

// -- mouse buttons - two button
const DS_LEFT_RIGHT_CLICK     = "Create two buttons.  One  does a left-click \
and the other does a right-click.";

// -- mouse buttons - references to other solutions
const DS_JOYSTICK_CLICKS = "Generate left- and right-clicks as part of a \
<i>Joystick Mouse</i> solution.";
const DS_GYRO_CLICKS     = "Generate left- and right-clicks as part of a \
<i>Gyro Mouse</i> solution.";

// -- scrolling
const DS_SCROLL_UP_DOWN_TOGGLE  = "Control scrolling up and down with a single button.";
const DS_SCROLL_UP_DOWN  = "Create two buttons, one button scrolls up, the other scrolls down.";
const DS_JOYSTICK_SCROLL_ONLY = "Simple scrolling using a joystick.";
// Reference
const DS_JOYSTICK_SCROLL = "Control scrolling as part of a <i>Joystick Mouse</i> solution.";

// -- keyboard
const DS_KEYBOARD_TEXT     = "Type up to 20 characters by pressing a single button";
const DS_KEYBOARD_SPECIAL  = "Type a special character (e.g. Page Up, Home or F3).";
const DS_KEYBOARD_MODIFIER = "Type a character plus a modifier key (e.g. control + c) with a single button.";
const DS_UP_DOWN_ARROW_TOGGLE    = "Send up- and down-arrow keystrokes with a single button.";
const DS_KEYBOARD_SHIFT    = "Press and hold the shift key by touching a button.";
const DS_KEYBOARD_CONTROL  = "Press and hold the control key by touching a button.";

let Chooser = {
    // PUBLIC ENTRY POINT - to initialize chooser tables.
    init: function() {
        this.initActivities();
        this.initDevices();
        this.initSolutions();
    },
    
    // -----------------------------------------
    // Activities
    Activity: function(id, text) {
        this.id = id;
        this.text = text;
    },
    Activities: [],
    activitySelection: 0,
    
    initActivities: function() {
        this.Activities.push (new this.Activity(1, "Control Cursor Motion"));
        this.Activities.push (new this.Activity(2, "Press Mouse Buttons"));
        this.Activities.push (new this.Activity(3, "Scrolling"));
        this.Activities.push (new this.Activity(4, "Keyboard Actions"));
    },
    
    // --------------------------------------------
    // Devices
    Device: function(id, parentid, text) {
        this.id = id;
        this.parentid = parentid;
        this.text = text;
    },
    Devices: [],
    deviceSelection: 0,
    
    initDevices: function() {
        /* for CURSOR */
        this.Devices.push (new this.Device(1, 1, "One Button"));
        this.Devices.push (new this.Device(2, 1, "Two Buttons"));
        this.Devices.push (new this.Device(3, 1, "Joystick"));
        this.Devices.push (new this.Device(4, 1, "Gyro"));

        /* for MOUSE_BUTTONS */
        this.Devices.push (new this.Device(10, 2, "One Button"));
        this.Devices.push (new this.Device(11, 2, "Two Buttons"));
        this.Devices.push (new this.Device(12, 2, "Joystick"));
        this.Devices.push (new this.Device(13, 2, "Gyro"));

        /* for SCROLLING */
        this.Devices.push (new this.Device(21, 3, "One Button"));
        this.Devices.push (new this.Device(22, 3, "Two Buttons"));
        this.Devices.push (new this.Device(23, 3, "Joystick"));

        /* for KEYBOARD */
        this.Devices.push (new this.Device(31, 4, "One Button"));
    },
    
    // --------------------------------------------------------
    // Solution References
    Selection: function(deviceid, description, reg) {
        this.deviceid = deviceid;
        this.description = description;
        this.solreg = reg;  // Solution registry. Holds name and createFunc
    },

    Reference: function(deviceid, name, shortD, longD) {
        this.deviceid = deviceid;
        this.name = name;
        this.shortD = shortD;
        this.longD = longD;
    },
    SolutionRef: [],

    initSolutions: function() {
        this.SolutionRef.push (new this.Selection(1, DS_ONE_BTN_MOUSE, SolOneBtnMouse));
        this.SolutionRef.push (new this.Selection(2, DS_TWO_BTN_MOUSE, SolTwoBtnMouse));
        this.SolutionRef.push (new this.Selection(3, DS_JOYSTICK_MOUSE1, SolJoystickMouse1));
        this.SolutionRef.push (new this.Selection(3, DS_JOYSTICK_MOUSE2, SolJoystickMouse2));
        this.SolutionRef.push (new this.Selection(4, DS_GYRO_MOUSE, SolGyroMouse));

        this.SolutionRef.push (new this.Selection(10, DS_LEFT_CLICK, SolLeftClick));
        this.SolutionRef.push (new this.Selection(10, DS_RIGHT_CLICK, SolRightClick));
        this.SolutionRef.push (new this.Selection(10, DS_LEFT_PRESS_RELEASE_TOGGLE, SolLeftPressReleaseToggle));
        this.SolutionRef.push (new this.Selection(10, DS_LEFT_EMULATION, SolLeftEmulation));
        this.SolutionRef.push (new this.Selection(10, DS_THREE_FUNC_BUTTON, SolThreeFuncMouseButton));

        // -- mouse buttons - two button
        this.SolutionRef.push (new this.Selection(11, DS_LEFT_RIGHT_CLICK, SolLeftRightClick));

        // -- mouse buttons - references to other solutions
        this.SolutionRef.push (new this.Reference(12, "Joystick Clicks", DS_JOYSTICK_CLICKS, LDS_JOYSTICK_CLICKS));
        this.SolutionRef.push (new this.Reference(13, "Gyro Clicks",     DS_GYRO_CLICKS,     LDS_GYRO_CLICKS));

        // -- scrolling
        this.SolutionRef.push (new this.Selection(21, DS_SCROLL_UP_DOWN_TOGGLE, SolScrollToggle));
        this.SolutionRef.push (new this.Selection(22, DS_SCROLL_UP_DOWN,        SolScrollButtons));
        //Reference
        this.SolutionRef.push (new this.Selection(23, DS_JOYSTICK_SCROLL_ONLY,  SolScrollJoystick));
        this.SolutionRef.push (new this.Reference(23, "Scroll with Joystick Mouse", DS_JOYSTICK_SCROLL, LDS_JOYSTICK_SCROLL));

        // -- keyboard
        this.SolutionRef.push (new this.Selection(31, DS_KEYBOARD_TEXT, SolKeyboardText));
        this.SolutionRef.push (new this.Selection(31, DS_KEYBOARD_SPECIAL, SolKeyboardSpecial));
        this.SolutionRef.push (new this.Selection(31, DS_KEYBOARD_MODIFIER, SolKeyboardModifier));
        this.SolutionRef.push (new this.Selection(31, DS_UP_DOWN_ARROW_TOGGLE, SolUpDownArrowToggle));
        this.SolutionRef.push (new this.Selection(31, DS_KEYBOARD_SHIFT, SolKeyboardShift));
        this.SolutionRef.push (new this.Selection(31, DS_KEYBOARD_CONTROL, SolKeyboardControl));        
    },
    
    // PUBLIC ENTRY POINT to show solution choice dialogs
    showSolutionDlg: function() {
        // Show the solutions modal dialog 
        document.getElementById("solutionsDlg").style.display = "block";  
        this.updateDisplay();
    },
    
    // PUBLIC ENTRY POINT - when the user clicks on the close button.
    closeIt: function() {
        document.getElementById("solutionsDlg").style.display = "none";
        this.activitySelection = 0;
        this.deviceSelection = 0;
        this.hidePossible();        
    },
    
    // Update all of the dialog, using the user's current selections.
    updateDisplay: function() {
        var chooserBase = document.getElementById("solutionContent");
        while (chooserBase.firstChild) {
            chooserBase.removeChild(chooserBase.lastChild);
        }

        var title = document.createElement("p");
        title.className = "solutionTitle";
        title.innerHTML = ActivityPrompt;
        chooserBase.appendChild(title);

        for (let act of this.Activities){
            var b = document.createElement("input");
            b.type = "button";
            b.className = "activityButton";
            b.value = act.text;
            chooserBase.appendChild(b);
            this.activityButtonAction(b, act);
            if (act.id === this.activitySelection) {
                b.style.backgroundColor = "lightblue";
                var newDiv = document.createElement("div");
                chooserBase.appendChild(newDiv);
                this.showDevices(newDiv, act.id);
            }
        }        
    },
    
    // Show a devices list below the selected activity.
    showDevices: function(deviceDiv, parentID) {
        var title = document.createElement("p");
        title.className = "devicesTitle";
        title.innerHTML = DevicePrompt;
        deviceDiv.appendChild(title);

        for(let device of this.Devices) {        
            if (device.parentid === parentID) {
                var b = document.createElement("input");
                b.type = "button";
                b.className = "deviceButton";
                b.value = device.text;
                if (device.id === this.deviceSelection) {
                    b.style.backgroundColor = "lightblue";
                }
                this.deviceButtonAction(b, device);
                deviceDiv.appendChild(b);
            }
        }        
    },

    // Define what to do when an activity button is pressed.
    activityButtonAction: function(button, activity) {
        let thisRef = this;
        button.onclick = function() {
            thisRef.activitySelection = activity.id;
            thisRef.updateDisplay();
            thisRef.hidePossible();
        };
    },

    // What to do when a device button is clicked.
    // Open a list of available solutions.
    deviceButtonAction: function(btn, device) {
        let thisRef = this;
        btn.onclick = function(event) {
            thisRef.hidePossible();
            thisRef.deviceSelection = device.id;
            thisRef.updateDisplay();
            let theDiv = document.getElementById("possibleSolutions");
            while(theDiv.firstChild) {  // Empty the div.
                theDiv.removeChild(theDiv.lastChild);
            }

            var title = document.createElement("p");
            title.innerHTML = SolutionPrompt;
            title.className = "solutionsTitle";
            theDiv.appendChild(title);

            for (let solRef of thisRef.SolutionRef) {
                if (solRef.deviceid === device.id) {
                    var name;
                    var toolTipText;

                    if (solRef instanceof thisRef.Selection) {
                        name = solRef.solreg.name;
                        toolTipText = solRef.description;
                    } else {
                        name = solRef.name;
                        toolTipText = solRef.shortD;
                    }
                    var innerDiv = document.createElement("div");
                    innerDiv.className = "tooltipdiv";
                    theDiv.appendChild(innerDiv);

                    var b = document.createElement("input");
                    b.type = "button";
                    b.className = "solutionButton";
                    b.value = name;
                    thisRef.solutionButtonAction(b, solRef);
                    innerDiv.appendChild(b);  

                    // Tool tip
                    var tooltip = document.createElement("span");
                    tooltip.className = "tooltip";
                    tooltip.innerHTML = toolTipText;
                    innerDiv.appendChild(tooltip);
                }
            }

            // Position and display the div.
            theDiv.style.display = "block";
            theDiv.style.position = "fixed";
            theDiv.style.top = (event.clientY - 15).toString() + "px";
            theDiv.style.left = (event.clientX + 50).toString() + "px"; 
        };
    },

    hidePossible: function() {
       let theDiv = document.getElementById("possibleSolutions");
       theDiv.style.display = "none";
   },

    // Define the action when a solutions button is pressed
    solutionButtonAction: function(btn, solRef) {
        let thisRef = this;
        btn.onclick = function() {
            if (solRef instanceof thisRef.Reference) {
                thisRef.closeIt();
                showMessageBox("Information", solRef.longD, ["OK"]);
            } else {
                var solreg = solRef.solreg;  // Get solution registry
                var theSolution = solreg.createFunc(solreg); // Create solution
                thisRef.addTab(theSolution);
                thisRef.closeIt();
            }
        };
    },

    // --- New Tab --------------
    // addTab() is called when a solution is actually selected.
    // Code to support the addition of a tab, creation of the Solution object
    // and display of solution settings and options.
    nextID: 0,
    // PUBLIC ENTRY POINT to insert a Solution created by uploading.
    addTab: function(theSolution) {
        this.nextID++;
        var currentID = this.nextID;
        theSolution.id = currentID;  // This id is attached to the solution, tab and content-div.
        let buttonHolder = document.getElementById("tabButtons");
        let contentHolder = document.getElementById("tabContents");

        let tabDiv = document.createElement("div");
        let tabButton = document.createElement("input");
        let tabClose = document.createElement("span");

        tabDiv.className = "tabDivItem";
        tabDiv.myID = currentID;

        tabButton.type = "button";
        tabButton.className = "tabButton";
        tabButton.value = theSolution.name;
        tabButton.myID = currentID;
        let thisRef = this;
        tabButton.onclick = function() {
            thisRef.setActiveTab(currentID);
        };

        tabClose.className = "closeTab";
        tabClose.innerHTML = "&times";
        tabClose.onclick = function() {
            showMessageBox("Please confirm", "Do you want to delete " + theSolution.name + "?", ["Yes", "No"])
                .then( (response) => {
                    if (response === "Yes") {
                        thisRef.removeTab(currentID);
                    }
                });
        };

        tabDiv.appendChild(tabButton);
        tabDiv.appendChild(tabClose);

        buttonHolder.appendChild(tabDiv);

        this.createContent(theSolution, contentHolder, currentID);

        this.setActiveTab(currentID);
    },


    // Update tabs when one is clicked, to adjust its shading
    // (by changing classes) and make the content div visible.
    setActiveTab: function(selectedID) {
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
            if (c.myID === selectedID) {
                c.style.display = "block";
            } else {
                c.style.display = "none";
            }
        }
    },

    createContent: function(theSolution, contentHolder, currentID) {
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

        this.displayContent(theSolution, descriptionDiv, settingsDiv, optionsDiv);
    },

    // Close button is clicked.
    // We need to find and remove the content div, the tab button and 
    // the Solution (in the SolutionList - in solutions.js).
    // PUBLIC ENTRY POINT to clear tabs after an upload.
    removeTab: function(selectedID) {
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
                this.setActiveTab(tabs[0].myID);
            }
        }

        // Remove the solution item from the internal solutions list.
        SolutionList.remove(selectedID);
    },

    displayContent: function(theSolution, descriptionDiv, settingsDiv, optionsDiv) {
        var p = document.createElement("p");
        p.innerHTML = theSolution.description;

        descriptionDiv.appendChild(p);

        for (let setting of theSolution.settings) {
            this.addControlItem(settingsDiv, setting);
        }

        for (let option of theSolution.options) {
            this.addControlItem(optionsDiv, option);
        }
    },

    // theItem is a Widget.  This adds an item to either settings or options
    addControlItem: function(outerDiv, theItem) {
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
};




