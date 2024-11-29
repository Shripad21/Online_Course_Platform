import React from 'react'

function NoLoginMessage() {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-4 min-h-screen">
            <div className="text-2xl font-semibold text-gray-700">No Data Available</div>
            <p className="text-gray-500 mt-2">Please log in to access this data.</p>
        </div>
    );
}

export default NoLoginMessage