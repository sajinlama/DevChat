import React from "react";
import { LANGUAGE_VERSIONS } from "../constant";
import { FaCode, FaChevronDown } from "react-icons/fa";

interface NavbarProps {
  language: keyof typeof LANGUAGE_VERSIONS;
  setLanguage: React.Dispatch<React.SetStateAction<keyof typeof LANGUAGE_VERSIONS>>;
}

function RoomNavbar({ language, setLanguage }: NavbarProps) {
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as keyof typeof LANGUAGE_VERSIONS);
  };

  // Get language display name and color
  const getLanguageInfo = (lang: string) => {
    const colorMap: Record<string, string> = {
      javascript: "text-yellow-400",
      typescript: "text-blue-400",
      python: "text-green-400",
      java: "text-orange-400",
      csharp: "text-purple-500",
      php: "text-indigo-400",
      
    };

    // Return default color if language not in map
    return colorMap[lang.toLowerCase()] || "text-gray-400";
  };

  return (
    <nav className="bg-gradient-to-r from-gray-900 to-gray-800 shadow-lg border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and title */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <FaCode className="text-2xl text-blue-500 mr-2" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 text-transparent bg-clip-text">
                DevChat
              </h1>
            </div>
            <div className="hidden md:block ml-6">
              <div className="text-sm text-gray-400">
                Collaborative coding environment
              </div>
            </div>
          </div>

          {/* Language selector */}
          <div className="relative">
            <div className="flex items-center">
              <span className="text-gray-400 mr-3 text-sm hidden sm:block">
                Language:
              </span>
              <div className="relative inline-block">
                <select
                  value={language}
                  onChange={handleLanguageChange}
                  className="appearance-none bg-gray-800 border border-gray-700 rounded-md py-2 pl-3 pr-10 text-sm font-medium text-white shadow-sm hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                >
                  {Object.keys(LANGUAGE_VERSIONS).map((lang) => (
                    <option key={lang} value={lang} className="text-white bg-gray-800">
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                  <FaChevronDown className="h-3 w-3 text-gray-400" />
                </div>
              </div>
              {/* Current language indicator */}
              <div className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${getLanguageInfo(language)} bg-gray-800`}>
                v{LANGUAGE_VERSIONS[language]}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default RoomNavbar;