 requirejs.config({
    "paths": {
        "map": "../app/map",
        "eitcmap" : "../app/eitcmap",
        "jquery": "node_modules/jquery/dist/jquery.min",
        "raphael": "node_modules/raphaeljs/raphael.min",
        "uspaths": "../app/us_paths",
        "mapcolors" : "../app/mapcolors",
        "eitcdata": "../app/eitc_data"
    }
});

requirejs(["eitcmap"], function(map) {
    
});    