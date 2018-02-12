(function() {
    
    function isMob() {
        return /Android|iPhone|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // settings 
    var baseURL = "https://spika.chat/connector/";
    
    var iconDef = baseURL + "loader/initial-icon.svg";
    var iconClose = baseURL + "loader/close.svg";
    var iconLoading = baseURL + "loader/loading.gif";

    var iframe = document.createElement("IFRAME");

    var img2 = new Image(50,50); // width, height values are optional params 
    img2.src = iconLoading;

    var img = new Image(50,50); // width, height values are optional params 
    img.src = iconDef;
    
    img.style.position = "fixed";
    img.style.zIndex = 99999;
    img.style.cursor = "pointer";
    img.style.borderRadius = "5px";
    
    if( isMob() ) {
        img.style.bottom = "5px";
        img.style.right = "5px";
    } else {
        img.style.bottom = "50px";
        img.style.right = "50px";
    }

    var loaded = false;

    img.onclick = function(){

        if(img.src == iconDef && loaded === false) {

            if( isMob() ) {
                window.open(baseURL);
                return;
            }

            loaded = true;

            img.src = iconLoading;
            img.style.opacity = 0.7;
    
            setTimeout( function() {

                img.src = iconClose;
                img.style.bottom = "auto";

                if( isMob() ) {
                    img.style.top = "10px";
                    img.style.right = "10px";
                }else{
                    img.style.top = "60px";
                    img.style.right = "60px";
                }

                img.style.zIndex = 100001;

            },7000);
    
            iframe.src = baseURL;
            
            iframe.style.transition = "all 1.0s ease";
            iframe.style.position = "fixed";
    
            if( isMob() ) {
                iframe.style.width = "90vw";
                iframe.style.left = "50px";
                iframe.style.top = "0px";
                iframe.style.height = "100vh";
            }else{
                iframe.style.width = "500px";
                iframe.style.right = "50px";
                iframe.style.bottom = "0px";
                iframe.style.height = "100vh";
            }
    
            iframe.style.zIndex = 100000;
            iframe.style.border = "none";
            iframe.style.backgroundColor = "transparent";
            iframe.style.borderRadius = "5px";
    
            iframe.onload = function(){
                iframe.contentWindow.startchat();
            }
    
            document.body.appendChild(iframe);

        }

        else if(img.src == iconDef && loaded == true) {
            img.src = iconClose;
            iframe.style.display = 'block';
            iframe.style.top = "0px";
            img.style.top = '60px';
            img.style.right = "60px";
            img.style.bottom = "auto";
            
        }

        else if(img.src == iconClose) {
            img.src = iconDef;
            iframe.style.display = 'none';
            img.style.top = 'auto';
            img.style.bottom = "50px";
            img.style.right = "50px";
        }

    };

    document.body.appendChild(img);


 })();