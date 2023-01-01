import React, { useState, useEffect } from "react";
// import useLocalStorage from "use-local-storage";

const ThemeContext = React.createContext({
    theme: "",
    toggleTheme: ()=>{}
});

export const ThemeContextProvider = (props)=>{
    const [darkTheme, setDarkTheme] = useState(undefined);

    useEffect(() => {
        if (darkTheme !== undefined) {
          if (darkTheme) {
            // Set value of  darkmode to dark
            document.documentElement.setAttribute('theme-color', 'dark');
            window.localStorage.setItem('memo-theme', 'dark');
          } else {
            // Set value of  darkmode to light
            document.documentElement.removeAttribute('theme-color');
            window.localStorage.setItem('memo-theme', 'light');
          }
        }
      }, [darkTheme]);
    
      useEffect(() => {
        const root = window.document.documentElement;
        const initialColorValue = root.style.getPropertyValue(
          '--initial-color-mode'
        );
        // Set initial darkmode to light
        setDarkTheme(initialColorValue === 'dark');
      }, []);

    
    function toggleTheme(){
        if(darkTheme){
            setDarkTheme(false);
        }
        else{
            setDarkTheme(true);
        }
    }

    const themeContext = {
        theme: darkTheme,
        toggleTheme: toggleTheme
    }

    return <ThemeContext.Provider value={themeContext}>{props.children}</ThemeContext.Provider>
}

export default ThemeContext;