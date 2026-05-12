# Crypto-WebMessagingApp
An end-to-end encryption website messaging app! use it to chat freely with your friend without being afraid of it getting leaked out easily!

## Stack
- React (Vite) + Tailwind CSS
- Node.js + Express
- SQLite
- WebCryptoAPI

## How to run
```bash
cd server  && npm install
cd ../client && npm install
cd server  && npm run dev
cd client  && npm run dev
```
Open <http://localhost:5173> on browser

## Layout
```
client/
  src/
    lib/
      jwt.js         
      crypto.js      
      api.js         
    pages/
      Login.jsx
      Register.jsx
      Contacts.jsx
      Chat.jsx
    auth.jsx          
    App.jsx
    main.jsx
server/
  src/
    jwt.js        
    db.js
    auth.js 
    routes/
      auth.js 
      contacts.js 
      messages.js 
    index.js
```
## Flow 
- Register an account
- Register another account
- Login, try to chat the available contacts
- On different browser/tab/device, Login using the other account
- Enjoy chatting!