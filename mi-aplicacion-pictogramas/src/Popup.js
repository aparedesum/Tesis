import React, { useState } from 'react';


function Popup ({ show, message }) 
 {
    if (!show) return null;
    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'white',
            padding: '10px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            zIndex: 1000,
        }}>
            {message}
        </div>
    );
};

export default Popup;