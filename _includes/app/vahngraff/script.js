let vObj = Dict();

vObj.getURL = function ( n ) {
    V = this.get(n);
    return [
        "https://raw.githubusercontent.com/circuitalmynds",
        "music_" + V.id.split("-")[0], "main/videos", V.name
    ].join("/");
};
vObj.getData = function ( n ) {
    V = this.get(n);
    Meta = {}
    function getMeta ( data ) {
        [Name, Prop, ItemProp] = [
            "name", "property", "itemprop"
        ].map( m => Object.values(data[m]) );
        Name.filter(
            e => [
                "title", "twitter:title", "twitter:image", "keywords"
            ].indexOf(e["name"]) != -1
        ).map( r => Meta[r["name"]] = r["content"] );
        Prop.filter(
            e => ["og:image", "og:title"].indexOf(e["property"]) != -1
        ).map( r => Meta[r["property"]] = r["content"] );
        ItemProp.filter(
            e => ["name", "duration"].indexOf(e["itemprop"]) != -1
        ).map( r => Meta[r["itemprop"]] = r["content"] );
        console.log(Meta);
        return Meta;
    };
    Url = [
        "https://circuitalminds.github.io/static/data/videos/youtube/metadata",
        V.id.replace(V.id.split("-")[0] + "-", "") + ".json"
    ].join("/");
    requestObj.get( Url, function( data ) { getMeta(data) } );
};


let Player = new Object();

Player.ID = "video-player";
Player.Poster = "/{{ site.img }}/apps/poster.gif";
Player.Data = {};
Player.randomMode = false;

Player.setMode = function () {
    this.randomMode = $("#random")[0].checked;
};
Player.Title = {
    get: function () {
        return $("#video-title")[0];
    },
    set: function ( title ) {
        this.get().innerHTML = title;
    }
};
Player.Vol = {
    setPlus: function () {
        vol = $("#" + Player.ID)[0].volume * 100;
        if ( vol < 100 ) {
            vol += 10;
        } else {
            vol = 100;
        };
        $("#" + Player.ID)[0].volume = vol / 100;
    },
    setMinus: function () {
        vol = $("#" + Player.ID)[0].volume * 100;
        if ( vol > 0 ) {
            vol -= 10;
        } else {
            vol = 0;
        };
        $("#" + Player.ID)[0].volume = vol / 100;
    }
};

Player.getVideo = function ( Index ) {
    title = Object.keys(this.Data)[Index];
    video = this.Data[title];
    this.getMetadata( video );
    if ( video.title == undefined ) {
        video.title = title;
    };
    video.title = video.title.replace(".mp4", "").replace(".wmv", "");
    return video;
};
Player.getRandomVideo = function () {
    videoIndex = Math.round( Math.random() * ( Object.keys(this.Data).length - 1 ) );
    video = this.getVideo(videoIndex);
    video.index = videoIndex;
    return video;
};
Player.getMetadata = function ( video ) {
    Attrs = ["name", "property", "itemprop"];
    Contents = ["title", "og:title", "og:image", "duration", "keywords"];
    function setData ( x, y ) {
        attrName = ( x[y] ) ? Contents[Contents.indexOf(x[y])] : undefined;
        if ( attrName != undefined ) {
            keyName = ( attrName.indexOf(":") != -1 ) ? attrName.split(":")[1] : attrName;
            if ( video[keyName] == undefined ) {
                video[keyName] = x.content;
            };
        };
    };
    for ( x of video.metadata ) {
        Attrs.map( y => setData(x, y) );
    };
    if ( video.duration != undefined ) {
        video.duration = video.duration.replace("PT", "").replace("M", ":").replace("S", ":0");
    };
    if ( video.image == undefined ) {
        video["image"] = this.Poster;
    };
};

Player.Start = function () {
    obj = $("#" + this.ID)[0];
    setTimeout(function() {
        obj.play();
        $("#results")[0].style.display = "none";
    }, 500);
};
Player.Next = function () {
    obj = $("#" + this.ID)[0];
    this.setMode();
    Index = parseFloat(obj.dataset.videoSelected) + 1;
    Video = ( this.randomMode ) ? this.getRandomVideo() : this.getVideo( Index );
    obj.setAttribute("src", Video.url);
    obj.dataset.videoSelected = Index;
    this.Title.set(Video.title);
    this.Start();
};
Player.Previous = function () {
    obj = $("#" + this.ID)[0];
    this.setMode();
    Index = parseFloat(obj.dataset.videoSelected) - 1;
    Video = ( this.randomMode ) ? this.getRandomVideo() : this.getVideo( Index );
    obj.setAttribute("src", Video.url);
    obj.dataset.videoSelected = Index;
    this.Title.set(Video.title);
    this.Start();
};
Player.Select = function ( Index ) {
    obj = $("#" + this.ID)[0];
    this.setMode();
    Video = this.getVideo( Index );
    obj.setAttribute("src", Video.url);
    obj.dataset.videoSelected = Index;
    this.Title.set(Video.title);
    this.Start();
};

Player.Feeds = {
    "id": "feeds",
    "delay": 10e3,
    "getFeed": function () {
        v = Player.getRandomVideo();
        return `<li class="button card-content bg-darkTeal bg-dark-hover fg-light"
                    onclick="Player.Select( ${v.index} );">
            <img class="avatar" src="${v.image}">
            <span class="label">${v.title}</span>
            <span class="second-label">${v.duration}</span>
        </li>`;
    },
    "setFeed": function ( Id, getFeed ) {
        $("#" + Id)[0].innerHTML = Range(0, 4).map(
            i => getFeed()
        ).join("\n");
    },
    "display": function () {
        setInterval(
            this.setFeed,
            this.delay,
            this.id,
            this.getFeed
        );
    }
};

$( function () {
    requestObj.get(
        "{{ site.static_url }}/data/videos/metadata/metadata.json",
        function ( data ) { Player.Data = data }
    );
    requestObj.get(
        "{{ site.static_url }}/data/videos/all.json",
        function ( data ) { vObj.data = data }
    );
    $("#" + Player.ID)[0].poster = Player.Poster;
    jklSearch.Render();
    Player.Feeds.display();
});