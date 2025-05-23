import React from "react";

const NotFound = () => {
  return (
    <div
      className="
        min-h-screen flex flex-col justify-center items-center bg-gray-900
        text-gray-200 px-6
        font-serif
        select-none
      "
      style={{
        backgroundImage:
          "radial-gradient(circle at center, rgba(0,0,0,0.7), #121212 80%), url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1470&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundBlendMode: "multiply",
      }}
    >
      <h1
        className="
          text-7xl md:text-9xl
          font-black
          tracking-wide
          mb-6
          drop-shadow-lg
          text-red-700
          uppercase
          border-b-4 border-red-700
          pb-2
        "
        style={{ fontFamily: "'Cinzel Decorative', serif" }}
      >
        404
      </h1>
      <p
        className="
          text-xl md:text-3xl
          italic
          max-w-md
          text-gray-300
          mb-6
          text-center
          drop-shadow
        "
        style={{ fontFamily: "'Libre Baskerville', serif" }}
      >
        Looks like you've crossed into forbidden territory, boss. This page just
        ain't here.
      </p>
      <button
        onClick={() => (window.location.href = "/")}
        className="
          px-6 py-3
          bg-red-700 hover:bg-red-800
          rounded
          text-gray-100
          uppercase
          tracking-widest
          font-semibold
          shadow-lg
          transition
          duration-300
          active:scale-95
          cursor-pointer
          select-none
        "
      >
        Get Me Outta Here
      </button>
    </div>
  );
};

export default NotFound;
