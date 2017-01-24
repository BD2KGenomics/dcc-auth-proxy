# Auth Proxy

## Building docker image
`docker build -t dcc-auth-proxy .`

## Sample docker-compose file
TODO

## Development
1. Install node 6.9.4 https://nodejs.org/en/
2. `npm install`
3. Create `.env` file with something like 
    ```
    
    export GOOGLE_CLIENT_ID=CLIENT_ID
    export GOOGLE_CLIENT_SECRET=SECRET
    export HOST="localhost"
    export PORT=8443
    export REDWOOD_ADMIN=ADMIN_USERNAME
    export REDWOOD_ADMIN_PASSWORD=ADMIN_PASSWORD
    ```
4. `npm start`
