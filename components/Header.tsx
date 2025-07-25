
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="py-6 bg-gray-800 shadow-xl mb-8 w-full">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl sm:text-5xl font-bold text-center text-sky-400 tracking-tight">
          Gemini Adventure
        </h1>
        <p className="text-center text-gray-400 mt-2 text-lg">The Whispering Woods Awaits</p>
      </div>
    </header>
  );
};

export default Header;
