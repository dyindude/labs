var data = { "user": "test" }

function postData(data) {
    $.post( "/api", data,
    function( data ) {
        $( ".fullObject" ).html( JSON.stringify(data) ),
        $( ".someID" ).html( data.someID ),
        $( ".someOtherID" ).html( data.someOtherID ),
        $( ".anotherID" ).html( data.anotherID )
    },
    "json");
}

// needs JSON.stringify() if we're using the whole object, data.user (or similar) work fine
