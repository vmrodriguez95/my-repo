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
        let searchContainer = "";
        let header = "";
        let modeSearch = '';
        
        function init() {
            openSearcher();
        }
        
        function openSearcher() {
            header = document.getElementById('header-desktop');
            searchContainer = document.getElementById('search-container');
            
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
                        });
                    }
                    
                } else if(modeSearch === 'off') {
                    if(event.target.classList.contains('button-search') && event.target.tagName === 'IMG') {
                        const sliderItems = searchContainer.querySelectorAll('.slider-list li');
                        
                        header.setAttribute('mode-search', 'on');
                        
                        if(sliderItems.length > 0) {
                            searchContainer.classList.add('on');
                        }
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
                        
                        searchContainer.querySelector('iframe').src = videoUrl;
                        searchContainer.querySelector('ul').innerHTML = html;
                        searchContainer.classList.add('on');
                        
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
            const list = searchContainer.querySelector('.slider-list');
            
            function setSrcVideo(container, url) {
                if(url && container) {
                    let iframeSrc = container.querySelector('iframe').src;
                    
                    if(iframeSrc !== url) { container.querySelector('iframe').src = url; }
                }
            }
            
            function closeSearch() {
                let closeButton = searchContainer.querySelector('.close-search');
                
                closeButton.addEventListener('click', () => {
                    if(modeSearch === 'on') { header.setAttribute('mode-search', 'off'); }
                    searchContainer.classList.remove('on');
                });
            }
            
            closeSearch();
            
            setTimeout(() => {obj.slider.init();obj.aux.calcHeight()}, 1000);
            
            list.addEventListener('click', (e) => {
                let videoCard = obj.aux.getParent('video-card', e.target);
                if(videoCard) {
                    setSrcVideo(searchContainer, videoCard.getAttribute('data-url'));
                }
            });
        }
        
        return {init}
    })();
    
    obj.firebaseFunctions = (() => {
        function init() {
            let firebaseConfig = document.getElementById("firebaseConfig");
            
            if(firebaseConfig) {
                let config = firebaseConfig.innerHTML;
                firebaseConfig.remove();
                config = JSON.parse(config);
                
                firebase.initializeApp(config);
            }
        }
        
        function login() {
            const provider = new firebase.auth.GoogleAuthProvider();
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
                const errorCode = error.code;
                const errorMessage = error.message;
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
                config.controls = config._this.querySelector('.slider-controls');
                config.slides = config.sliderList.querySelectorAll('.slide');
                config.numSlides = config.slides.length;
                config.currentSlide = 0;
                config.nextButton = config._this.querySelector('.next');
                config.prevButton = config._this.querySelector('.prev');
                
                setStyles(config);
                
                config.nextButton.addEventListener('click', () => { nextSlide(config) });
                config.prevButton.addEventListener('click', () => { prevSlide(config) });
                
                setBullets(config);
                
                config.controls.addEventListener('click', (event) => { bulletsAction(event, config) });
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
                let bullets = config.controls.querySelectorAll('.bullet-control');
                
                bullets[config.currentSlide].classList.remove('on');
                
                config.currentSlide++;
                showSlide(config);
                
                bullets[config.currentSlide].classList.add('on');
            }
        }
        
        function prevSlide(config) {
            if(config.currentSlide > 0) {
                let bullets = config.controls.querySelectorAll('.bullet-control');
                
                bullets[config.currentSlide].classList.remove('on');
                
                config.currentSlide--;
                showSlide(config);
                
                bullets[config.currentSlide].classList.add('on');
            }
        }
        
        function showSlide(config) {
            let pos = -1 * config._this.offsetWidth * config.currentSlide;
            
            config.sliderList.style.transform = `translateX(${pos}px)`;
        }
        
        function setBullets(config) {
            let newBullet = document.createElement("LI");
            newBullet.classList.add('bullet-control');
            newBullet.setAttribute('data-slide', '0');
            config.controls.appendChild(newBullet);
            
            let bullets = config.controls.querySelectorAll('.bullet-control');
            
            for(let i = bullets.length; i < config.numSlides; i++) {
                newBullet = bullets[0].cloneNode(true);
                newBullet.setAttribute('data-slide', `${i}`);
                config.controls.appendChild(newBullet);
            }
            
            bullets[0].classList.add('on');
        }
        
        function bulletsAction(event, config) {
            const _self = event.target;
            let bullets = config.controls.querySelectorAll('.bullet-control');
            
            if(_self.classList.contains('bullet-control') && !_self.classList.contains('on')) {
                for(let i = 0; i < bullets.length; i++) {
                    if(bullets[i].classList.contains('on')) {
                        bullets[i].classList.remove('on');
                        break;
                    }
                }
                
                _self.classList.add('on');
                config.currentSlide = _self.getAttribute('data-slide');
                showSlide(config);
            }
        }
        
        return {init};
    })();
    
    obj.aux = (() => {
        function getParent(parent, target) {
            if(parent && target) {
                let aux = true;
                
                while(aux) {
                    if(target.tagName !== "BODY" && target.tagName !== "HTML") {
                        console.log("Resultado if --> ", target.classList.contains(parent));
                        if(target.classList.contains(parent)) {
                            aux = target;
                            break;
                        } else {
                            target = target.parentNode;
                        }
                    } else {
                        aux = false;
                        break;
                    }
                }
                
                return aux;
            }
        }
        
        function calcHeight() {
            const arrayEq = document.querySelectorAll('[data-js="_calcHeight"]');
            let isResponsive = true;
            let onlyResponsive = false;
        
            if(arrayEq !== undefined && arrayEq.length > 0) {
                arrayEq.forEach((item, i) => {
                    let _this = item;
                    let attrs = _this.getAttribute("data-eq-items");
                    
                    isResponsive = _this.getAttribute('data-resp') === 'false' ? false : true;
                    onlyResponsive = _this.getAttribute('data-resp') === 'only' ? true : false;
        
                    if((isResponsive && !onlyResponsive) ||
                        (!isResponsive && !onlyResponsive && document.body.offsetWidth > 960) ||
                        (isResponsive && onlyResponsive && document.body.offsetWidth < 960)) {
                        
                        if(typeof attrs !== typeof undefined && attrs !== false) {
                            attrs = attrs.split(',');
    
                            attrs.forEach((attr, i) => {
                                let maxHeight = 0;
                                let prevHeight = 0;
                                let actualHeight = 0;
                                let list = _this.querySelectorAll(attr);
    
                                list.forEach((listItem, i) => {
                                    actualHeight = listItem.offsetHeight;
    
                                    maxHeight = actualHeight >= prevHeight ? actualHeight : prevHeight;
    
                                    prevHeight = listItem.offsetHeight;
                                });
                                
                                list.forEach((listItem, i) => {
                                    listItem.style.height = `${maxHeight}px`;
                                });
                            });
                        }
                    }
                });
            }
        }
        
        return {getParent, calcHeight};
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