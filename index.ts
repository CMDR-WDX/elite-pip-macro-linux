#!/usr/bin/env zx

import chalk from "chalk";
import { $ } from "zx";

import { isEliteActiveListener } from "./isEliteActiveListener";
import { createKeyboardListener } from "./keyboardListener"

process.stdout.write(chalk.green("Started…\n"))

try {
    await $`xdotool --help`.quiet()
    process.stdout.write(chalk.green(" xdotool OK\n "))
}
catch(err) {
    process.stdout.write(chalk.red(" xdotool FAILED. Make sure to install it. \n"))
    process.exit(1)
}

const KEY_STATE = {
    "KEY_1": false,
    "KEY_2": false,
    "KEY_3": false,
    "KEY_4": false
}

const MACRO_MAPPING = {
    "KEY_1": "Left",
    "KEY_2": "Up",
    "KEY_3": "Right",
    "KEY_4": "Down"
}

const MACRO_SWITCH = "KEY_KP0" // Numpad 0


async function spawnKeySpammer(key: string) {
    while(isEliteWindowActive && KEY_STATE[key] && isMacroEnabled) {
        await $`xdotool key --delay 1 --repeat 10 ${MACRO_MAPPING[key]}`
    }
}

let isMacroEnabled = true;
let isEliteWindowActive = false;

(async function isEliteActiveContext() {
    for await (const entry of isEliteActiveListener()) {
        isEliteWindowActive = entry
        console.info(chalk.blue("Elite windows active? "+isEliteWindowActive))
    }
})()

const keyboardListener = createKeyboardListener([...Object.keys(MACRO_MAPPING), MACRO_SWITCH])

for await(const {key, state} of keyboardListener) {
    if(key === MACRO_SWITCH && isEliteWindowActive) {
        if(!state) {
            continue
        }
        isMacroEnabled = !isMacroEnabled;
        console.log("Elite macro: ", (isMacroEnabled ? chalk.green : chalk.gray)( isMacroEnabled ? "enabled" : "disabled"))
        continue
    }

    KEY_STATE[key] = state
    if(state && isEliteWindowActive) {
        spawnKeySpammer(key);
    }
}
