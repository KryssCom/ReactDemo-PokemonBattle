import React from 'react'

export default function PlayerTerminal({ playerTerminalMsg })
{
    //Simply display the game terminal

    return (
        <div className="terminal">
            {playerTerminalMsg}
        </div>
    )
}
