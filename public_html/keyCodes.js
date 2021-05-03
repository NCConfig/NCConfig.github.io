
/*
 * keycodes.js
 * 
 * Codes for all possible keys.
 */ 

"use strict"

let keyCode = function(name, wiredCode, btCode, isMod, isSpecial) {
    this.name = name;
    this.wiredCode = wiredCode;
    this.btCode = btCode;
    this.isModifier = isMod;
    this.isSpecial = isSpecial;
}

let keyCodeList = [];

keyCodeList.push( new keyCode("A Key", 0x61, 0, false, false) );
keyCodeList.push( new keyCode("B Key", 0x62, 0, false, false) );
keyCodeList.push( new keyCode("C Key", 0x63, 0, false, false) );
keyCodeList.push( new keyCode("D Key", 0x64, 0, false, false) );
keyCodeList.push( new keyCode("E Key", 0x65, 0, false, false) );
keyCodeList.push( new keyCode("F Key", 0x66, 0, false, false) );
keyCodeList.push( new keyCode("G Key", 0x67, 0, false, false) );
keyCodeList.push( new keyCode("H Key", 0x68, 0, false, false) );
keyCodeList.push( new keyCode("I Key", 0x69, 0, false, false) );
keyCodeList.push( new keyCode("J Key", 0x6A, 0, false, false) );
keyCodeList.push( new keyCode("K Key", 0x6B, 0, false, false) );
keyCodeList.push( new keyCode("L Key", 0x6C, 0, false, false) );
keyCodeList.push( new keyCode("M Key", 0x6D, 0, false, false) );
keyCodeList.push( new keyCode("N Key", 0x6E, 0, false, false) );
keyCodeList.push( new keyCode("O Key", 0x6F, 0, false, false) );
keyCodeList.push( new keyCode("P Key", 0x70, 0, false, false) );
keyCodeList.push( new keyCode("Q Key", 0x71, 0, false, false) );
keyCodeList.push( new keyCode("R Key", 0x72, 0, false, false) );
keyCodeList.push( new keyCode("S Key", 0x73, 0, false, false) );
keyCodeList.push( new keyCode("T Key", 0x74, 0, false, false) );
keyCodeList.push( new keyCode("U Key", 0x75, 0, false, false) );
keyCodeList.push( new keyCode("V Key", 0x76, 0, false, false) );
keyCodeList.push( new keyCode("W Key", 0x77, 0, false, false) );
keyCodeList.push( new keyCode("X Key", 0x78, 0, false, false) );
keyCodeList.push( new keyCode("Y Key", 0x79, 0, false, false) );
keyCodeList.push( new keyCode("Z Key", 0x7A, 0, false, false) );
        
keyCodeList.push( new keyCode("0 Key", 0x30, 0, false, false) );
keyCodeList.push( new keyCode("1 Key", 0x31, 0, false, false) );
keyCodeList.push( new keyCode("2 Key", 0x32, 0, false, false) );
keyCodeList.push( new keyCode("3 Key", 0x33, 0, false, false) );
keyCodeList.push( new keyCode("4 Key", 0x34, 0, false, false) );
keyCodeList.push( new keyCode("5 Key", 0x35, 0, false, false) );
keyCodeList.push( new keyCode("6 Key", 0x36, 0, false, false) );
keyCodeList.push( new keyCode("7 Key", 0x37, 0, false, false) );
keyCodeList.push( new keyCode("8 Key", 0x38, 0, false, false) );
keyCodeList.push( new keyCode("9 Key", 0x39, 0, false, false) );
        
keyCodeList.push( new keyCode("Space Key",  0x20, 0, false, false) );
keyCodeList.push( new keyCode("Plus Key",   0x2B, 0, false, false) );
keyCodeList.push( new keyCode("Minus Key",  0x2D, 0, false, false) );
keyCodeList.push( new keyCode("back Quote", 0x60, 0, false, false) );
keyCodeList.push( new keyCode("Open Square Bracket",   0x5B, 0, false, false) );
keyCodeList.push( new keyCode("Closed Square Bracket", 0x5D, 0, false, false) );
keyCodeList.push( new keyCode("Open Curly Bracket",    0x7B, 0, false, false) );
keyCodeList.push( new keyCode("Closed Curly Bracket",  0x7D, 0, false, false) );     
        
const UP_ARROW_KEY = new keyCode("Up Arrow",    0xDA, 14, false, true);
const DOWN_ARROW_KEY = new keyCode("Down Arrow",  0xD9, 12, false, true);
keyCodeList.push( UP_ARROW_KEY );
keyCodeList.push( DOWN_ARROW_KEY );
keyCodeList.push( new keyCode("Left Arrow",  0xD8, 11, false, true) );
keyCodeList.push( new keyCode("Right Arrow", 0xD7, 7, false, true) );
  
keyCodeList.push( new keyCode("Backspace", 0xB2, 8, false, true) );
keyCodeList.push( new keyCode("Tab",       0xB3, 9, false, true) );

const RETURN_KEY = new keyCode("Return",    0xB0, 10, false, true);
keyCodeList.push( RETURN_KEY );
keyCodeList.push( new keyCode("Escape",    0xB1, 27, false, true) );
keyCodeList.push( new keyCode("Insert",    0xD1, 1, false, true) );
keyCodeList.push( new keyCode("Delete",    0xD4, 4, false, true) );
keyCodeList.push( new keyCode("Page Up",   0xD3, 3, false, true) );
keyCodeList.push( new keyCode("Page Down", 0xD6, 6, false, true) );
keyCodeList.push( new keyCode("Home",      0xD2, 2, false, true) );
keyCodeList.push( new keyCode("End",       0xD5, 5, false, true) );
        
keyCodeList.push( new keyCode("CAPS LOCK", 0xC1, 0, false, false) );
        
keyCodeList.push( new keyCode("Comma",        0x2C, 0, false, false) );
keyCodeList.push( new keyCode("Period",       0x2E, 0, false, false) );
keyCodeList.push( new keyCode("Greater Than", 0x3C, 0, false, false) );
keyCodeList.push( new keyCode("Less Than",    0x3E, 0, false, false) );
        
keyCodeList.push( new keyCode("F1", 0xC2, 15, false, true) );
keyCodeList.push( new keyCode("F2", 0xC3, 16, false, true) );
keyCodeList.push( new keyCode("F3", 0xC4, 17, false, true) );
keyCodeList.push( new keyCode("F4", 0xC5, 18, false, true) );
keyCodeList.push( new keyCode("F5", 0xC6, 19, false, true) );
keyCodeList.push( new keyCode("F6", 0xC7, 20, false, true) );
keyCodeList.push( new keyCode("F7", 0xC8, 21, false, true) );
keyCodeList.push( new keyCode("F8", 0xC9, 22, false, true) );
keyCodeList.push( new keyCode("F9", 0xCA, 23, false, true) );
keyCodeList.push( new keyCode("F10", 0xCB, 24, false, true) );
keyCodeList.push( new keyCode("F11", 0xCC, 25, false, true) );
keyCodeList.push( new keyCode("F12", 0xCD, 26, false, true) );
        
const LEFT_CONTROL_KEY = new keyCode("Left Control",  0x80, 0, true, false);
const LEFT_SHIFT_KEY = new keyCode("Left Shift",    0x81, 0, true, false);
keyCodeList.push( LEFT_CONTROL_KEY );
keyCodeList.push( LEFT_SHIFT_KEY );
keyCodeList.push( new keyCode("Left Alt",      0x82, 0, true, false) );
keyCodeList.push( new keyCode("Left Windows",  0x83, 0, true, false) );
keyCodeList.push( new keyCode("Right Control", 0x84, 0, true, false) );
keyCodeList.push( new keyCode("Right Shift",   0x85, 0, true, false) );
keyCodeList.push( new keyCode("Right Alt",     0x86, 0, true, false) );
keyCodeList.push( new keyCode("Right Windows", 0x87, 0, true, false) );

function getWiredKey(value) {
    for(let ch of keyCodeList) {
        if (ch.wiredCode === value) {
            return ch;
        }
    }
}

function getBTKey(value) {
    for(let ch of keyCodeList) {
        if (ch.btCode === value) {
            return ch;
        }
    }    
}



