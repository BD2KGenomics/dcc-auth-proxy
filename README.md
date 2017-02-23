# Auth Proxy

Auth proxy authenticates users with OAuth and if authorized, proxies them onward based on subdomain. Auth proxy handles SSL termination and will forward websockets. Currently, only Google's OAuth2 is supported, but there is no reason to think that other providers couldn't be added with a little effort.

## Setting up
1. Obtain a domain name and point subdomains to your server.
  * Create an entry for each service (e.g. hello.example.com for service hello)
  * Create an entry for the proxy itself (e.g. proxy.example.com)
2. Obtain a https certificate for your domain. LetsEncrypt is highly recommended. https://certbot.eff.org
3. Place certificate in `cert` directory of your project.
4. Create an `accessControl.json` w/ a list of emails and their privileges, like this:
    ```
    
    {
      "jane@example.com": ["spinnaker.user", "spinnaker.admin"]
      "bob@example.com": ["spinnaker.user"]
      "barbara@example.com": ["spinnaker.user"]
    }
    ```
4. Create an OAuth2 app at the Google developer console
5. Ensure you've defined the following environment variables
  * `GOOGLE_CLIENT_ID` (from the developer console)
  * `GOOGLE_SECRET` (from the developer console)
  * `COOKIE_SECRET` (some random string to encrypt user sessions)
6. Create a docker-compose file like the one below and run `docker-compose up`

### Example docker-compose.yml
(Be sure to substitute example.com for your domain, 
```yml
version: '3'
services:
  hello:
    image: dockercloud/hello-world

  proxy:
    image: auth-proxy
    environment:
      GOOGLE_CLIENT_ID:
      GOOGLE_CLIENT_SECRET:
      SESSION_SECRET:
      HOST: "proxy.example.com"
      COOKIE_DOMAIN: "example.com"
      PORT: 443
      SERVICE_HELLO_PORT: 80
      NODE_ENV: production
    ports:
      - "443:443"
      - "80:80"
    volumes:
      - '.cert:/app/cert'
      - './accessControl.json:/app/accessControl.json'
    restart: always
```    

### Building docker image
`docker build -t auth-proxy .`
