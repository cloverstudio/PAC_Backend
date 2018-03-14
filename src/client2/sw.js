self.addEventListener('fetch', function (event) {
    var fetchReq = event.request.clone();

    return fetch(fetchReq).then(function (response) {

        return response;

    })
})