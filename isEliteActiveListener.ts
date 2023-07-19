import {$} from "zx"


export async function* isEliteActiveListener() : AsyncGenerator<boolean> {

    const ELITE_WINDOW_SUBSTRING = "Elite"

    const changesListener$ = $`xprop -spy -root 32x '\\t$0' _NET_ACTIVE_WINDOW`.quiet()
    let currentStatus = false;

    let lastHexDecWindowsId = undefined;
    for await (let chunk of changesListener$.stdout) {
        chunk += "" // Turn to String. Dont need the raw uint8 buffer
        
        // Get window id
        // _NET_ACTIVE_WINDOW(WINDOW) 0x3400023  ->> 0x3400023
        const split = chunk.split("\t")
        if(split.length < 2) {
            process.stderr.write("Unexpected Value in Stream: '"+chunk+"'. Skipping\n")
            continue;
        }
        const hexDecWindowsId = split[1].trim();

        if(hexDecWindowsId === "0x0") {
            continue; // Skip null window
        }
        
        if(lastHexDecWindowsId === hexDecWindowsId) {
            continue; // Dedupe event
        }
        lastHexDecWindowsId = hexDecWindowsId;

        const windowName = (await $`xprop -id ${hexDecWindowsId} _NET_WM_NAME`.quiet())+""
        
        const isWindowElite = windowName.toLowerCase().includes(ELITE_WINDOW_SUBSTRING.toLocaleLowerCase())
        
        if(isWindowElite !== currentStatus) {
            currentStatus = !currentStatus
            yield currentStatus
        }
    }
}