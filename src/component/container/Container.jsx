import React from 'react'

function Container({children,
  className='',
  noPaddingY = false,
  noBackground = false
}) {
  return (
    <div className={`w-full max-w-7xl mx-auto px-4 ${noBackground? 'bg-none' : ' bg-white'} rounded-xl ${className} ${noPaddingY? 'py-0': 'py-4'}`}>
      {children}
    </div>
  )
}

export default Container