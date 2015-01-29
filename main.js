 requirejs.config({
    "paths": {
        "map": "../app/map",
        "eitcmap" : "../app/eitcmap",
        "jquery": "node_modules/jquery/jquery.min",
        "raphael": "node_modules/raphaeljs/raphael.min",
        "uspaths": "../app/us_paths",
        "mapcolors" : "../app/mapcolors",
        "mapevents" : "../app/mapevents",
        "eitcdata": "../app/eitc_data",
        "legend" : "../app/legend"
    }
});

requirejs(["eitcmap"], function(map) {
    
});    