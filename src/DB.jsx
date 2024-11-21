import { useState, useEffect, useCallback, useContext, createContext } from "react";

// Open IndexedDB and return a Promise for the database
const openDatabase = () => {
    return new Promise((resolve, reject) => {
        const indexDB = window.indexedDB;
        const request = indexDB.open("chat", 1);

        request.onerror = () => {
            reject("IndexedDB error: " + request.error);
        };

        request.onupgradeneeded = () => {
            const db = request.result;
            db.createObjectStore(`messages`, { keyPath: "id", autoIncrement: true });
        };

        request.onsuccess = () => {
            resolve(request.result);
        };
    });
};

// Create Context
const IndexedDBContext = createContext();

// Hook to interact with the IndexedDB
const useIndexedDB = () => {
    const context = useContext(IndexedDBContext);
    if (!context) {
        throw new Error('useIndexedDB must be used within a IndexedDBProvider');
    }
    return context;
};

const IndexedDBProvider = ({ children }) => {
    const [db, setDb] = useState(null);
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        // Open the database and set it in state
        const initializeDB = async () => {
            try {
                const database = await openDatabase();
                setDb(database);
            } catch (error) {
                console.error(error);
            }
        };
        initializeDB();
    }, []);

    useEffect(() => {
        // Fetch messages when the database changes
        fetch();
        console.log(messages);
    }, [db]);

    // Fetch all messages
    const fetch = useCallback(() => {
        if (!db) return;

        const transaction = db.transaction(`messages`, "readonly");
        const store = transaction.objectStore(`messages`);

        const allMessages = [];
        const cursor = store.openCursor();

        return new Promise((resolve, reject) => {
            cursor.onsuccess = (event) => {
                const result = event.target.result;
                if (result) {
                    allMessages.push(result.value);
                    result.continue();
                } else {
                    setMessages(allMessages);
                    resolve(allMessages);
                }
            };

            cursor.onerror = (error) => {
                reject("Error fetching messages: " + error);
            };
        });
    }, [db]);

    // Add a new message
    const add = useCallback(
        (content) => {
            if (!db) return;

            const transaction = db.transaction(`messages`, "readwrite");
            const store = transaction.objectStore(`messages`);

            return new Promise((resolve, reject) => {
                const request = store.add(content);

                request.onsuccess = () => {
                    setMessages((prev) => [...prev, content]);
                    resolve(content);
                };

                request.onerror = (error) => {
                    reject("Error adding message: " + error);
                };
            });
        },
        [db]
    );

    const clear = useCallback(() => {
        if (!db) return;

        const transaction = db.transaction(`messages`, "readwrite");
        const store = transaction.objectStore(`messages`);

        return new Promise((resolve, reject) => {
            const request = store.clear();

            request.onsuccess = () => {
                console.log(`All messages have been cleared.`);
                setMessages([]);
                resolve([]);
            };

            request.onerror = (error) => {
                reject("Error when clearin db: " + error);
            };
        });
    },
        [db]
    );

    return (
        <IndexedDBContext.Provider value={{ messages, fetch, add, clear, db }}>
            {children}
        </IndexedDBContext.Provider>
    );
};

export { IndexedDBProvider, useIndexedDB };