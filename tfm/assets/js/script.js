(() => {
    let obj = {} || obj;
    
    obj.ajax = (() => {
        function getRequest(url, callback) {
            let xhttp = new XMLHttpRequest();
            
            xhttp.open('GET', url, true);
            xhttp.setRequestHeader("X-Requested-With", "XMLHttpRequest");
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
            openSearcher();
        }
        
        function openSearcher() {
            const header = document.getElementById('header-desktop');
            let modeSearch = '';
            
            header.addEventListener('click', (event) => {
                modeSearch = header.getAttribute('mode-search');
                
                if(modeSearch === 'on') {
                    if(event.target.classList.contains('button-search') && event.target.tagName === 'IMG') {
                        search();
                    } else if(event.target.id === 'query' && event.target.tagName === 'INPUT') {
                        event.target.addEventListener('keydown', (e) => {
                            if(e.keyCode === 13) {
                                search();
                            }
                        })
                    }
                    
                } else if(modeSearch === 'off') {
                    if(event.target.classList.contains('button-search') && event.target.tagName === 'IMG') {
                        header.setAttribute('mode-search', 'on');
                    }
                }
            });
        }
        
        function search() {
            let query = document.getElementById('query').value;
            
            if(query !== "") {
                let url = `/search?q=${query}`;
                
                obj.ajax.getRequest(url, (data) => {
                    let results = JSON.parse(data);
                    
                    if(results) {
                        let html = '';
                        let cont = 0;
                        let videoUrl = '';
                        const numMaxResults = 3;
                        const numResults = results['items'].length;
                        
                        results['items'].forEach((item, i) => {
                            if(cont === 0) {
                                html += '<li class="slide layout">';
                                videoUrl = `https://www.youtube.com/embed/${item.id.videoId}`;
                            } else if(cont % numMaxResults === 0 && cont < numResults) {
                                html += '</li><li class="slide layout">';
                            } else if(cont === numResults) {
                                html += '</li>';
                            }
                            html += printList('search', item);
                            
                            cont++;
                        });
                        
                        let container = document.getElementById('search-container');
                        container.querySelector('iframe').src = videoUrl;
                        container.querySelector('ul').innerHTML = html;
                        container.classList.add('on');
                        
                        addListEvents();
                    }
                });
            }
        }
        
        function printList(type, video, numVideos) {
            const types = ['search', 'recents', 'likes', 'playlist', 'playlist-video'];
            let html = '';
            
            if(types.indexOf(type) >= 0) {
                html += `<div class="layout-item col-1/3 padding- video-card" data-url="https://www.youtube.com/embed/${video.id.videoId}">`;
                    html += '<div class="video">';
                        html += `<img src="${video.snippet.thumbnails.high.url}" />`;
                    html += '</div><div class="video-info">';
                        html += `<p>${video.snippet.title}</p>`;
                        html += `<p>${video.snippet.channelTitle}</p>`;
                    html += '</div>';
                html += '</div>';
            }
            return html;
        }
        
        function addListEvents() {
            const list = document.querySelector('#search-container .slider-list');
            
            setTimeout(() => {obj.slider.init()}, 1000);
            
            list.addEventListener('click', (e) => {
                
            });
            
            function setSrcVideo(list, bro) {
                if(list && bro) {
                    let _video = '';
                    let iframe = bro.querySelector('div');
                    let id = bro.getAttribute('data-url');
                    
                    if(!bro.querySelector('iframe')) {
                        
                    }
                    
                    _video = bro.querySelector('iframe');
                    
                    bro.style.height = bro.offsetHeight > 0 ? '0px' : _video.offsetHeight + 'px';
                    
                    const videoList = list.querySelectorAll(`.video:not([data-url="${id}"])`);
                    videoList.forEach((item, i) => {
                        if(item.offsetHeight > 0) {
                            item.style.height = '0px';
                        }
                    });
                }
            }
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
                    if(data === "OK") {
                        window.location.href = `/dashboard/${user.uid}`;
                    } else {
                        logout();
                    }
                });
            }).catch(function(error) {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                console.log("ERRORACO DEL DIONISIO");
                logout();
            });
        }
        
        function logout() {
            firebase.auth().signOut().then(function() {
                if(window.location.pathname !== "/") {
                    window.location.href = '/';
                }
            }).catch(function(error) {
                console.log("ERRORACO DEL DIONISIO");
            });
        }
        
        function getCurrentUser() {
            firebase.auth().onAuthStateChanged(function(user) {
                if (user) {
                    if(window.location.pathname === '/') { window.location.href = `/dashboard/${user.uid}`; }
                } else {
                    logout();
                    if(window.location.pathname !== "/") { window.location.href = '/'; }
                }
            });
        }
        
        return {init, login, logout, getCurrentUser};
    })();
    
    obj.slider = (() => {
        function init() {
            const sliders = document.querySelectorAll('[data-js="_slider"]');
        
            sliders.forEach((slider, i) => {
                let config = {};
                config._this = slider.querySelector('.slider-container');
                config.sliderList = config._this.querySelector('.slider-list');
                config.slides = config.sliderList.querySelectorAll('.slide');
                config.numSlides = config.slides.length;
                config.currentSlide = 0;
                config.nextButton = config._this.querySelector('.next');
                config.prevButton = config._this.querySelector('.prev');
                
                setStyles(config);
                
                config.nextButton.addEventListener('click', () => { nextSlide(config) });
                config.prevButton.addEventListener('click', () => { prevSlide(config) });
            });
        }
        
        function setStyles(config) {
            let slideView = config._this.offsetWidth;
            let maxWidth = slideView * config.numSlides;
            config.sliderList.style.width = maxWidth + 'px';
            config.slides.forEach((slide, i) => {
                slide.style.width = slideView + 'px';
            });
        }
        
        function nextSlide(config) {
            if(config.currentSlide < (config.numSlides - 1)) {
                config.currentSlide++;
                showSlide(config);
            }
        }
        
        function prevSlide(config) {
            if(config.currentSlide > 0) {
                config.currentSlide--;
                showSlide(config);
            }
        }
        
        function showSlide(config) {
            let pos = -1 * config._this.offsetWidth * config.currentSlide;
            
            config.sliderList.style.transform = `translateX(${pos}px)`;
        }
        
        return {init};
    })();
    
    obj.init = (() => {
        obj.firebaseFunctions.init();
        //obj.firebaseFunctions.logout();
        obj.firebaseFunctions.getCurrentUser();
        
        if(window.location.pathname === '/') {
            let loginButton = document.getElementsByClassName('login-button')[0];
            
            loginButton.addEventListener('click', () => {
                obj.firebaseFunctions.login();
            });
        } else {
            obj.search.init();
        }
    })();
})();