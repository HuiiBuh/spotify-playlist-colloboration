# CSRF

## Basics

![img](https://www.imperva.com/learn/wp-content/uploads/sites/13/2019/01/csrf-cross-site-request-forgery.png)

1. User visits bad site
2. Bade site makes request to banking site `api/transfere?amout=1000&user=hacker`
3. If user is logged in the cookie of the banking site will be sent with it and the money wil be transfered

## Solution

__CSRF Cookie__  
This cookie will be set by the server and has a unique value.  
If you make a request the value of the CSRF cookie has to be sent along in a custom header. Request without this headers, but with a valid [JWT](JWT.md) will return a 401 Error with CSRF error message.  

## Implementation

__TODO:__

## Reading

+ Basics [here](https://stormpath.com/blog/angular-xsrf)
+ Implementation example [here](https://medium.com/@d.silvas/how-to-implement-csrf-protection-on-a-jwt-based-app-node-csurf-angular-bb90af2a9efd)
