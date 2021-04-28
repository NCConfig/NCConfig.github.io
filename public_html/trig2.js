/* trig2.js - code to deduce the original solution from the hub's configuration 
    2021-04-27 Tue


usage:
1) pick a solution
2) press 'decodeTriggers'

the panel shows 
a) the number of triggers and buzzer rings and a hashcode
b) 'normalized' trigger set
*/

function convert_condition(c) {
    if (c === TRIGGER_ON_LOW ) { return '<' }
    if (c === TRIGGER_ON_HIGH ) { return '>' }
    if (c === TRIGGER_ON_EQUAL ) { return '=' }
}

// re-write from internal trigger list - the same info as can be retrieved from hub
function rewrite_triggers(old_t) {
    let triggers = []
    // organized by sensor, then by state (array) where all triggers for each state are aggregated in an array as well
    old_t.theList.forEach(function (obj) {
        let sensor
        sensor = obj.sensor.id
        triggers[sensor] = triggers[sensor] || {}
        triggers[sensor].triggers = triggers[sensor].triggers || []

        const state_number = obj.reqdState
        triggers[sensor].triggers[state_number]
            = triggers[sensor].triggers[state_number] || []

        //re-write triggers
        let t1 = {}, t0 = obj
        t1._info = t0.sensor.name + " (" + t0.sensor.id + ") " + convert_condition(t0.condition) +
            " " + t0.triggerValue + " (" + t0.delay + ") " +
            t0.reqdState + "->" + t0.actionState + " action=" + t0.action.name
        // t1.sensor = t0.sensor // Omit sensor details - not available from hub 
        t1.condition = t0.condition
        t1.triggerValue = t0.triggerValue
        t1.delay = t0.delay
        t1.repeat = t0.repeat
        t1.execute = [] // possiblity for more than one action
        t0.action.actionParam = t0.actionParam
        t1.execute.push(t0.action)
        t1.next_state = t0.actionState

        triggers[sensor].triggers[state_number].push(t1)
    });

    // console.log(JSON.stringify(triggers)) 
    triggers.analysis = add_analysis_info(triggers)

    return triggers
}

String.prototype.hashCode = function () {
    var hash = 0, i, chr;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++) {
        chr = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

function add_analysis_info(T) {
    let analysis = []
    let ord = 0
    let j = 0

    for (j = 0; j < T.length; j++) {
        let onesig = T[j]
        let signature = {}
        if (onesig == null) {
            signature = null
        } else {

            let tmpsig = JSON.parse(JSON.stringify(onesig))
            let tmptrigs = tmpsig.triggers.flat();
            let cnt = 0, b = 0
            for (let i = 0; i < tmptrigs.length; i++) {
                if (tmptrigs[i] !== null) {
                    let e = tmptrigs[i].execute
                    if (e[0].name === "Buzzer") {
                        b += 1
                        delete tmptrigs[i].execute[0].actionParam
                    }
                    cnt += 1
                    delete tmptrigs[i]._info
                    delete tmptrigs[i].delay
                    delete tmptrigs[i].triggerValue
                }
            }
            signature.total_triggers = cnt
            signature.total_buzzers = b
            signature.hash = JSON.stringify(tmptrigs).hashCode()
            // signature.flat_trigs = tmptrigs
        }
        analysis[j] = signature
    }
    return analysis
}

// re-format from trigger block from hub
function reformat_triggers(old_t) {
    let triggers = {}
    // organized by sensor, then by state (array) where all triggers for each state are aggregated in an array as well
    Object.keys(old_t).forEach(function (key) {
        let sensor
        sensor = old_t[key].id
        triggers[sensor] = triggers[sensor] || {}
        triggers[sensor].triggers = triggers[sensor].triggers || []

        const state_number = old_t[key].state
        triggers[sensor].triggers[state_number]
            = triggers[sensor].triggers[state_number] || []

        //re-write triggers
        let t1 = {}, t0 = old_t[key]
        t1._info = t0.input + " " + t0.condition + t0.threshold + " (" + t0.duration + ") " +
            t0.state + "->" + t0.next_state + " action=" + t0.output.action
        t1.condition = t0.condition
        t1.threshold = t0.threshold
        t1.duration = t0.duration
        t1.execute = [] // possiblity for more than one action
        t1.execute.push(t0.output)
        t1.next_state = t0.next_state

        triggers[sensor].triggers[state_number].push(t1)
    });

    console.log(JSON.stringify(triggers))

    return triggers
}

/* counting number of triggers and buzzers could disambiguate most solutions
hash codes provide the identity of the solution uniquely

One button mouse 
[ null, { total_triggers: 15, total_buzzers: 5, hash: -889832255 } ]

Two button mouse 
[ null, { total_triggers: 7, total_buzzers: 2, hash: 139278869 }, { total_triggers: 7, total_buzzers: 2, hash: 139278869 } ]

Joystick mouse 1 
[ null, { total_triggers: 2, total_buzzers: 0, hash: 1871802012 }, { total_triggers: 2, total_buzzers: 0, hash: 1871802012 } ]

	Enable L/R 	
  [ null, { total_triggers: 10, total_buzzers: 0, hash: -401143458 }, { total_triggers: 2, total_buzzers: 0, hash: 1871802012 } ]
      
	+ audio [ null, { total_triggers: 12, total_buzzers: 2, hash: 2044482811 }, { total_triggers: 2, total_buzzers: 0, hash: 1871802012 } ]


Joystick mouse 2
	[ null, { total_triggers: 2, total_buzzers: 0, hash: -1086941184 }, { total_triggers: 4, total_buzzers: 0, hash: -499512249 }, { total_triggers: 6, total_buzzers: 0, hash: 163173103 } ]


   Enable left/right clicks
[ null, { total_triggers: 10, total_buzzers: 0, hash: -962778536 }, { total_triggers: 4, total_buzzers: 0, hash: -499512249 }, { total_triggers: 6, total_buzzers: 0, hash: 163173103 } ]

	+ audio for mouse clicks 
[ null, { total_triggers: 12, total_buzzers: 2, hash: 662332507 }, { total_triggers: 4, total_buzzers: 0, hash: -499512249 }, { total_triggers: 6, total_buzzers: 0, hash: 163173103 } ]

	    + audio for toggle [ null, { total_triggers: 12, total_buzzers: 2, hash: 662332507 }, { total_triggers: 4, total_buzzers: 0, hash: -499512249 }, { total_triggers: 8, total_buzzers: 2, hash: 683962587 } ]


   Add audio feedback for clicks
[ null, { total_triggers: 2, total_buzzers: 0, hash: -1086941184 }, { total_triggers: 4, total_buzzers: 0, hash: -499512249 }, { total_triggers: 6, total_buzzers: 0, hash: 163173103 } ]

           + add audio for toggle
[ null, { total_triggers: 2, total_buzzers: 0, hash: -1086941184 }, { total_triggers: 4, total_buzzers: 0, hash: -499512249 }, { total_triggers: 8, total_buzzers: 2, hash: 683962587 } ]


    Toggle only
[ null, { total_triggers: 2, total_buzzers: 0, hash: -1086941184 }, { total_triggers: 4, total_buzzers: 0, hash: -499512249 }, { total_triggers: 8, total_buzzers: 2, hash: 683962587 } ]



Press one button

One button left click [ { total_triggers: 1, total_buzzers: 0, hash: -1523159288 } ]
	      + audio  [ { total_triggers: 2, total_buzzers: 1, hash: 1770342761 } ]

One button right click [ { total_triggers: 1, total_buzzers: 0, hash: 1545335333 } ]
	+ audio [ { total_triggers: 2, total_buzzers: 1, hash: 867735340 } ]

Left press/release toggle [ { total_triggers: 4, total_buzzers: 0, hash: -1824454985 } ]
       + audio [ { total_triggers: 6, total_buzzers: 2, hash: -80945229 } ]

	Left button emulation [ { total_triggers: 2, total_buzzers: 0, hash: -688313775 } ]
	Three function[ { total_triggers: 6, total_buzzers: 2, hash: 1956077131 } ]

Two buttons left/right click

[ { total_triggers: 1, total_buzzers: 0, hash: 1545335333 }, { total_triggers: 1, total_buzzers: 0, hash: 1545335333 } ]
    + audio [ { total_triggers: 2, total_buzzers: 1, hash: 867735340 }, { total_triggers: 2, total_buzzers: 1, hash: 867735340 } ]


Scrolling

One button scrolling[ { total_triggers: 7, total_buzzers: 3, hash: 1302697201 } ]

Two button scrolling 
[ { total_triggers: 1, total_buzzers: 0, hash: -107394979 }, { total_triggers: 1, total_buzzers: 0, hash: -107394979 } ]
	+audio    [ { total_triggers: 2, total_buzzers: 1, hash: 346826228 }, { total_triggers: 2, total_buzzers: 1, hash: 346826228 } ]


*/