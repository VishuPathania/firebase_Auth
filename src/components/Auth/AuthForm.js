import { useState, useRef, useContext } from "react";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import classes from "./AuthForm.module.css";
import AuthContext from "../../store/auth-context";

const AuthForm = () => {
  const history = useHistory();
  const emailInputRef = useRef();
  const passwordInputRef = useRef();

  const authCtx = useContext(AuthContext);

  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [tokenTimeout ,setTokenTimeout] = useState(null);

  const switchAuthModeHandler = () => {
    setIsLogin((prevState) => !prevState);
  };

  const submitHandler = (event) => {
    event.preventDefault();
    const enteredEmail = emailInputRef.current.value;
    const enteredPassword = passwordInputRef.current.value;

    // optional : Add Validation
    setIsLoading(true);
    let url;
    if (isLogin) {
      url =
        "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyBHIT4vrvkOkxBfGE-7je5urZRzeBVN-7k";
    } else {
      url =
        "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyBHIT4vrvkOkxBfGE-7je5urZRzeBVN-7k";
    }
      fetch(url, {
        method: "POST",
        body: JSON.stringify({
          email: enteredEmail,
          password: enteredPassword,
          returnSecureToken: true,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => {
          setIsLoading(false);
          if (res.ok) {
            return res.json();
          } else {
            return res.json().then((data) => {
              //show an error modal
              let errorMessage = "Authentication Failed !";
              //if(data && data.error && data.error.message){
              //errorMessage= data.error.message;
              //}
              throw new Error(errorMessage);
            });
          }
        })
        .then((data) => {
          authCtx.login(data.idToken); // Token we get from firebase
        
          const expirationTime = new Date().getTime() + (5 * 60 * 1000); // Calculate expiration time
        
          // Set a timeout to clear token after 5 minutes
          const timeoutId = setTimeout(() => {
            const currentTime = new Date().getTime();
            if (currentTime > expirationTime) {
              authCtx.logout(); // Clear token when it expires
            }
          }, 5 * 60 * 1000); // 5 minutes in milliseconds
        
          setTokenTimeout(timeoutId); // Store the timeout identifier
        
          history.replace('/');
        })
        
        .catch((err) => {
          alert(err.message);
        });
    
  };

  return (
    <section className={classes.auth}>
      <h1>{isLogin ? "Login" : "Sign Up"}</h1>
      <form onSubmit={submitHandler}>
        <div className={classes.control}>
          <label htmlFor="email">Your Email</label>
          <input type="email" id="email" required ref={emailInputRef} />
        </div>
        <div className={classes.control}>
          <label htmlFor="password">Your Password</label>
          <input
            type="password"
            id="password"
            required
            ref={passwordInputRef}
          />
        </div>
        <div className={classes.actions}>
          {!isLoading && (
            <button>{isLogin ? "Login" : "Create Account"}</button>
          )}
          {isLoading && <p>Loading...</p>}
          <button
            type="button"
            className={classes.toggle}
            onClick={switchAuthModeHandler}
          >
            {isLogin ? "Create new account" : "Login with existing account"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default AuthForm;
