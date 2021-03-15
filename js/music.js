var playList;
var musicApp;
$( function () {
      var getData = $.get("https://circuitalminds.herokuapp.com/get_template/music");
      getData.done( function( data ) {
          playList = data['playlist'];
          musicApp = data['music_app'];
      });
});

function shareVideo() {
      var el = document.createElement('textarea');
      songData = document.getElementById("play-media").src.split("/");
      songName = songData[songData.length - 1].replace(".mp4?raw=true", "");
      shareURL = "https://circuitalminds.herokuapp.com/music?play_song=" + encodeURI(songName);
      el.value = shareURL;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      alert("Link Copied: " + el.value);
      document.body.removeChild(el);
}
