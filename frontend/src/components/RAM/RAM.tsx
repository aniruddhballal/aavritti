import DarkModeToggle from "../DarkModeToggle/DarkModeToggle";

const RAM = () => {
  return (
    <>
    <DarkModeToggle/>
      <div className="w-full h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-2xl text-gray-400">Click/tap to jot</p>
        </div>
      </div>    
    </>
  );
};

export default RAM;