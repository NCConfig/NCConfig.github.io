"use strict";

// ----------------------------------------------
// This file defines the main data structures used to hold the data.
// Also the functions required to covert this data into a stream (to be sent
// to SensAct) and convert from a stream are defined here.
//
// No user interfact elements are defined here.
// ----------------------------------------------

var sensors = [];
var actions = [];

// ======= SENSORS =============================
// -- Sensor - defines a 'Sensor' class -- //
//    This holds sensor names and properties
function Sensor(i, n, minval, maxval, c) {
    this.id = i;
    this.name = n;
    this.minval = minval;
    this.maxval = maxval; 
    this.isContinuous = c;   // If true the sensor delivers continuous data.
						   // If false the sensor delivers descrete values.
}

// -- sensors - holds a list of all possible sensors -- //
const SENSOR_1A = new Sensor(5, "Sensor 1A", 0, 1023, true);
const SENSOR_1B = new Sensor(6, "Sensor 1B", 0, 1023, true);
const SENSOR_2A = new Sensor(3, "Sensor 2A", 0, 1023, true);
const SENSOR_2B = new Sensor(4, "Sensor 2B", 0, 1023, true);
const SENSOR_3A = new Sensor(1, "Sensor 3A", 0, 1023, true);
const SENSOR_3B = new Sensor(2, "Sensor 3B", 0, 1023, true);
const SENSOR_USB = new Sensor(7, "USB Input ", 0, 255, false);
const SENSOR_ACCEL_X = new Sensor(8, "Accel-X", -16000, 16000, true);
const SENSOR_ACCEL_Y = new Sensor(9, "Accel-Y", -16000, 16000, true) ;
const SENSOR_ACCEL_Z = new Sensor(10, "Accel-Z", -16000, 16000, true);
const SENSOR_GYRO_X = new Sensor(11, "Gyro-X", -15000, 15000, true);
const SENSOR_GYRO_Y = new Sensor(12, "Gyro-Y", -15000, 15000, true);
const SENSOR_GYRO_Z = new Sensor(13, "Gyro-Z", -15000, 15000, true);
const SENSOR_GYRO_ANY = new Sensor(14, "Gyro-Any", 0, 13000, true);

// createSensorList runs once -after the version number is discovered.
// It creates the list of sensors.
function createSensorList() {
    sensors.push( SENSOR_1A );
    sensors.push( SENSOR_1B );
    sensors.push( SENSOR_2A );
    sensors.push( SENSOR_2B );
    sensors.push( SENSOR_3A );
    sensors.push( SENSOR_3B );
    sensors.push( SENSOR_USB );
    sensors.push( SENSOR_ACCEL_X );
    sensors.push( SENSOR_ACCEL_Y );
    sensors.push( SENSOR_ACCEL_Z );
    sensors.push( SENSOR_GYRO_X );
    sensors.push( SENSOR_GYRO_Y );
    sensors.push( SENSOR_GYRO_Z );
    sensors.push( SENSOR_GYRO_ANY );
}
    
function getSensorByID(id) {
    for(var i=0; i<sensors.length; i++) {
        if (sensors[i].id === id) {
            return sensors[i];
        }
    }
    return null;
}

// ======= PORTS =============================
// Sensor-side values;
const SENSOR_A = 1;
const SENSOR_B = 2;

class portValue {
    constructor(name, sensorA, sensorB) {
        this.name = name;
        this.sensorA = sensorA;
        this.sensorB = sensorB;
    }
    
    getSensor(sensorSide) {
        if (sensorSide === SENSOR_A) {
            return this.sensorA;
        } else {
            return this.sensorB;
        }
    }
}

// --- Port Options ---
let portOptions = [];

function loadPorts() {
    portOptions.push( new portValue("Port 1", SENSOR_1A, SENSOR_1B));
    portOptions.push( new portValue("Port 2", SENSOR_2A, SENSOR_2B));
    portOptions.push( new portValue("Port 3", SENSOR_3A, SENSOR_3B));
}

// ======= ACTIONS =============================
// -- Action - defines an 'Action' ENUM -- //
//    This holds action names and ids.
//    Accessable directly by name and also by id value.
function Action(i, n) {
    this.id = i;
    this.name = n;
}

const ACT_NONE           = new Action(0, "None");
const ACT_RELAY          = new Action(1, "Relay");
const ACT_BT_KEYBOARD    = new Action(3, "BT Keyboard");
const ACT_WIRED_KEYBOARD = new Action(4, "Wired Keyboard");
const ACT_WIRED_MOUSE    = new Action(5, "Wired Mouse");
const ACT_SERIAL         = new Action(6, "Serial");
const ACT_BUZZER         = new Action(7, "Buzzer");
const ACT_IR             = new Action(8, "IR");
const ACT_BT_MOUSE       = new Action(9, "BT Mouse");
const ACT_SET_STATE      = new Action(10, "Set State");
const ACT_LIGHT_BOX      = new Action(11, "Light Box");

function createActionList() {
    actions.push( ACT_NONE );
    actions.push( ACT_RELAY );
    actions.push( ACT_BT_KEYBOARD );
    actions.push( ACT_WIRED_KEYBOARD );
    actions.push( ACT_WIRED_MOUSE );
    actions.push( ACT_SERIAL );
    actions.push( ACT_BUZZER );
    actions.push( ACT_IR );
    actions.push( ACT_BT_MOUSE );
    actions.push( ACT_SET_STATE );
    actions.push( ACT_LIGHT_BOX );
}   
    
function getActionByID(id) {
    for(var i=0; i<actions.length; i++) {
        if (actions[i].id === id) {
            return actions[i];
        }
    }
    return null;
}

// Action builders.
function getBuzzerAction(pitch, duration) {
    var param = pitch << 16;
    var param = param + duration;
    return new TAction(ACT_BUZZER, param, false);
}

function getLightBoxAction(option, light) {
    return new TAction(ACT_LIGHT_BOX, option + (1 << (light-1)), false);
}

function getSetStateAction(sensor, newState) {
    return new TAction(ACT_SET_STATE, (sensor.id << 8) + newState, false);
}

// =========== TSignal and TAction ===================
// TSignal - holder for all elements of a signal
class TSignal {
    constructor(sensor, level, condition) {
        this.sensor = sensor;
        this.level = level;
        this.condition = condition;
    }
}

// TAction - holder for all parts of an action.
class TAction {
    constructor(action, parameter, repeat) {
        this.action = action;
        this.parameter = parameter;
        this.repeat = repeat;
    }
}

// ================== TRIGGER and TRIGGERLIST ===============

// Condition values
var TRIGGER_ON_LOW   = 1;		// Trigger when below the threshold value
var TRIGGER_ON_HIGH  = 2;		// Trigger when above the threshold value
var TRIGGER_ON_EQUAL = 3;		// Trigger when equal to the threshold value

var DEFAULT_STATE = 1; // The default state
// A trigger is created with reasonable default values
class Trigger {
    constructor() {
        // This code has no meaning - it only lists the members.
	this.sensor = sensors[0];
	this.reqdState = DEFAULT_STATE;	// The state (1 to 15) required for the action to trigger.
	this.triggerValue = 0; 		// The value of the sensor which will cause the trigger.
	this.condition = TRIGGER_ON_HIGH;
	this.delay = 0;			// A time in ms - max 30000 (2 bytes)
	this.repeat = false;		// Boolean
	this.action = actions[0];       // The action to be performed
	this.actionParam = 0;           // A 4-byte value.  May encode multiple parameters.
	this.actionState = DEFAULT_STATE; // The state (1 to 15) to be set if the action triggers	
    }


    toStream( ostream ) {
	ostream.putByte('\n'.charCodeAt(0));
	ostream.putID(this.sensor.id, 2);
	ostream.putID(this.reqdState, 1);
	ostream.putNum(this.triggerValue, 2);
        let c = this.condition;
        if (this.repeat) {
            c += 4;
        }
	ostream.putCondition(c);
	ostream.putID(this.action.id, 2);
	ostream.putID(this.actionState, 1);
	ostream.putNum(this.actionParam, 4);
	ostream.putNum(this.delay, 2);
    }

    fromStream( stream ) {
        let sensorID = stream.getID(2);
        this.sensor = getSensorByID(sensorID);
        if (this.sensor === null) {
            throw ("Invalid Sensor ID");
        }
        this.reqdState = stream.getID(1);
        this.triggerValue = stream.getNum(2);
        this.condition = stream.getCondition();
        this.repeat = (this.condition & 4) === 4;
        this.condition = this.condition & ~4;

        let actionID = stream.getID(2);
        this.action = getActionByID(actionID);
        if (this.action === null) {
            throw ("Invalid Action ID");
        }
        this.actionState = stream.getID(1);
        this.actionParam = stream.getNum(4);
        this.delay = stream.getNum(2);
    }
}
	
// The Triggers object controls all access to the list of triggers.
// Well - there is no real enforcement of this in Javascript, but this
// is the intention.

class TriggerList {
    constructor() {
	this.theList = [];
    }
	
    length() {
        return this.theList.length;
    }
	
    get(i) {
        return this.theList[i];
    }

    add(signal, startState, delay, action, finalState) {
        var t = new Trigger();
        t.sensor = signal.sensor;
        t.reqdState = startState;
        t.triggerValue = signal.level;
        t.condition = signal.condition;
        t.delay = delay;
        t.action = action.action;
        t.actionParam = action.parameter;
        t.repeat = action.repeat;
        t.actionState = finalState;
        this.theList.push(t);
    }
    
    // replace triggers is called after new triggers are received.
    replaceTriggers(newList) {
        this.theList = newList;
    }

    deleteTrigger(t) {
        if (t) {
            for(var i=0; i < this.theList.length; i++) {
                if (t === this.theList[i]) {
                    this.theList.splice(i, 1);
                    break;
                }
            }
        }
    }

    clear() {
        this.theList = [];
    }
};

const Triggers = new TriggerList();

// --- Sending to device or display --- //
function sendTriggersToSensact() {
    outputStream.init( toSensact );
    putTriggers(outputStream);
}

function writeTriggersToSaveDiv() {
    outputStream.init( writeToSaveDiv );
    putTriggers(outputStream);
}

function writeToSaveDiv(data) {
    // var savePre = document.getElementById("savepre");
    // savePre.innerHTML = data;
    let elem = document.getElementById("savepre")
    let new_format_triggers = rewrite_triggers(Triggers)
    elem.innerHTML =
        prettyPrintJson.toHtml(new_format_triggers.analysis, { indent: 3 }) + "<br><br>" + 
        prettyPrintJson.toHtml(new_format_triggers, { indent: 3 })
}

function toSensact(data) {
    connection.write(data);
}

function putTriggers(ostream) {
    ostream.putByte(START_OF_TRIGGER_BLOCK);
    ostream.putByte('1'.charCodeAt(0));
    var ntrig = Triggers.length();
    ostream.putNum(ntrig, 1);

    for(var i=0; i<ntrig; i++) {
        Triggers.get(i).toStream(ostream);
    }
    
    // Send cursor speed data.
    rawCursorSpeed.toStream(ostream);
    
    ostream.putByte(END_OF_BLOCK);  // Write end of transmission block byte
    ostream.flush();
}

// -- Loading from device ---
function loadTriggers(stream) {
    var tmpTriggers = [];

    try {
        readTriggers(tmpTriggers, stream);

        // Now that data has been safely received ...
        Triggers.replaceTriggers(tmpTriggers); //This updates the storage
//        reloadTriggers();		// This updates the UI

    } catch(err) {
        alert("Trigger load failed: " + err);
    }
}
	
function readTriggers (tmpTriggers, stream) {
    if (stream.getByte() !== START_OF_TRIGGER_BLOCK) {
        throw("Invalid start of transmission");
    }
    // Version check
    if (stream.getByte() !== '1'.charCodeAt(0)) {
         throw("Invalid protocol version");
    }
    var triggerCount = stream.getNum(1);
    for(var i=0; i<triggerCount; i++) {
        var t = new Trigger(); 
        t.fromStream(stream);
        tmpTriggers.push(t);
    }
    var nextByte = stream.getByte();
    if (nextByte === MOUSE_SPEED_DATA) {
        var dataCount = stream.getNum(2);
        if (dataCount == 20) {
            rawCursorSpeed.fromStream(stream);
        } else {
            for(let i=0; i<dataCount; i++) {
                stream.getByte();
            }
        }
        nextByte = stream.getByte();
    }
    if (nextByte !== END_OF_BLOCK) {
        throw("Invalid end of transmission");
    }
    console.log("Loaded ", triggerCount, "triggers.");
}


