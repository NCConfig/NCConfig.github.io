/* 
 * registry
 * 
 * A registry of all the solutions.
 * This provides directly usable IDs for all solutions.
 * It also provices information needed to access and create a solution
 * by name.  
 * 
 * It will be expanded in future to allow finding solutions based on
 * hash or threshold value or whatever is used to retrieve solutions.
 */

/*
 * Names - used by chooser, Solution and SolutionFinder.
 * The names must match in all three, so they are all defined here.
 */

class SolBase {
    constructor(name, createFunc) {
        this.name = name;
        this.createFunc = createFunc;
    }
}

// Mouse motion solutions
const SolOneBtnMouse    = new SolBase("One Button Mouse", makeOneButtonMouse);
const SolTwoBtnMouse    = new SolBase("Two Button Mouse", makeTwoButtonMouse);
const SolJoystickMouse1 = new SolBase("Joystick Mouse",   makeJoystickMouse1);
const SolJoystickMouse2 = new SolBase("Joystick Plus",    makeJoystickMouse2);
const SolGyroMouse      = new SolBase("Gyro Mouse",       makeGyroMouse);

// Mouse clicks - one button
const SolLeftClick              = new SolBase("Left Click Button",          makeLeftClickButton);
const SolRightClick             = new SolBase("Right Click Button",         makeRightClickButton);
const SolLeftPressReleaseToggle = new SolBase("Left Press-Release Toggle",  makeLeftPressReleaseToggle);
const SolLeftEmulation          = new SolBase("Left Button Emulation",      makeLeftButtonEmulation);
const SolThreeFuncMouseButton   = new SolBase("Three Function Mouse Button", makeThreeFunctionButton);

// Mouse clicks - two buttons
const SolLeftRightClick = new SolBase("Left-Right Click", makeLeftRightClick);

// Scrolling
const SolScrollToggle  = new SolBase("Scroll Up-Down Toggle",  makeScrollUpDownToggle);
const SolScrollButtons = new SolBase("Scroll Up-Down Buttons", makeScrollUpDownButtons);

// Keyboard
const SolKeyboardText     = new SolBase("Send a text string",                   makeKeyboardText);
const SolKeyboardSpecial  = new SolBase("Send a special character",             makeKeyboardSpecial);
const SolKeyboardModifier = new SolBase("Send a character plus a modifier",     makeKeyboardModifier);
const SolUpDownArrowToggle = new SolBase("Up-Down arrow toggle",                makeKeyboardUpDownArrowToggle);
const SolKeyboardShift    = new SolBase("Press-Release toggle for shift key",   makeKeyboardShift);
const SolKeyboardControl  = new SolBase("Press-Release toggle for control key", makeKeyboardControl);

const SolUnknown          = new SolBase("Unknown", makeUnknownSolution);

var SolList = [];

function LoadSolutionList() {
    SolList.push(SolOneBtnMouse);
    SolList.push(SolTwoBtnMouse);
    SolList.push(SolJoystickMouse1);
    SolList.push(SolJoystickMouse2);
    SolList.push(SolGyroMouse);
    
    SolList.push(SolLeftClick);
    SolList.push(SolRightClick);
    SolList.push(SolLeftPressReleaseToggle);
    SolList.push(SolLeftEmulation);
    SolList.push(SolThreeFuncMouseButton);
    
    SolList.push(SolLeftRightClick);
    
    SolList.push(SolScrollToggle);
    SolList.push(SolScrollButtons);
    
    SolList.push(SolKeyboardText);
    SolList.push(SolKeyboardSpecial);
    SolList.push(SolKeyboardModifier);
    SolList.push(SolUpDownArrowToggle);
    SolList.push(SolKeyboardShift);
    SolList.push(SolKeyboardControl);
    
    SolList.push(SolUnknown);
};

function findSolutionByName(name) {
    for(ref of SolList) {
        if (ref.name === name) {
            return ref;
        }
    }
    return null;
};

