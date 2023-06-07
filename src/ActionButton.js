import React from 'react'

export default function ActionButton({ ActivateActionButton, actionButtonText }) {
  return (
    <div>
          {ActivateActionButton  && <button onClick={ActivateActionButton}> {actionButtonText} </button>}
    </div>
  )
}


