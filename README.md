# About
This is a really hacky implementation for Pip Macros for Elite: Dangerous on Linux (x11).

It makes use of xprop to listen for Window Focus Events to detect when Elite is being looked at so that it only 
sends out key events when in Elite.

It makes use of evtest to listen for Keyboard events. This step requires **sudo** permissions.

It pushes out keyboard events using xdotool. The only stuff you need to configure should be in the index.ts. 

You can build an executable node.js app with *npm run build*. This expects a recent Version of Node.js. 
