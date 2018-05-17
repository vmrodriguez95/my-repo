(() => {
    let obj = obj || {};
    let youtubeIframeHTML = '<iframe width="560" height="315" src="https://www.youtube.com/embed/rsWmrGuuWuE" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>';
    
    obj.ajax = (() => {
        function getRequest(url, query, callback) {
            let xhttp = new XMLHttpRequest();
            
            xhttp.open("GET", url, true);
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
            let button = document.getElementById("search");
    
            button.addEventListener("click", () => {
                let query = document.getElementById("query").value;
                let url = `/search?q=${query}`;
                
                obj.ajax.getRequest(url, query, function(data) {
                    let results = JSON.parse(data);
                    
                    results["items"].forEach((i, item) => {
                        
                    });
                });
            });
        }
        
        return {init}
    })();
    
    obj.search.init();
})();