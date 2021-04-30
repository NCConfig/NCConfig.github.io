/* 
 * solutions.js
 * 
 * This file holds all of the solutions data ad logic.
 * 
 */

"use strict"

class PortUsage {
    constructor(thePort) {
        this.thePort = thePort;
        this.useCount = 0;
        this.firstUser = null;
        this.secondUser = null;
    }
};

let portMap = {};
let portsWithTwoSingles = [];

let SolutionList = {
    list: [],
    
    add: function(sol) {
        this.list.push(sol);
    },
    
    remove: function(id) {
        var i;
        var found = -1;
        for(i=0; i<this.list.length; i++) {
            if (this.list[i].id == id) {
                found = i;
                break;
            }
        }
        if (found >= 0) {
            this.list.splice(found, 1);
        }       
    },
    
    // This function limits the show-message / promise stuff to 
    // the highest possible level in the code.
    doPortCheck: async function() {
        var self = this;
        var p = new Promise(function (resolve, reject) {
            self.messageTitle = null;
            self.messageBody = null;
            var result = self.portCheck();
            if (self.messageTitle !== null) {
                showMessageBox(self.messageTitle, self.messageBody, ["OK"])
                .then ( () => {
                    resolve(result);
                });                
            } else {
                resolve(result);
            }
        });
        return p;
    },
    
    portCheck: function() {
        portMap = {};
        portsWithTwoSingles = [];
        var portName;
        var pu;
        
        var ok;
        
        for(var sol of this.list) {
            var p1 = sol.getPortUsed();
            if (p1 !== null) {
                ok = this.checkOnePort(sol, p1, sol.sensorCount);
                if(!ok) return false;
            }
            var p2 = sol.getPortBUsed();
            if (p2 !== null) {
                ok = this.checkOnePort(sol, p2, sol.sensorBCount);
                if(!ok) return false;
            }
        }     
        
        // If we get this far there are no show-stopper errors.
        // We may still need to put out warnings about ports with two singles.
        if (portsWithTwoSingles.length > 0) {
            portName = portsWithTwoSingles[0]
            pu = portMap[ portName ];
            this.messageTitle = "Information";
            this.messageBody = "The solutions '" + pu.firstUser.name + "' and '" + 
    pu.secondUser.name + "' are both using " + portName + " for a single button.<br/>" +
    "This is possible.  You may attach two buttons to the port using a splitter " +
    "or you may attach a two-button control to the port.";
        }
        
        // Make sure single-user ports are assigned to subport A
        for(portName in portMap) {
            pu = portMap[portName];
            if (pu.useCount === 1) {
                pu.firstUser.setSubPort(SENSOR_A);
            }
        } 
        return true;
    },
    
    checkOnePort: function(sol, port, sensorCount) {
        let portName = port.name;
        var pu = portMap[portName];
        if (pu === undefined) {
            // First detected use of this port
            pu = new PortUsage(port);
            pu.useCount = sensorCount;
            pu.firstUser = sol;
            portMap[portName] = pu;
            return true;
        } else {
            if ( (pu.useCount + sensorCount > 2) ) {
                if (pu.secondUser === null) {
                    // There are two users.
                    this.messageTitle = "Port Overuse Error";
                    this.messageBody = "The solutions '" + pu.firstUser.name + 
                            "' and '" + sol.name + "' are both using " + 
                            portName + 
                            ".<br/>You need to move one to another port before downloading.";
                    return false;
                } else {
                    // There are three single-button users
                    this.messageTitle = "Port Overuse Error";
                    this.messageBody = "You have assigned three things to " + portName + ":<br/>" +
    "'" + pu.firstUser.name + "', '" + pu.secondUser.name + "' and '" + sol.name + "'.<br/>" +
    "The maximum allowed is two simple buttons.  Please re-assign one of the solutions."
                    return false;
                }
            } else { 
                //Must be two single-button users.
                pu.useCount = pu.useCount + sensorCount;
                pu.secondUser = sol;
                
                pu.firstUser.setSubPort(SENSOR_A);
                pu.secondUser.setSubPort(SENSOR_B);
                
                portsWithTwoSingles.push(portName);
                return true;
            }
        }
        return true;
    },
    
    compile: function() {
 /*       tmpList = [];
        for (var sol of this.list) {
            tmpList.push(sol.getParams());
        } */
 //       var string = JSON.stringify(this.list);
 //       console.log(string);
        Triggers.clear();
        for (var sol of this.list) {
            sol.compile();
        }
    }    
};

class SolutionBase {
    constructor(solReg, description) {
        // solReg is a pointer to an entry in registry.js
        // This is a location where commonly used constant solution 
        // values can be stored.  For now, this is only name, but
        // descriptions and other stuff may be moved there in the future.
        this.name = solReg.name;
        this.description = description;
        this.id = 0;    // This matches the myID member of the content div and the tag button.
                        // It is used when a solution is deleted to find and delete
                        // all related HTML element and objects.
        this.settings = [];
        this.options = [];
        
        // Values used for port usage checks
        this.sensorCount = 1; // Default
        this.sensorBCount = 0;
        this.subPort = SENSOR_A;  // Default
    }
    addSetting(setting) {
        this.settings.push(setting);
    }
    addOption(option) {
        this.options.push(option);
    }
    compile() {
        console.log("Compile not implemented for " + this.name);
    }
    
    // Methods used for port usage checks
    getPortUsed() {
        return null;    // Abstract - overridden by individual solutions
    }
    getPortBUsed() {
        return null;    // Default - can be overridden by individual solutions
    }
    setSubPort(subport) {
        this.subPort = subport;
    }
    
}

// Commonly used questions and prompts
const Q_ONE_BTN_PORT_LOCATION = "The button is connected to:";
const Q_TWO_BTN_PORT_LOCATION = "The buttons are connected to:";
const Q_JOYSTICK_LOCATION = "The joystick is connected to:";
const Q_AUDIO_FEEDBACK = "Add audio feedback for mouse clicks.";
const Q_ENABLE_L_AND_R_CLICKS = "Enable left & right clicks";
const Q_ADD_AUDIO_FEEDBACK_CLICKS = "Add audio feedback for mouse clicks";
const Q_ADD_AUDIO_FEEDBACK_TOGGLE = "Add audio feedback for the toggle button";
const Q_ADD_AUDIO_FEEDBACK_FOR_BTN = "Add audio feedback for button presses.";
const Q_CONNECTION_TYPE = "Connection type:";

// -- Connection Type (wired or bluetooth)

class ConnectionType {
    constructor(name, mouseAction, keybdAction, keycodeFunction) { 
        this.name = name; 
        this.mouseAction = mouseAction;
        this.keybdAction = keybdAction;
        this.getKeyCode = keycodeFunction; // Function takes a keyCode (from keyCodes.js)
                                           // and returns the code value
    }
}
const connectionOptions = [];

function createConnectionOptions() {
    connectionOptions.push( new ConnectionType("Wired", ACT_WIRED_MOUSE, ACT_WIRED_KEYBOARD,
    (keyid) => {return(keyid.wiredCode);} ));
    connectionOptions.push( new ConnectionType("Bluetooth", ACT_BT_MOUSE, ACT_BT_KEYBOARD,
    (keyid) => {return(keyid.btCode);} ));
}

// ======================================================================
// -- SOLUTIONS --------------------------------------------

// -----------------------------------------------------------------
// -- One Button Mouse ------------------------
const LDS_ONE_BTN_MOUSE   = "Control a mouse with a single button. A quick click generates a mouse left-click.<br/>\
Press and hold the button to select cursor control.<br/>\
Releasing after one beep puts the netClé into mouse-up mode. In this mode pressing the button will move the cursor up.<br/>\
You may press and hold to move the cursor quickly, or use quick taps to nudge the cursor to the desired location.<br/>\
Release the button after two beeps and netClé will enter mouse-down mode.<br/>\
Three beeps gets you to mouse-left mode and four gives you mouse-right.<br/>\
When in one of the cursor control modes stop touching the button for 2 seconds and a low beep will announce<br/>\
that the system has reset and you may choose a new mouse direction.";

class OneButtonMouse extends SolutionBase {
    constructor(solreg) {
        super(solreg, LDS_ONE_BTN_MOUSE);
        this.addSetting( new SelectionBox (Q_CONNECTION_TYPE, connectionOptions, connectionOptions[0]));
        this.addSetting( new SelectionBox (Q_ONE_BTN_PORT_LOCATION, portOptions, portOptions[0]));
        this.addOption( new NumericSelector("Length of delay between beeps (in milliseconds):",
            300, 2000, 1000));
        this.addOption( new NumericSelector("The duration of each beep (in milliseconds):",
            50, 400, 250));
    }
    
    getPortUsed() {
        return this.settings[1].getValue();
    }
    
    compile() {
        var connection = this.settings[0].getValue();
        var port = this.settings[1].getValue();
        var delay = this.options[0].getValue();
        var buzzDuration = this.options[1].getValue() ;
/*        
        console.log("Compile " + this.name);
        console.log("  Connection: " + connection.name);
        console.log("  Port: " + port.name);
        console.log("  Delay: " + delay);
        console.log("  Beep: " +  buzzDuration);
  */      
        var sensor = port.getSensor(this.subPort);
        var btnPressed = new TSignal(sensor, 500, TRIGGER_ON_HIGH);
        var btnRelease = new TSignal(sensor, 500, TRIGGER_ON_LOW);

        // Actions
        var mouseAction = connection.mouseAction;
        var mouseUp = new TAction(mouseAction, MOUSE_UP, true);
        var mouseDown = new TAction(mouseAction, MOUSE_DOWN, true);
        var mouseRight = new TAction(mouseAction, MOUSE_RIGHT, true);
        var mouseLeft = new TAction(mouseAction, MOUSE_LEFT, true);
        var leftClick = new TAction(mouseAction, MOUSE_CLICK, false);
                
        var nothing = new TAction(ACT_NONE, 0, false);
        var lowDur = buzzDuration * 2 / 3;
        if (lowDur < 50) lowDur = 50;
        var upBuzz    = getBuzzerAction(800, buzzDuration);
        var downBuzz  = getBuzzerAction(400, buzzDuration);
        var leftBuzz  = getBuzzerAction(600, buzzDuration);
        var rightBuzz = getBuzzerAction(500, buzzDuration);
        var resetBuzz = getBuzzerAction(200, lowDur);
        
        Triggers.add(btnPressed, 1,     0, nothing,   2);
        Triggers.add(btnRelease, 2,     0, leftClick, 1);
        Triggers.add(btnPressed, 2, delay, upBuzz,    3);
        Triggers.add(btnRelease, 3,     0, nothing,   4);
        Triggers.add(btnPressed, 4,     0, mouseUp,   4);
        Triggers.add(btnPressed, 3, delay, downBuzz,  5);
        Triggers.add(btnRelease, 5,     0, nothing,   6);
        Triggers.add(btnPressed, 6,     0, mouseDown, 6);
        Triggers.add(btnPressed, 5, delay, leftBuzz,  7);
        Triggers.add(btnRelease, 7,     0, nothing,   8);
        Triggers.add(btnPressed, 8,     0, mouseLeft, 8);
        Triggers.add(btnPressed, 7, delay, rightBuzz, 9);
        Triggers.add(btnRelease, 9,     0, nothing,   10);
        Triggers.add(btnPressed,10,     0, mouseRight,10);
        Triggers.add(btnRelease, 0, delay*2, resetBuzz, 1);
    }
}

function makeOneButtonMouse(solreg) {
    var sol = new OneButtonMouse(solreg);
    SolutionList.add(sol);
    return sol;
}


// ----------------------------------------------------


// -----------------------------------------------------------------
// -- Two Button Mouse -------------------------------
const LDS_TWO_BTN_MOUSE   = "Control cursor motion with two toggle buttons.<br/>\
    One button controls up & down cursor motion the other controls left & right.<br/>\
    Press a button to move the cursor in one direction. Release the button until you hear a beep and then <br/>\
    press the button again to move the cursor in the opposite direction.<br/>\
    There is a half-second delay before the change of direction takes place.  This makes it possible to use<br/>\
    repeated quick taps to finely adjust the cursor position. "; 

class TwoButtonMouse extends SolutionBase {
    constructor(solreg) {
        super(solreg, LDS_TWO_BTN_MOUSE);
        this.addSetting( new SelectionBox (Q_CONNECTION_TYPE, connectionOptions, connectionOptions[0]));
        this.addSetting( new SelectionBox (Q_TWO_BTN_PORT_LOCATION, portOptions, portOptions[0]));
        this.sensorCount = 2;
    }
    
    getPortUsed() {
        return this.settings[1].getValue();
    }
    
    compile() {
        var connection = this.settings[0].getValue();
        var port = this.settings[1].getValue();
/*         
        console.log("Compile " + this.name);
        console.log("  Connection: " + connection.name);
        console.log("  Port: " + port.name);
  */      
        var sensorA = port.getSensor(SENSOR_A);
        var sensorB = port.getSensor(SENSOR_B);
        
        var btnAPressed = new TSignal(sensorA, 500, TRIGGER_ON_HIGH);
        var btnARelease = new TSignal(sensorA, 500, TRIGGER_ON_LOW);
        var btnBPressed = new TSignal(sensorB, 500, TRIGGER_ON_HIGH);
        var btnBRelease = new TSignal(sensorB, 500, TRIGGER_ON_LOW);
        
        var mouseAction = connection.mouseAction;
        var mouseUp = new TAction(mouseAction, MOUSE_UP, true);
        var mouseDown = new TAction(mouseAction, MOUSE_DOWN, true);
        var mouseRight = new TAction(mouseAction, MOUSE_RIGHT, true);
        var mouseLeft = new TAction(mouseAction, MOUSE_LEFT, true);
        
        var nothing = new TAction(ACT_NONE, 0, false);
        var buzz    = getBuzzerAction(200, 100);
        
        Triggers.add(btnAPressed, 1,    0, nothing,   2);
        Triggers.add(btnAPressed, 2,    0, mouseUp,   2);
        Triggers.add(btnARelease, 2,  500, buzz,      3);
        Triggers.add(btnARelease, 3, 3000, nothing,   1);
        Triggers.add(btnAPressed, 3,    0, nothing,   4);
        Triggers.add(btnAPressed, 4,    0, mouseDown, 4);
        Triggers.add(btnARelease, 4,  500, buzz,      1);
        
        Triggers.add(btnBPressed, 1,    0, nothing,   2);
        Triggers.add(btnBPressed, 2,    0, mouseLeft, 2);
        Triggers.add(btnBRelease, 2,  500, buzz,      3);
        Triggers.add(btnBRelease, 3, 3000, nothing,  1);
        Triggers.add(btnBPressed, 3,    0, nothing,   4);
        Triggers.add(btnBPressed, 4,    0, mouseRight,4);
        Triggers.add(btnBRelease, 4,  500, buzz,      1);       }
 }

function makeTwoButtonMouse(solreg) {
    var sol = new TwoButtonMouse(solreg);
    SolutionList.add(sol);
    return sol;
}

// -----------------------------------------------------------------
// -- Joystick 1 ----------------------------------
const LDS_JOYSTICK_MOUSE1 = "This is a simple control which uses a joystick to move the mouse up, down left and right.<br/>\
    You can optionally add the ability to generate a left- or right-mouse click by giving the joystick a quick left or right tap.";

class JoystickMouse1 extends SolutionBase {
    constructor(solreg) {
        super(solreg, LDS_JOYSTICK_MOUSE1);
        this.addSetting( new SelectionBox (Q_CONNECTION_TYPE, connectionOptions, connectionOptions[0]));
        this.addSetting( new SelectionBox (Q_JOYSTICK_LOCATION, portOptions, portOptions[0]));
        this.addOption( new CheckBox (Q_ENABLE_L_AND_R_CLICKS, false));
        this.addOption( new CheckBox (Q_ADD_AUDIO_FEEDBACK_CLICKS, false));
        this.sensorCount = 2;
    }
    
    getPortUsed() {
        return this.settings[1].getValue();
    }

    compile() {
        var connection = this.settings[0].getValue();
        var port = this.settings[1].getValue();
        var doClicks = this.options[0].getValue();
        var doAudio = this.options[1].getValue();
/*        
        console.log("Compile " + this.name);
        console.log("  Connection: " + connection.name);
        console.log("  Port: " + port.name);
        console.log("  Do Clicks: " + doClicks);
        console.log("  Do Audio: " + doAudio);   
  */      
        var sensorA = port.getSensor(SENSOR_A);
        var sensorB = port.getSensor(SENSOR_B);

        var sAHigh    = new TSignal(sensorA, 700, TRIGGER_ON_HIGH);
        var sANotHigh = new TSignal(sensorA, 700, TRIGGER_ON_LOW);
        var sALow     = new TSignal(sensorA, 250, TRIGGER_ON_LOW);
        var sANotLow  = new TSignal(sensorA, 250, TRIGGER_ON_HIGH);
        var sBHigh    = new TSignal(sensorB, 700, TRIGGER_ON_HIGH);
        var sBLow     = new TSignal(sensorB, 250, TRIGGER_ON_LOW);
        
        var mouseAction = connection.mouseAction;
        var mouseUp = new TAction(mouseAction, MOUSE_UP, true);
        var mouseDown = new TAction(mouseAction, MOUSE_DOWN, true);
        var mouseRight = new TAction(mouseAction, MOUSE_RIGHT, true);
        var mouseLeft = new TAction(mouseAction, MOUSE_LEFT, true);
        var leftClick =  new TAction(mouseAction, MOUSE_CLICK, false);
        var rightClick =  new TAction(mouseAction, MOUSE_RIGHT_CLICK, false);
                
        var nothing = new TAction(ACT_NONE, 0, false);
        var leftBuzz    = getBuzzerAction(400, 150);
        var rightBuzz    = getBuzzerAction(800, 150);
        
        if (!doClicks) {
            // Simple Joystick
            Triggers.add(sAHigh, 1, 0, mouseLeft,  1);
            Triggers.add(sALow , 1, 0, mouseRight, 1);
        } else {            
            // Joystick with L and R click.
            Triggers.add(sALow,    1,   0, nothing,    2);
            Triggers.add(sALow,    2, 300, mouseRight, 3);
            Triggers.add(sALow,    3,   0, mouseRight, 3);
            Triggers.add(sANotLow, 3,   0, nothing,    1);
            if (doAudio) {
                Triggers.add(sANotLow, 2, 20, rightClick, 5);
                Triggers.add(sANotLow, 5,  0, rightBuzz,  1);
            } else {
                Triggers.add(sANotLow, 2, 20, rightClick, 1);                
            }
            Triggers.add(sAHigh,    1,   0, nothing,   6);
            Triggers.add(sAHigh,    6, 300, mouseLeft, 7);
            Triggers.add(sAHigh,    7,   0, mouseLeft, 7);
            Triggers.add(sANotHigh, 7,   0, nothing,   1);
            if (doAudio) {
                Triggers.add(sANotHigh, 6,  20, leftClick, 8);
                Triggers.add(sANotHigh, 8,   0, leftBuzz,  1);
            } else {
                Triggers.add(sANotHigh, 6,  20, leftClick, 1);                
            }
        }
        // Simple up/down
        Triggers.add(sBHigh, 1,  0, mouseDown, 1);
        Triggers.add(sBLow,  1,  0, mouseUp,   1);
    }
}

function makeJoystickMouse1(solreg) {
    var sol = new JoystickMouse1(solreg);
    SolutionList.add(sol);
    return sol;
}

// -----------------------------------------------------------------
// -- Joystick 2 --------------------------------
const LDS_JOYSTICK_MOUSE2 = "Allows a joystick and a button to control mouse motion and scrolling.<br/>\
    When the button is pressed once the joystick up- down-motion will control scrolling.<br/>\
    Pressing the button again returns the joystick to cursor control mode.<br/>\
    If you are using the light box it will indicate whether you are in mouse-moving or scrolling mode.<br/>\
    You can optionally add the ability to generate a left- or right-mouse click by giving the joystick a quick left or right tap.";

class JoystickMouse2 extends SolutionBase {
    constructor(solreg) {
        super(solreg, LDS_JOYSTICK_MOUSE2);
        this.addSetting( new SelectionBox (Q_CONNECTION_TYPE, connectionOptions, connectionOptions[0]));
        this.addSetting( new SelectionBox (Q_JOYSTICK_LOCATION, portOptions, portOptions[0]));
        this.addSetting( new SelectionBox (Q_ONE_BTN_PORT_LOCATION, portOptions, portOptions[0]));
        this.addOption( new CheckBox (Q_ENABLE_L_AND_R_CLICKS, false));
        this.addOption( new CheckBox (Q_ADD_AUDIO_FEEDBACK_CLICKS, false));
        this.addOption( new CheckBox (Q_ADD_AUDIO_FEEDBACK_TOGGLE, false));
        
        this.sensorCount = 2;
        this.sensorBCount = 1;
    }
    
    getPortUsed() {
        return this.settings[1].getValue();
    }
    
    getPortBUsed() {
        return this.settings[2].getValue();
    }
    
    compile() {
        var connection = this.settings[0].getValue();
        var joystickPort = this.settings[1].getValue();
        var buttonPort = this.settings[2].getValue();
        var doClicks = this.options[0].getValue();
        var doAudioClicks = this.options[1].getValue();
        var doAudioToggle = this.options[2].getValue();
/*        
        console.log("Compile " + this.name);
        console.log("  Connection: " + connection.name);
        console.log("  Joystick Port: " + joystickPort.name);
        console.log("  Button Port: " + buttonPort.name);
        console.log("  Do Clicks: " + doClicks);
        console.log("  Do Audio for Clicks: " + doAudioClicks);        
        console.log("  Do Audio for Toggle: " + doAudioToggle);  
  */      
        var joystickA = joystickPort.getSensor(SENSOR_A);
        var joystickB = joystickPort.getSensor(SENSOR_B);
        var btnSensor = buttonPort.getSensor(this.subPort);
                
        var jsAHigh    = new TSignal(joystickA, 700, TRIGGER_ON_HIGH);
        var jsANotHigh = new TSignal(joystickA, 700, TRIGGER_ON_LOW);
        var jsALow     = new TSignal(joystickA, 250, TRIGGER_ON_LOW);
        var jsANotLow  = new TSignal(joystickA, 250, TRIGGER_ON_HIGH);
        var jsBHigh    = new TSignal(joystickB, 700, TRIGGER_ON_HIGH);
        var jsBLow     = new TSignal(joystickB, 250, TRIGGER_ON_LOW);
        var btnPressed = new TSignal(btnSensor, 500, TRIGGER_ON_HIGH);
        var btnRelease = new TSignal(btnSensor, 500, TRIGGER_ON_LOW);
        
        // Mouse actions
        var mouseAction = connection.mouseAction;
        var mouseUp    = new TAction(mouseAction, MOUSE_UP, true);
        var mouseDown  = new TAction(mouseAction, MOUSE_DOWN, true);
        var mouseRight = new TAction(mouseAction, MOUSE_RIGHT, true);
        var mouseLeft  = new TAction(mouseAction, MOUSE_LEFT, true);
        var leftClick  = new TAction(mouseAction, MOUSE_CLICK, false);
        var rightClick = new TAction(mouseAction, MOUSE_RIGHT_CLICK, false);
        var scrollUp   = new TAction(mouseAction, MOUSE_WHEEL_UP, true);
        var scrollDown = new TAction(mouseAction, MOUSE_WHEEL_DOWN, true);
                
        // Other actions
        var nothing = new TAction(ACT_NONE, 0, false);
        var buzzlow    = getBuzzerAction(400, 150);
        var buzzhigh   = getBuzzerAction(800, 150);                
        var light6    = getLightBoxAction(LBO_ONLY, 6);
        var light7    = getLightBoxAction(LBO_ONLY, 7);
        var setState1 = getSetStateAction(joystickB, 1);
        var setState2 = getSetStateAction(joystickB, 2);
        
        if (!doClicks) {
            // Simple Joystick
            Triggers.add(jsAHigh, 1,  0, mouseLeft, 1);
            Triggers.add(jsALow, 1,   0, mouseRight, 1);
        } else {            
            // Joystick with L and R click.
            Triggers.add(jsALow,    1,   0, nothing,    2);
            Triggers.add(jsALow,    2, 300, mouseRight, 3);
            Triggers.add(jsALow,    3,   0, mouseRight, 3);
            Triggers.add(jsANotLow, 3,   0, nothing,    1);
            if (doAudioClicks) {
                Triggers.add(jsANotLow, 2, 20, rightClick, 5);
                Triggers.add(jsANotLow, 5,  0, buzzlow,    1);
            } else {
                Triggers.add(jsANotLow, 2, 20, rightClick, 1);                
            }
            Triggers.add(jsAHigh,    1,   0, nothing,   6);
            Triggers.add(jsAHigh,    6, 300, mouseLeft, 7);
            Triggers.add(jsAHigh,    7,   0, mouseLeft, 7);
            Triggers.add(jsANotHigh, 7,   0, nothing,   1);
            if (doAudioClicks) {
                Triggers.add(jsANotHigh, 6, 20, leftClick, 8);
                Triggers.add(jsANotHigh, 8,  0, buzzlow,   1);
            } else {
                Triggers.add(jsANotHigh, 6, 20, leftClick, 1);                
            }
        }
        // up/down & scrolling
        Triggers.add(jsBHigh, 1, 0, mouseDown, 1);
        Triggers.add(jsBLow,  1, 0, mouseUp,   1);        
        Triggers.add(jsBHigh, 2, 0, scrollDown, 2);
        Triggers.add(jsBLow,  2, 0, scrollUp,   2); 
        
        // Toggle Button
        if (doAudioToggle) {
            Triggers.add(btnPressed, 1, 0, buzzlow, 2);
            Triggers.add(btnPressed, 2, 0, light6,  3);
        } else {
            Triggers.add(btnPressed, 1, 0, light6,  3);
        }
        Triggers.add(btnPressed,     3, 0, setState2, 4);
        Triggers.add(btnRelease,     4, 0, nothing,   5);
        if (doAudioToggle) {
            Triggers.add(btnPressed, 5, 0, buzzhigh, 6);
            Triggers.add(btnPressed, 6, 0, light7,   7);            
        } else {
            Triggers.add(btnPressed, 5, 0, light7,   7);
        }
        Triggers.add(btnPressed,     7, 0, setState1, 8);
        Triggers.add(btnRelease,     8, 0, nothing,   1);
    }
}

function makeJoystickMouse2(solreg) {
    var sol = new JoystickMouse2(solreg);
    SolutionList.add(sol);
    return sol;
}

// -----------------------------------------------------------------
// -- Gyro Mouse --------------------------------
const LDS_GYRO_MOUSE      = "Allows the use of head motions to control the cursor.<br/>\
    Attach the cursor to side of the head using a head band, the arm of a pair of glassed or a cap<br/>\
    with the wire hanging straight down.<br/>\
    Before using press the <i>Calibrate</i> button and follow the instructions.";
class GyroPosition {
    constructor(name) { 
        this.name = name; 
    }
}

const GM_RIGHT_CLICK_OPTION = "Do a right click with a quick right head motion.";
const GM_LEFT_CLICK_OPTION = "Do a left click with a quick nod.";
const GM_HEAD_TILT_OPTION = "A head tilt can be used to turn the gyro on and off.";
const LEFT_SIDE = "left side";
const RIGHT_SIDE = "right side";
const gyroPositions = [];
gyroPositions.push( new GyroPosition(LEFT_SIDE) );
gyroPositions.push( new GyroPosition(RIGHT_SIDE) );

class GyroMouse extends SolutionBase {
    constructor(solreg) {
        super(solreg, LDS_GYRO_MOUSE);
        this.addSetting( new SelectionBox (Q_CONNECTION_TYPE, connectionOptions, connectionOptions[0]));
        this.addSetting( new SelectionBox ("I will place the gyro on the ", gyroPositions, gyroPositions[0]));
        this.addSetting( new Slider("Sensitivity", 0, 100, 50) );
        var btn = new Button("Calibrate");
        btn.button.onclick = doCalibration;
        this.addSetting( btn );
        
        this.addOption( new CheckBox (GM_LEFT_CLICK_OPTION, false));
        this.addOption( new CheckBox (GM_RIGHT_CLICK_OPTION, false));
        this.addOption( new CheckBox (GM_HEAD_TILT_OPTION, false));
        this.sensorCount = 0;
        
        // Defaults - until calibration is run.
        this.yBias = 0;
        this.zBias = 0;
        this.tiltThreshold = -2000;
        this.tiltIsNegative = false;
    }
    
    compile() {
        var connection  = this.settings[0].getValue();
        var side        = this.settings[1].getValue();
        var sensitivity = this.settings[2].getValue();
        var leftClickOp  = this.options[0].getValue();
        var rightClickOp = this.options[1].getValue();
        var tiltOption = this.options[2].getValue();
        
        if (CalibrationData.calibrationDone) {
            this.yBias = CalibrationData.gyroYBias;
            this.zBias = CalibrationData.gyroZBias;
            this.tiltThreshold = CalibrationData.tiltPoint;
            this.tiltIsNegative = CalibrationData.tiltIsNegative;
        }

        // Default thresholds.
        var z_threshold = 2500 - (sensitivity-50) * 30;
        var y_threshold = 3500 - (sensitivity-50) * 30;
/*
        console.log("Compile " + this.name);
        console.log("  Connection: " + connection.name);
        console.log("  Side: " + side.name);
        console.log("  Sensitivity: " + sensitivity);
        console.log("  Left Click: " + leftClickOp);
        console.log("  Right Click: " + rightClickOp);
        console.log("  Head Tilt: " + tiltOption);
        console.log("  yBias: " + this.yBias);
        console.log("  zBias: " + this.zBias);
        console.log("  tilt threshold: " + this.tiltThreshold);
        console.log("  tilt is negative: " + this.tiltIsNegative);
 */       
        var mouseAction = connection.mouseAction;
        var mouseUp    = new TAction(mouseAction, MOUSE_UP, true);
        var mouseDown  = new TAction(mouseAction, MOUSE_DOWN, true);
        var mouseRight = new TAction(mouseAction, MOUSE_RIGHT, true);
        var mouseLeft  = new TAction(mouseAction, MOUSE_LEFT, true);
        var leftClick  = new TAction(mouseAction, MOUSE_CLICK, false);
        var rightClick = new TAction(mouseAction, MOUSE_RIGHT_CLICK, false);
        
        // Actions used in sub-routines.
        this.nothing = new TAction(ACT_NONE, 0, false);
        this.buzzLo    = getBuzzerAction(400, 250);
        this.buzzVLo    = getBuzzerAction(250, 50);
        this.buzzHi    = getBuzzerAction(800, 100);                
        
        // ------------------------------
        // Left-Right
        this.genSimple(SENSOR_GYRO_Y, y_threshold, this.yBias, true, mouseLeft, 2);
        if (rightClickOp) {
            this.genWithClicks(SENSOR_GYRO_Y, y_threshold, this.yBias, false, mouseRight, rightClick);
        } else {
            this.genSimple(SENSOR_GYRO_Y, y_threshold, this.yBias, false, mouseRight, 4);
        }
        
        // ------------------------------
        // Up-Down
        if (side.name === LEFT_SIDE) {
            this.genSimple(SENSOR_GYRO_Z, z_threshold, this.zBias, true, mouseUp, 2);
            if (leftClickOp) {
                this.genWithClicks(SENSOR_GYRO_Z, z_threshold, this.zBias, false, mouseDown, leftClick);
            } else {
                this.genSimple(SENSOR_GYRO_Z, z_threshold, this.zBias, false, mouseDown, 4);
            }
        } else {
            this.genSimple(SENSOR_GYRO_Z, z_threshold, this.zBias, false, mouseUp, 2);
            if (leftClickOp) {
                this.genWithClicks(SENSOR_GYRO_Z, z_threshold, this.zBias, true, mouseDown, leftClick);                
            } else {
                this.genSimple(SENSOR_GYRO_Z, z_threshold, this.zBias, true, mouseDown, 4);    
            }
        }
        
        // ------------------------------------------
        // Left tilt to turn the gyro on and off.
        if (tiltOption) {
            var gyroYOff = getSetStateAction(SENSOR_GYRO_Y, 9);
            var gyroZOff = getSetStateAction(SENSOR_GYRO_Z, 9);
            var gyroYOn  = getSetStateAction(SENSOR_GYRO_Y, 1);
            var gyroZOn  = getSetStateAction(SENSOR_GYRO_Z, 1);
            var offBeep   = getBuzzerAction(200, 500);
            var readyBeep = getBuzzerAction(800, 100);
            var onBeep    = getBuzzerAction(1200, 100);

            var low, high;
            if (this.tiltIsNegative) {
                low = new TSignal(SENSOR_ACCEL_Z, this.tiltThreshold, TRIGGER_ON_LOW);
                high = new TSignal(SENSOR_ACCEL_Z, this.tiltThreshold, TRIGGER_ON_HIGH);
             } else {
                low = new TSignal(SENSOR_ACCEL_Z, this.tiltThreshold, TRIGGER_ON_HIGH);
                high = new TSignal(SENSOR_ACCEL_Z, this.tiltThreshold, TRIGGER_ON_LOW);
             }           
             
            Triggers.add(low,  1,    0, gyroYOff,  2);
            Triggers.add(low,  2,    0, gyroZOff,  3);
            Triggers.add(low,  3,    0, offBeep,   4);
            Triggers.add(high, 4,  500, this.nothing,   8);
            Triggers.add(high, 6,    0, gyroYOn,   7);
            Triggers.add(high, 7,    0, gyroZOn,   1);
            Triggers.add(low,  8,    0, readyBeep, 9);
            Triggers.add(high, 9,  100, onBeep,    6);
        }       
    }    
    
    genSimple(sensor, threshold, bias, startLow, func, next) {
        var low, notLow, high, notHigh;
        
        if (startLow) {
            low = new TSignal(sensor, -threshold+bias, TRIGGER_ON_LOW);
            high = new TSignal(sensor, threshold+bias, TRIGGER_ON_HIGH);
        } else {
            // Reverse high-low sense
            high = new TSignal(sensor, -threshold + bias, TRIGGER_ON_LOW);
            low = new TSignal(sensor, threshold + bias, TRIGGER_ON_HIGH);            
        }
        notLow = low.not();
        notHigh = high.not();
        
        // Left-Right
        Triggers.add(low,          1,  80, this.buzzLo,  next);
        Triggers.add(notLow,    next,   0, func,    next);
        Triggers.add(high,      next,  50, this.buzzVLo, next+1);
        Triggers.add(notHigh, next+1, 250, this.nothing, 1);        
    }
    
    genWithClicks(sensor, threshold, bias, startLow, func1, func2) {
        var low, notLow, high, notHigh;
        
        if (startLow) {
            low = new TSignal(sensor, -threshold + bias, TRIGGER_ON_LOW);
            high = new TSignal(sensor, threshold + bias, TRIGGER_ON_HIGH);
        } else {
            // Reverse high-low sense
            high = new TSignal(sensor, -threshold + bias, TRIGGER_ON_LOW);
            low = new TSignal(sensor, threshold + bias, TRIGGER_ON_HIGH);            
        }
        notLow = low.not();
        notHigh = high.not();
    
        Triggers.add(low,     1,  80, this.buzzLo,  4);
        Triggers.add(notLow,  4, 300, func1,   5);
        Triggers.add(notHigh, 5,   0, func1,   5);
        Triggers.add(high,    5,  50, this.buzzVLo, 8);
        Triggers.add(high,    4,  50, this.buzzHi,  7);
        Triggers.add(notHigh, 7,   0, func2,   8);
        Triggers.add(notHigh, 8, 250, this.nothing, 1);
    }
}
    

function makeGyroMouse(solreg) {
    var sol = new GyroMouse(solreg);
    SolutionList.add(sol);
    return sol;
}

// -----------------------------------------------------------------
// -- Left Click Button -----------------------------------
const LDS_LEFT_CLICK       = "The button generates a left-click when pressed.";
class LeftClickButton extends SolutionBase {
    constructor(solreg) {
        super(solreg, LDS_LEFT_CLICK);
        this.addSetting( new SelectionBox (Q_CONNECTION_TYPE, connectionOptions, connectionOptions[0]));
        this.addSetting( new SelectionBox (Q_ONE_BTN_PORT_LOCATION, portOptions, portOptions[0]));
        this.addOption( new CheckBox (Q_ADD_AUDIO_FEEDBACK_CLICKS, false));
    }

    getPortUsed() {
        return this.settings[1].getValue();
    }
    
    compile() {
        var connection = this.settings[0].getValue();
        var port = this.settings[1].getValue();
        var doAudio = this.options[0].getValue();
 /*                       
        console.log("Compile " + this.name);
        console.log("  Connection: " + connection.name);
        console.log("  Port: " + port.name);
        console.log("  Do Audio: " + doAudio);
   */     
        var sensor = port.getSensor(this.subPort);
        var btnPressed = new TSignal(sensor, 500, TRIGGER_ON_HIGH);

        var leftClick  = new TAction(connection.mouseAction, MOUSE_CLICK, false);
         
        Triggers.add(btnPressed, 1,  0, leftClick, 1); 
        
        if (doAudio) {
            var buzz = getBuzzerAction(400, 100);
            Triggers.add(btnPressed, 1,  0, buzz, 1);
        }
   }
}

function makeLeftClickButton(solreg) {
    var sol = new LeftClickButton(solreg);
    SolutionList.add(sol);
    return sol;;
}

// -----------------------------------------------------------------
// -- Right Click Button -----------------------------------
const LDS_RIGHT_CLICK      = "The button generates a right-click when pressed.";
class RightClickButton extends SolutionBase {
    constructor(solreg) {
        super(solreg, LDS_RIGHT_CLICK);
        this.addSetting( new SelectionBox (Q_CONNECTION_TYPE, connectionOptions, connectionOptions[0]));
        this.addSetting( new SelectionBox (Q_ONE_BTN_PORT_LOCATION, portOptions, portOptions[0]));
        this.addOption( new CheckBox (Q_ADD_AUDIO_FEEDBACK_CLICKS, false));
    }
    
    getPortUsed() {
        return this.settings[1].getValue();
    }
    
    compile() {
        var connection = this.settings[0].getValue();
        var port = this.settings[1].getValue();
        var doAudio = this.options[0].getValue();
/*        
        console.log("Compile " + this.name);
        console.log("  Connection: " + connection.name);
        console.log("  Port: " + port.name);
        console.log("  Do Audio: " + doAudio);
        */
        var sensor = port.getSensor(this.subPort);
        var btnPressed = new TSignal(sensor, 500, TRIGGER_ON_HIGH);

        var rightClick = new TAction(connection.mouseAction, MOUSE_RIGHT_CLICK, false);
         
        Triggers.add(btnPressed, 1,  0, rightClick, 1); 
        
        if (doAudio) {
            var buzz = getBuzzerAction(400, 100);
            Triggers.add(btnPressed, 1,  0, buzz, 1);
        }
    }
 }

function makeRightClickButton(solreg) {
    var sol = new RightClickButton(solreg);
    SolutionList.add(sol);
    return sol;;
}

// -----------------------------------------------------------------
// -- Left Press-Release Toggle -----------------------------------
const LDS_LEFT_PRESS_RELEASE_TOGGLE = "When the button is pressed a left-button press-and-hold action is generated.<br/>\
Pressing the button again generates a left-button release.<br/>\
Thus, you can tap the button, move the cursor and then tap the button again to perform a drag and drop operation.<br/>\
This enables drag and drop for someone who has difficulty pressing and holding a button.";
class LeftPressReleaseToggle extends SolutionBase {
    constructor(solreg) {
        super(solreg, LDS_LEFT_PRESS_RELEASE_TOGGLE);
        this.addSetting( new SelectionBox (Q_CONNECTION_TYPE, connectionOptions, connectionOptions[0]));
        this.addSetting( new SelectionBox (Q_ONE_BTN_PORT_LOCATION, portOptions, portOptions[0]));
        this.addOption( new CheckBox (Q_ADD_AUDIO_FEEDBACK_CLICKS, false));
    }
    
    getPortUsed() {
        return this.settings[1].getValue();
    }
    
    compile() {
        var connection = this.settings[0].getValue();
        var port = this.settings[1].getValue();
        var doAudio = this.options[0].getValue();
 /*               
        console.log("Compile " + this.name);
        console.log("  Connection: " + connection.name);
        console.log("  Port: " + port.name);
        console.log("  Do Audio: " + doAudio);
*/
        var sensor = port.getSensor(this.subPort);
        var btnPressed = new TSignal(sensor, 500, TRIGGER_ON_HIGH);
        var btnRelease = new TSignal(sensor, 500, TRIGGER_ON_LOW);
        
        var press   = new TAction(connection.mouseAction, MOUSE_PRESS, false);
        var release = new TAction(connection.mouseAction, MOUSE_RELEASE, false);
        var nothing = new TAction(ACT_NONE, 0, false);
        var buzz = getBuzzerAction(200, 100);
        var hibuzz = getBuzzerAction(800, 100);
        
        if ( doAudio ) {
            Triggers.add(btnPressed, 1, 0, buzz,      1);
        }
        Triggers.add(btnPressed, 1,   0, press,     2);            
        Triggers.add(btnRelease, 2,   0, nothing,   3);
        if ( doAudio ) {
            Triggers.add(btnPressed, 3, 0, hibuzz ,   3);
        }
        Triggers.add(btnPressed, 3,   0, release,   4);
        Triggers.add(btnRelease, 4,   0, nothing,   1);        
    }
 }

function makeLeftPressReleaseToggle(solreg) {
    var sol = new LeftPressReleaseToggle(solreg);
    SolutionList.add(sol);
    return sol;;
}

// -----------------------------------------------------------------
// -- Left Button Emulation -----------------------------------
const LDS_LEFT_EMULATION   = "The button acts exactly like the left-mouse button.<br/>\
It is pressed when pressed, remains pressed when held and is released when released.";
class LeftButtonEmulation extends SolutionBase {
    constructor(solreg) {
        super(solreg, LDS_LEFT_EMULATION);
        this.addSetting( new SelectionBox (Q_CONNECTION_TYPE, connectionOptions, connectionOptions[0]));
        this.addSetting( new SelectionBox (Q_ONE_BTN_PORT_LOCATION, portOptions, portOptions[0]));
    }
    
    getPortUsed() {
        return this.settings[1].getValue();
    }
    
    compile() {
        var connection = this.settings[0].getValue();
        var port = this.settings[1].getValue();
/*        
        console.log("Compile " + this.name);
        console.log("  Connection: " + connection.name);
        console.log("  Port: " + port.name);
  */      
        var sensor = port.getSensor(this.subPort);
        var btnPressed = new TSignal(sensor, 500, TRIGGER_ON_HIGH);
        var btnRelease = new TSignal(sensor, 500, TRIGGER_ON_LOW);

        var press   = new TAction(connection.mouseAction, MOUSE_PRESS, false);
        var release = new TAction(connection.mouseAction, MOUSE_RELEASE, false);
                
        Triggers.add(btnPressed, 1, 0, press,   2); 
        Triggers.add(btnRelease, 2, 0, release, 1);         
    }
}

function makeLeftButtonEmulation(solreg) {
    var sol = new LeftButtonEmulation(solreg);
    SolutionList.add(sol);
    return sol;;
}

// -----------------------------------------------------------------
// -- Three Function Button -----------------------------------
const LDS_THREE_FUNC_BUTTON  = "This provides the most useful mouse-click functions in a single button.<br/>\
Tap it once to generate a left-click.<br/>\
Press and hold the button, releasing after one beep to generate a right-click.<br/>\
Release after two beeps to generate a left-mouse press-and-hold, initiating drag and drop.<br/>\
Use a quick tap to release the held button.";
class ThreeFunctionButton extends SolutionBase {
    constructor(solreg) {
        super(solreg, LDS_THREE_FUNC_BUTTON, solreg);
        this.addSetting( new SelectionBox (Q_CONNECTION_TYPE, connectionOptions, connectionOptions[0]));
        this.addSetting( new SelectionBox (Q_ONE_BTN_PORT_LOCATION, portOptions, portOptions[0]));
    }
    
    getPortUsed() {
        return this.settings[1].getValue();
    }
    
    compile() {
        var connection = this.settings[0].getValue();
        var port = this.settings[1].getValue();
/*        
        console.log("Compile " + this.name);
        console.log("  Connection: " + connection.name);
        console.log("  Port: " + port.name);
  */      
        var sensor = port.getSensor(this.subPort);
        var btnPressed = new TSignal(sensor, 500, TRIGGER_ON_HIGH);
        var btnRelease = new TSignal(sensor, 500, TRIGGER_ON_LOW);
        
        var mouseAction = connection.mouseAction;
        var mouseLClick = new TAction(mouseAction, MOUSE_CLICK, false);
        var mouseRClick = new TAction(mouseAction, MOUSE_RIGHT_CLICK, false);
        var mouseLPress = new TAction(mouseAction, MOUSE_PRESS, false);
        var nothing = new TAction(ACT_NONE, 0, false);
        var hibuzz = getBuzzerAction(400, 100);
        
        Triggers.add(btnPressed, 1,   0, nothing,     2);
        Triggers.add(btnRelease, 2,   0, mouseLClick, 1);
        Triggers.add(btnPressed, 2, 500, hibuzz,      3);
        Triggers.add(btnRelease, 3,   0, mouseRClick, 1);
        Triggers.add(btnPressed, 3, 500, hibuzz,      4);
        Triggers.add(btnRelease, 4,   0, mouseLPress, 1);
    }
 }

function makeThreeFunctionButton(solreg) {
    var sol = new ThreeFunctionButton(solreg);
    SolutionList.add(sol);
    return sol;;
}

// -----------------------------------------------------------------
// -- Left-Right click buttons -----------------------------------
const LDS_LEFT_RIGHT_CLICK     = "One button generates a left-click, the other generates a right-click.";

class LeftRightClick extends SolutionBase {
    constructor(solreg) {
        super(solreg, LDS_LEFT_RIGHT_CLICK);
        this.addSetting( new SelectionBox (Q_CONNECTION_TYPE, connectionOptions, connectionOptions[0]));
        this.addSetting( new SelectionBox (Q_TWO_BTN_PORT_LOCATION, portOptions, portOptions[0]));
        this.addOption( new CheckBox (Q_ADD_AUDIO_FEEDBACK_CLICKS, false));
        
        this.sensorCount = 2;
    }
    
    getPortUsed() {
        return this.settings[1].getValue();
    }
    
    compile() {
        var connection = this.settings[0].getValue();
        var port = this.settings[1].getValue();
        var doAudio = this.options[0].getValue();
/*        
        console.log("Compile " + this.name);
        console.log("  Connection: " + connection.name);
        console.log("  Port: " + port.name);
        console.log("  Do Audio: " + doAudio);
  */      
        var sensorA = port.getSensor(SENSOR_A);
        var sensorB = port.getSensor(SENSOR_B);
        var btnAPressed = new TSignal(sensorA, 500, TRIGGER_ON_HIGH);
        var btnBPressed = new TSignal(sensorB, 500, TRIGGER_ON_HIGH);
        
        var mouseLClick = new TAction(connection.mouseAction, MOUSE_CLICK, false);
        var mouseRClick = new TAction(connection.mouseAction, MOUSE_RIGHT_CLICK, false);
        var buzz = getBuzzerAction(200, 100);
        
        Triggers.add(btnAPressed, 1, 0, mouseLClick, 1);
        Triggers.add(btnBPressed, 1, 0, mouseRClick, 1);
        if ( doAudio ) {
            Triggers.add(btnAPressed, 1, 0, buzz, 1);
            Triggers.add(btnBPressed, 1, 0, buzz, 1);                
        }        
    }
 }

function makeLeftRightClick(solreg) {
    var sol = new LeftRightClick(solreg);
    SolutionList.add(sol);
    return sol;;
}

// -----------------------------------------------------------------
// -- Redirects -----------------------------------
const LDS_JOYSTICK_CLICKS = "There is an option to generate left- and right-clicks using quick \
left and right motions with the <i>Joystick Mouse.</i> \
To enable this select <i>Joystick Mouse</i> or <i>Joystick Plus</i> \
under <i>Control Cursor Motion</i> and then select the \
<i>Enable left & right mouse clicks</i> option.";
const LDS_GYRO_CLICKS     = "There is an option to generate left- and right-clicks using quick \
head motions with the <i>Gyro Mouse</i>. \
To enable this select <i>Gyro Mouse</i> under <i>Control Cursor Motion</i> \
and then select the appropriate options.";

// -- SCROLLING
// 
// -----------------------------------------------------------------
// -- Scroll Up Down Toggle  -----------------------------------
const LDS_SCROLL_UP_DOWN_TOGGLE  = "One button toggles between scrolling up and scrolling down.<br/>\
Press the button to move scroll down. Release the button until you hear a beep and then \
press the button again to scroll up.<br/>\
There is a half-second delay before the change of direction takes place.  This makes it possible to use \
repeated quick taps to finely adjust the scroll position.";               
class ScrollUpDownToggle extends SolutionBase {
    constructor(solreg) {
        super(solreg, LDS_SCROLL_UP_DOWN_TOGGLE);
        this.addSetting( new SelectionBox (Q_CONNECTION_TYPE, connectionOptions, connectionOptions[0]));
        this.addSetting( new SelectionBox (Q_ONE_BTN_PORT_LOCATION, portOptions, portOptions[0]));
    }
    
    getPortUsed() {
        return this.settings[1].getValue();
    }
    
    compile() {
        var connection = this.settings[0].getValue();
        var port = this.settings[1].getValue();
 /*       
        console.log("Compile " + this.name);
        console.log("  Connection: " + connection.name);
        console.log("  Port: " + port.name);
   */     
        var sensor = port.getSensor(this.subPort);
        var btnPressed = new TSignal(sensor, 500, TRIGGER_ON_HIGH);
        var btnRelease = new TSignal(sensor, 500, TRIGGER_ON_LOW);
                
        var scrollUp = new TAction(connection.mouseAction, MOUSE_WHEEL_UP, true);
        var scrollDown = new TAction(connection.mouseAction, MOUSE_WHEEL_DOWN, true);
        var nothing = new TAction(ACT_NONE, 0, false);
        var buzz   = getBuzzerAction(200, 100);
        var hibuzz = getBuzzerAction(800, 100);
        
        Triggers.add(btnPressed, 1,    0, nothing,   2);
        Triggers.add(btnPressed, 2,    0, scrollDown,2);
        Triggers.add(btnRelease, 2,  800, buzz,      3);
        Triggers.add(btnRelease, 3, 3000, hibuzz,    1);
        Triggers.add(btnPressed, 3,    0, nothing,   4);
        Triggers.add(btnPressed, 4,    0, scrollUp,  4);
        Triggers.add(btnRelease, 4,  800, buzz,      1);
    }
 }

function makeScrollUpDownToggle(solreg) {
    var sol = new ScrollUpDownToggle(solreg);
    SolutionList.add(sol);
    return sol;;
}

// -----------------------------------------------------------------
// -- Scroll Up Down Buttons -----------------------------------
const LDS_SCROLL_UP_DOWN  = "One button scrolls up, the other scrolls down.";
class ScrollUpDownButtons extends SolutionBase {
    constructor(solreg) {
        super(solreg, LDS_LEFT_RIGHT_CLICK);
        this.addSetting( new SelectionBox (Q_CONNECTION_TYPE, connectionOptions, connectionOptions[0]));
        this.addSetting( new SelectionBox (Q_TWO_BTN_PORT_LOCATION, portOptions, portOptions[0]));
        this.addOption( new CheckBox (Q_ADD_AUDIO_FEEDBACK_FOR_BTN, false));
        
        this.sensorCount = 2;
    }
    
    getPortUsed() {
        return this.settings[1].getValue();
    }
    
    compile() {
        var connection = this.settings[0].getValue();
        var port = this.settings[1].getValue();
        var doAudio = this.options[0].getValue();
/*       
        console.log("Compile " + this.name);
        console.log("  Connection: " + connection.name);
        console.log("  Port: " + port.name);
        console.log("  Do Audio: " + doAudio);
  */      
        var sensorA = port.getSensor(SENSOR_A);
        var sensorB = port.getSensor(SENSOR_B);
        var btnAPressed = new TSignal(sensorA, 500, TRIGGER_ON_HIGH);
        var btnBPressed = new TSignal(sensorB, 500, TRIGGER_ON_HIGH);
        
        var scrollUp   = new TAction(connection.mouseAction, MOUSE_WHEEL_UP, true);
        var scrollDown = new TAction(connection.mouseAction, MOUSE_WHEEL_DOWN, true);
        var buzz = getBuzzerAction(200, 100);
        
        Triggers.add(btnAPressed, 1, 0, scrollUp, 1);
        Triggers.add(btnBPressed, 1, 0, scrollDown, 1);
        if ( doAudio ) {
            Triggers.add(btnAPressed, 1, 0, buzz, 1);
            Triggers.add(btnBPressed, 1, 0, buzz, 1);                
        }        
    }
 }

function makeScrollUpDownButtons(solreg) {
    var sol = new ScrollUpDownButtons(solreg);
    SolutionList.add(sol);
    return sol;;
}
// -----------------------------------------------------------------
// -- Redirect -----------------------------------
const LDS_JOYSTICK_SCROLL = "<i>Joystick Plus</i> (under <i>Control Cursor Motion</i>) \
allows the joystick to be used for both cursor control and scrolling.";


// -- KEYBOARD
// -----------------------------------------------------------------
// -- Keyboard Text -----------------------------------
const LDS_KEYBOARD_TEXT     = "Send up to 20 characters (optionally ending with RETURN) \
by pressing a single button.";
class KeyboardText extends SolutionBase {
    constructor(solreg) {
        super(solreg, LDS_KEYBOARD_TEXT);
        this.addSetting( new SelectionBox (Q_CONNECTION_TYPE, connectionOptions, connectionOptions[0]));
        this.addSetting( new SelectionBox (Q_ONE_BTN_PORT_LOCATION, portOptions, portOptions[0]));
        this.addSetting( new TextBox ("Text: ", 20));
        this.addOption( new CheckBox ("End with RETURN.", false));
    }
    
    getPortUsed() {
        return this.settings[1].getValue();
    }
    
    compile() {
        var connection = this.settings[0].getValue();
        var port = this.settings[1].getValue();
        var text = this.settings[2].getValue();
        var addReturn = this.options[0].getValue();
/*        
        console.log("Compile " + this.name);
        console.log("  Connection: " + connection.name);
        console.log("  Port: " + port.name);
        console.log("  Text: " + text);
        console.log("  Return: " + addReturn);
  */      
        var sensor = port.getSensor(this.subPort);
        var btnPressed = new TSignal(sensor, 500, TRIGGER_ON_HIGH);
        
        let i = 0;
        while(i < text.length) {
            let end = i + 4;
            if (end > (text.length)) end = text.length;
            var data = text.slice(i, end);
            // Convert data - as string - to a 32-bit parameter number.
            var value = 0;
            for(let j=0; j < data.length; j++) {
                value = (value << 8) + data.charCodeAt(j);
            }
            var keys = new TAction(connection.keybdAction, value, false);
            i = end;
            Triggers.add(btnPressed, 1, 0, keys, 1);
        }
        
        if ( addReturn ) {
            var returnKey = new TAction(connection.keybdAction, connection.getKeyCode(RETURN_KEY), false);
            Triggers.add(btnPressed, 1,  0, returnKey, 1);            
        }        
    }
 }

function makeKeyboardText(solreg) {
    var sol = new KeyboardText(solreg);
    SolutionList.add(sol);
    return sol;;
}

// -----------------------------------------------------------------
// -- Keyboard Special -----------------------------------
const LDS_KEYBOARD_SPECIAL  = "Send a special character (e.g. Page Up, Home or F3).";
class KeyboardSpecial extends SolutionBase {
    constructor(solreg) {
        super(solreg, LDS_KEYBOARD_SPECIAL);
        this.addSetting( new SelectionBox (Q_CONNECTION_TYPE, connectionOptions, connectionOptions[0]));
        this.addSetting( new SelectionBox (Q_ONE_BTN_PORT_LOCATION, portOptions, portOptions[0]));
        this.addSetting( new SpecialKeys("Special Key "));
    }
    
    getPortUsed() {
        return this.settings[1].getValue();
    }
    
    compile() {
        var connection = this.settings[0].getValue();
        var port = this.settings[1].getValue();
        var key = this.settings[2].getValue();
 /*       
        console.log("Compile " + this.name);
        console.log("  Connection: " + connection.name);
        console.log("  Port: " + port.name);
        console.log("  Key:  " + key.name);
   */     
        var sensor = port.getSensor(this.subPort);
        var btnPressed = new TSignal(sensor, 500, TRIGGER_ON_HIGH);

        var action = new TAction(connection.keybdAction, connection.getKeyCode(key), false);
        
        Triggers.add(btnPressed, 1,  0, action, 1);         
    }
 }

function makeKeyboardSpecial(solreg) {
    var sol = new KeyboardSpecial(solreg);
    SolutionList.add(sol);
    return sol;;
}

// -----------------------------------------------------------------
// -- Keyboard Modifier -----------------------------------
const LDS_KEYBOARD_MODIFIER = "Sometimes it can be difficult to press two keys at the same time.<br/>\
This can make it impossible to type things like control+C.<br/>\
This solution allows you to create a button that will send a modifier key (like shift or control) \
and a regular key with a single press.";
class KeyboardModifier extends SolutionBase {
    constructor(solreg) {
        super(solreg, LDS_KEYBOARD_MODIFIER);
        this.addSetting( new SelectionBox (Q_ONE_BTN_PORT_LOCATION, portOptions, portOptions[0], "setting"));
        this.addSetting( new ModifierKeys("Modifier Key "));
        this.addSetting( new NotModifierKeys("Key Press "));
    }
    
    getPortUsed() {
        return this.settings[0].getValue();
    }
    
    compile() {
        var port = this.settings[0].getValue();
        var modifier  = this.settings[1].getValue();
        var key = this.settings[2].getValue();
/*        
        console.log("Compile " + this.name);
        console.log("  Port: " + port.name);
        console.log("  Modifier:" + modifier.name);
        console.log("  Key:     " + key.name);
  */      
        var sensor = port.getSensor(this.subPort);
        var btnPressed = new TSignal(sensor, 500, TRIGGER_ON_HIGH);

        var code = KEY_MODIFIER + (modifier.wiredCode << 8) + key.wiredCode;
        var action = new TAction(ACT_WIRED_KEYBOARD, code, false);
        
        Triggers.add(btnPressed, 1,  0, action, 1);         
    }
 }

function makeKeyboardModifier(solreg) {
    var sol = new KeyboardModifier(solreg);
    SolutionList.add(sol);
    return sol;;
}

// -----------------------------------------------------------------
// -- Up-Down Arrow Toggle -----------------------------------
const LDS_UP_DOWN_ARROW_TOGGLE    = "One button which generates up- and down- arrow keystrokes.<br/>\
Press the button to send a down-arrow. Release the button until you hear a beep and then \
press the button again to send an up-arrow.<br/>\
There is a half-second delay before the change of direction takes place, allowing the use of \
repeated quick taps to make fine adjustments."; 
class KeyboardUpDownArrowToggle extends SolutionBase {
    constructor(solreg) {
        super(solreg, LDS_UP_DOWN_ARROW_TOGGLE);
        this.addSetting( new SelectionBox (Q_CONNECTION_TYPE, connectionOptions, connectionOptions[0]));
        this.addSetting( new SelectionBox (Q_ONE_BTN_PORT_LOCATION, portOptions, portOptions[0], "setting"));
    }
    
    getPortUsed() {
        return this.settings[1].getValue();
    }
    
    compile() {
        var connection = this.settings[0].getValue();
        var port = this.settings[1].getValue();
/*        
        console.log("Compile " + this.name);
        console.log("  Connection: " + connection.name);
        console.log("  Port: " + port.name);
  */      
        var sensor = port.getSensor(this.subPort);
        var btnPressed = new TSignal(sensor, 500, TRIGGER_ON_HIGH);
        var btnRelease = new TSignal(sensor, 500, TRIGGER_ON_LOW);
                
        var upArrow   = new TAction(connection.keybdAction, connection.getKeyCode(UP_ARROW_KEY), true);
        var downArrow = new TAction(connection.keybdAction, connection.getKeyCode(DOWN_ARROW_KEY), true);
        var nothing = new TAction(ACT_NONE, 0, false);
        var buzz   = getBuzzerAction(200, 100);
        var hibuzz = getBuzzerAction(800, 100);
        
        Triggers.add(btnPressed, 1,    0, nothing,   2);
        Triggers.add(btnPressed, 2,    0, downArrow, 2);
        Triggers.add(btnRelease, 2,  800, buzz,      3);
        Triggers.add(btnRelease, 3, 3000, hibuzz,    1);
        Triggers.add(btnPressed, 3,    0, nothing,   4);
        Triggers.add(btnPressed, 4,    0, upArrow,   4);
        Triggers.add(btnRelease, 4,  800, buzz,      1);    
    }
}

function makeKeyboardUpDownArrowToggle(solreg) {
    var sol = new KeyboardUpDownArrowToggle(solreg);
    SolutionList.add(sol);
    return sol;;
}

// -----------------------------------------------------------------
// -- Keyboard Shift -----------------------------------
const LDS_KEYBOARD_SHIFT    = "One button which generates a shift-key press event when pressed once, \
and generates the release when pressed a second time.  Allows a user to 'hold' the shift key \
without having the actually hold a key.";
class KeyboardShift extends SolutionBase {
    constructor(solreg) {
        super(solreg, LDS_KEYBOARD_SHIFT);
        this.addSetting( new SelectionBox (Q_ONE_BTN_PORT_LOCATION, portOptions, portOptions[0], "setting"));
        this.addOption( new CheckBox (Q_ADD_AUDIO_FEEDBACK_FOR_BTN, false));
    }
    
    getPortUsed() {
        return this.settings[0].getValue();
    }
    
    compile() {
        var port = this.settings[0].getValue();
        var doAudio = this.options[0].getValue();
 /*               
        console.log("Compile " + this.name);
        console.log("  Port: " + port.name);
        console.log("  Do Audio: " + doAudio);
*/
        var sensor = port.getSensor(this.subPort);
        var btnPressed = new TSignal(sensor, 500, TRIGGER_ON_HIGH);
        var btnRelease = new TSignal(sensor, 500, TRIGGER_ON_LOW);
        
        var press   = new TAction(ACT_WIRED_KEYBOARD, LEFT_SHIFT_KEY.wiredCode + KEY_PRESS, false);
        var release = new TAction(ACT_WIRED_KEYBOARD, LEFT_SHIFT_KEY.wiredCode + KEY_RELEASE, false);
        var nothing = new TAction(ACT_NONE, 0, false);
        var buzz = getBuzzerAction(200, 100);
        var hibuzz = getBuzzerAction(800, 100);
        
        if ( doAudio ) {
            Triggers.add(btnPressed, 1, 0, buzz,    1);
        }
        Triggers.add(btnPressed, 1,   0, press,     2);            
        Triggers.add(btnRelease, 2,   0, nothing,   3);
        if ( doAudio ) {
            Triggers.add(btnPressed, 3, 0, hibuzz , 3);
        }
        Triggers.add(btnPressed, 3,   0, release,   4);
        Triggers.add(btnRelease, 4,   0, nothing,   1);        
    }
}

function makeKeyboardShift(solreg) {
    var sol = new KeyboardShift(solreg);
    SolutionList.add(sol);
    return sol;;
}


// -----------------------------------------------------------------
// -- Keyboard Control -----------------------------------
const LDS_KEYBOARD_CONTROL  = "One button which generates a control-key press event when pressed once, \
and generates the release when pressed a second time.  Allows a user to 'hold' the control key \
without having the actually hold a key.";
class KeyboardControl extends SolutionBase {
    constructor(solreg) {
        super(solreg, LDS_KEYBOARD_CONTROL);
        this.addSetting( new SelectionBox (Q_ONE_BTN_PORT_LOCATION, portOptions, portOptions[0], "setting"));
        this.addOption( new CheckBox (Q_ADD_AUDIO_FEEDBACK_FOR_BTN, false));
    }
    
    getPortUsed() {
        return this.settings[0].getValue();
    }
    
    compile() {
        var port = this.settings[0].getValue();
        
        var sensor = port.getSensor(this.subPort);
        var btnPressed = new TSignal(sensor, 500, TRIGGER_ON_HIGH);
        var btnRelease = new TSignal(sensor, 500, TRIGGER_ON_LOW);
         var port = this.settings[0].getValue();
        var doAudio = this.options[0].getValue();
/*                
        console.log("Compile " + this.name);
        console.log("  Port: " + port.name);
        console.log("  Do Audio: " + doAudio);
*/
        var sensor = port.getSensor(this.subPort);
        var btnPressed = new TSignal(sensor, 500, TRIGGER_ON_HIGH);
        var btnRelease = new TSignal(sensor, 500, TRIGGER_ON_LOW);
        
        var press   = new TAction(ACT_WIRED_KEYBOARD, LEFT_CONTROL_KEY.wiredCode + KEY_PRESS, false);
        var release = new TAction(ACT_WIRED_KEYBOARD, LEFT_CONTROL_KEY.wiredCode + KEY_RELEASE, false);
        var nothing = new TAction(ACT_NONE, 0, false);
        var buzz = getBuzzerAction(200, 100);
        var hibuzz = getBuzzerAction(800, 100);
        
        if ( doAudio ) {
            Triggers.add(btnPressed, 1, 0, buzz,      1);
        }
        Triggers.add(btnPressed, 1,   0, press,     2);            
        Triggers.add(btnRelease, 2,   0, nothing,   3);
        if ( doAudio ) {
            Triggers.add(btnPressed, 3, 0, hibuzz ,   3);
        }
        Triggers.add(btnPressed, 3,   0, release,   4);
        Triggers.add(btnRelease, 4,   0, nothing,   1);        
   }
 }

function makeKeyboardControl(solreg) {
    var sol = new KeyboardControl(solreg);
    SolutionList.add(sol);
    return sol;;
}
