To get Agro Accounting application working, you need to create MongoDB data-base with following strcture -
Collections:
  - users
  - firms 
  - entities - this collection must have compound unique index on fields "name", "entityName", "firm"
  - works
  - refuelings
  - arrivals
  - inventorisations
Then pass data-base's url to environment variable DB_URL.

To change port adress create environment variable PORT with value as adress you want.

To run the app in developement mode, simply use "npm start" in terminal - this script catches all updates in involved files and restarts app.
To run the app in production mode, follow next advices:
  - change environment variable NODE_ENV to "production"
  - clean code from logs (one in src/app.ts at start function, and one in src/api/user-service/modules/auth/auth.ts at authentication middleware)
  - include debug module
  - set StrongLoop as systemd service to automatically restart server on crashing and updates.
  - Wrap server communication in HTTPS
  - use "npm run deploy" in terminal. If it doesn't work, more likely folder "dist" which contains compiled JS files doesn't exist - in this case use script "compile"
 
 
  
 
