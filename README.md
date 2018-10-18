# Login_Authentication
 
 Step-1:
    Sign_Up
       Get signup data
       check if input was correct(server-side)
       check if email already exists in database
       Hash Password
       save user to the database
       Redirect login page and show message
 step-2:
    Sign-in
      get sign in data
      check if user with that email exist
      check if password is correct
      Authenticate using passportjs
      redirect to dashboard
 step-3:
    Email- verification:
            generate a secretTocken
            Tocken send to user mail-id
            verify mail-id 
            goto homePage

#how to use this project :
    Download this project
    install node.js
    install npm
    install all libraries using npm install
    
 
