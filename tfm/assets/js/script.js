(() => {
    let obj = {} || obj;
    let youtubeIframeHTML = '<iframe width="560" height="315" src="https://www.youtube.com/embed/rsWmrGuuWuE" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>';
    
    obj.ajax = (() => {
        function getRequest(url, callback) {
            let xhttp = new XMLHttpRequest();
            
            xhttp.open('GET', url, true);
            xhttp.onreadystatechange = function() {
                 if(xhttp.readyState == 4 && xhttp.status == 200) {
                   callback(xhttp.responseText);
                 }
            }
            xhttp.send();
        }
        
        return {getRequest}
    })();
    
    obj.search = (() => {
        function init() {
            let button = document.getElementById('search');
    
            button.addEventListener('click', (event) => {
                let query = document.getElementById('query').value;
                let url = `/search?q=${query}`;
                
                obj.ajax.getRequest(url, (data) => {
                    let results = JSON.parse(data);
                    
                    results['items'].forEach((item, i) => {
                        console.log("ITEM --> ", item);
                    });
                });
            });
        }
        
        return {init}
    })();
    
    obj.firebaseFunctions = (() => {
        function init() {
            let firebaseConfig = document.getElementById("firebaseConfig");
            
            if(firebaseConfig) {
                var config = firebaseConfig.innerHTML;
                firebaseConfig.remove();
                config = JSON.parse(config);
                
                firebase.initializeApp(config);
            }
        }
        
        function login() {
            var provider = new firebase.auth.GoogleAuthProvider();
            firebase.auth().signInWithPopup(provider).then(function(result) {
                const user = result.user;
                let url = `/users/check?uid=${user.uid}`;
                
                obj.ajax.getRequest(url, (data) => {
                    window.location.href = `/${user.uid}`;
                });
                
            }).catch(function(error) {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                // The email of the user's account used.
                var email = error.email;
                // The firebase.auth.AuthCredential type that was used.
                var credential = error.credential;
                // ...
            });
        }
        
        function logout() {
            firebase.auth().signOut().then(function() {
                if(window.location.pathname !== "/") {
                    window.location.href = '/';
                }
                
            }).catch(function(error) {
                // An error happened.
            });
        }
        
        function getCurrentUser() {
            firebase.auth().onAuthStateChanged(function(user) {
                if (user) {
                    //console.log(user);
                    if(window.location.pathname === '/') {
                        window.location.href = `/${user.uid}`;
                    }
                } else {
                    if(window.location.pathname !== '/') {
                        window.location.href = '/';
                    }
                }
            });

        }
        
        return {init, login, logout, getCurrentUser};
    })();
    
    obj.init = (() => {
        obj.firebaseFunctions.init();
        obj.firebaseFunctions.getCurrentUser();
        
        if(window.location.pathname === '/') {
            let loginButton = document.getElementsByClassName('login-button')[0];
            
            loginButton.addEventListener('click', () => {
                obj.firebaseFunctions.login();
            });
        }
    })();
})();