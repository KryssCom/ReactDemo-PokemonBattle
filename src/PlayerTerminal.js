import React from 'react'

export default function PlayerTerminal({ playerTerminalMsg })
{
    //Simply display the game terminal

    //Possible todo: ensure terminal and player attack btn window load simultaneously

    return (
        <div className="terminal">
            {playerTerminalMsg}
        </div>
    )
}
