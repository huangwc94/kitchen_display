$(() => {
    const socket = io();
    var twitch_client = null;
    socket.on('stop', ()=>{
        $("#screen").html("<h1>No Stream to display yet!</h1>");
        twitch_client = null;
    });

    socket.on('debug', (data) => {
        console.log(data);
    });

    socket.on('start', (data) => {
        $("#screen").html("");
        twitch_client = new Twitch.Embed("screen", {
            width:$(window).width(),
            height:$(window).height(),
            channel: data.name,
            layout:'video',
            theme:'dark'
        });
    });
})


