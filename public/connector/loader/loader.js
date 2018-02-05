(function () {

    // settings
    var baseURL = "https://spika.chat/connector/";

    var img = new Image(50, 50); // width, height values are optional params 
    img.src = baseURL + "loader/initial-icon.svg";

    img.style.position = "fixed";
    img.style.bottom = "50px";
    img.style.right = "50px";
    img.style.zIndex = 99999;
    img.style.cursor = "pointer";

    img.onclick = function () {

        img.style.display = "none";

        var iframe = document.createElement("IFRAME");
        iframe.src = baseURL;

        iframe.style.position = "fixed";
        iframe.style.height = "100vh";
        iframe.style.width = "500px";

        iframe.style.top = "0px";
        iframe.style.right = "50px";

        iframe.style.zIndex = 99999;
        iframe.style.border = "none";
        iframe.style.backgroundColor = "transparent";
        iframe.style.borderRadius = "5px";

        iframe.onload = function () {

            iframe.contentWindow.startchat();
        }

        document.body.appendChild(iframe);

    };

    document.body.appendChild(img);


})();