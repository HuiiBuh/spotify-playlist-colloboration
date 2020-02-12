# JWT

## Basics

Stands for Json Web Token and can be used as a single sign on solution for multible apps. The JWT will be stored as a cookie on the client with the HttpOnly and Secure flags set.  
Because of that the cookie will only be transfered over HTTPS and the HttpOnly flag will prevent JavaScript from reading the cookie. The cookie is sent with every request.  
This opens the [CSRF](CSRF.md) security hole, which can be prevented by sending a custom CSRF token in the header along with the request (only for JS).

## Implementation

### Technologie

+ NodeJS with [Express](https://expressjs.com/de/)
+ JWT with [librarie](https://github.com/auth0/node-jsonwebtoken)

Create a extra webservice with the domain `login.mydomain.com` with the only purpose of creating valid JWTs.

### Technical Realization

__TODO:__ RS256 Signatures and HS256

## Reading

+ Basics of JWT [here](https://blog.angular-university.io/angular-jwt/)
+ Angular and JWT [here](https://blog.angular-university.io/angular-jwt-authentication/)
+ Libraries [here](https://jwt.io/#libraries)
