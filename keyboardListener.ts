import { $ } from "zx/core";

export async function* createKeyboardListener(keyNames: string[]) {

    let keyStates: Record<string, boolean> = {}

    keyNames.forEach( e => keyStates[e] = false)

    // Create a stream for the Keyboard Buffer
    const stream = $`evtest /dev/input/by-id/usb-SONiX_USB_DEVICE-event-kbd`.quiet();
    for await(const chunk of stream.stdout) {
        const lines = (chunk+"").split("\n").find( e => e.includes("(EV_KEY)"))
        if(!lines || lines.length === 0) {
            continue;
        }

        let key: string | undefined = undefined;
        let value: number | undefined = undefined;

        for (const segment of lines.split(",").map( e => e.trim())) {
            if(segment.startsWith("code")) {
                key = segment.split("(")[1].split(")")[0] // Who needs Regex anyways :P
            }
            if(segment.startsWith("value")) {
                value = Number.parseInt(segment.split(" ")[1])
            }
        }

        if(typeof key === "undefined" || typeof value === "undefined") {
            // Irrelevant Key or Partial event
            continue;
        }
        if(!keyNames.includes(key)) {
            continue;
        }

        const isPressed = !!value;

        if(keyStates[key] !== isPressed) {
            keyStates[key] = isPressed
            yield {
                key: key,
                state: isPressed
            }
        }
    }
}
