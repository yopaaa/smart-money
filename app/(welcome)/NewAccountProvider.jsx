import { createContext, useContext, useEffect, useState } from 'react';

const NewAccountContext = createContext();

export const NewAccountProvider = ({ children }) => {
    const [formData, setFormData] = useState({
        name: "",
        balance: 0,
        currency: "",
    });

    const handleChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };



    useEffect(() => {
    }, []);

    return (
        <NewAccountContext.Provider value={{
            formData,
            handleChange,
        }}>
            {children}
        </NewAccountContext.Provider>
    );
};

export default NewAccountProvider
export const useData = () => useContext(NewAccountContext);
