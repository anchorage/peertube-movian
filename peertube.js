/**
 *  Peertube plugin for Movian Media Center
 *  Plugin based on dashkodo zona-movian-ukr and other Buksa plugins
 *
 *  Copyright (C) 2022 anchorage
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
// v. 0.0.2

	var logo = plugin.path + "logo.png";
	var pluginDescriptor = plugin.getDescriptor();
	var service = plugin.createService(pluginDescriptor.title, pluginDescriptor.id + ":start", "video", true, logo);
    
    var page = require('movian/page');
    var service = require('movian/service');
    var settings = require('movian/settings');
    var http = require('movian/http');

   
    //var for settings
    var settings = plugin.createSettings(pluginDescriptor.title, logo, pluginDescriptor.synopsis);
    

    var MAIN_INSTANCE = null;
    var urls = null;
    
    settings.createString('instance', 'Peertube instance', 'https://xxivproduction.video/', function(v) {
        try {
        service.domain = v;
        MAIN_INSTANCE = service.domain;
        } catch (e) {
            
        }
    });

    
    settings.createBool('debug', 'Debug', false, function(v) {
        service.debug = v;
//        log.d(service);
    });
    var apiString = 'api/v1/videos/';
    var sortString = '?sort=-publishedAt&isLocal=true&count=';
    var itemCounter = 10;
    var startItem = '&start=';
    var startItemCounter = 0;
	var url = MAIN_INSTANCE + apiString + sortString + itemCounter.toString() + startItem + startItemCounter.toString(); 
	var blue = '6699CC',
		orange = 'FFA500',
		red = 'EE0000',
		green = '008B45';

	function colorStr(str, color) {
		return '<font color="' + color + '">' + str + '</font>';
	}

	function coloredStr(str, color) {
		return '<font color="' + color + '">' + str + '</font>';
	}
	
//base list function
	
	function itemList(page) {
        page.entries = 0;
        startItemCounter = 0;
        
        function loader() {
            page.loading = true;
            url = MAIN_INSTANCE + apiString + sortString + itemCounter.toString() + startItem + startItemCounter.toString();
            var doc = http.request(url).toString();
            
            page.loading = false;
            
            doc = showtime.JSONDecode(doc);
            for (var i = 0; i < doc.data.length; i++) {
                var item = doc.data[i]; 
                page.appendItem(plugin.getDescriptor().id + ":movie:" + item.uuid.toString(), "video", {
                    title: item.name,
//				year: item.publishedAt,
// 				genre: item.genre,
// 				rating: parseInt(item.rating, 10)* 10,
// 				tagline: item.slogan,
                    icon: MAIN_INSTANCE.substring(0, MAIN_INSTANCE.length - 1) + item.thumbnailPath,
                                //+ item.thumbnailPath.substring(1, item.thumbnailPath.length - 1),
                    backdrops: MAIN_INSTANCE.substring(0, MAIN_INSTANCE.length - 1) + item.previewPath, //+ item.previewPath.substring(1, item.previewPath.length - 1),
// 				duration: item.filmLength,
                    description: item.description
                    
                });
                urls = item.url.toString()
                page.entries++;
		}
            startItemCounter = startItemCounter + itemCounter;
            if (startItemCounter > doc.total) return false; 
            return true;
        }
        loader();
        page.paginator = loader;
        
        page.loading = false;
        
		
        
    }

	function setPageHeader(page, title, icon) {
		page.type = "directory";
		page.contents = "items";
		page.metadata.logo = logo;
		page.metadata.icon = logo;
		page.metadata.title = new showtime.RichText(title);
	}
	
//main page with list

	plugin.addURI(plugin.getDescriptor().id + ":start", function (page, id) {
		setPageHeader(page, plugin.getDescriptor().title);
		
 		itemList(page);
		
		page.loading = false;
	});
    
//item page
    
	plugin.addURI(plugin.getDescriptor().id + ":movie:(.*)", function (page, id) {
		setPageHeader(page, plugin.getDescriptor().title);
		page.loading = true;
        
//getting information from json
        if (id) {
            startItemCounter = 0;
            var videoJsonLink = MAIN_INSTANCE + apiString + id;
            var videoDoc = showtime.httpReq(videoJsonLink).toString();
            videoDoc = showtime.JSONDecode(videoDoc);
//for Livestreams
            if(videoDoc.isLive){
                var videoLink = videoDoc.streamingPlaylists[0].playlistUrl;
                page.appendItem(videoLink, "directory", {
                    title: videoDoc.name + ' ' + 'livestream',
                    icon: MAIN_INSTANCE.substring(0, MAIN_INSTANCE.length - 1) + videoDoc.previewPath,
                    description: 'description'
                    
                });
                
            }
            if(videoDoc.files.length > 0) {
                for (var y = 0; y < videoDoc.files.length; y++) {
                    var torrentInfo = videoDoc.files[y];
                    var torrentInfoForDate = videoDoc.publishedAt;
                    var videoLink = torrentInfo.fileDownloadUrl ;
                    
                    page.appendItem(videoLink, "directory", {
                        title: videoDoc.name + ' ' + torrentInfo.resolution.label,
                        icon: MAIN_INSTANCE.substring(0, MAIN_INSTANCE.length - 1) + videoDoc.previewPath,
                        description: torrentInfoForDate
                        
                    });
                    
                }
                
            } else {
                for (var y = 0; y < videoDoc.streamingPlaylists[0].files.length; y++) {
                    var torrentInfo = videoDoc.streamingPlaylists[0].files[y];
// 					var torrentInfoForDate = videoDoc.publishedAt;
                                                                      
                    var videoLink = torrentInfo.fileDownloadUrl ;   
						

                    page.appendItem(videoLink, "directory", {
                        title: videoDoc.name + ' ' + torrentInfo.resolution.label,
                        icon: MAIN_INSTANCE.substring(0, MAIN_INSTANCE.length - 1) + videoDoc.previewPath,
                        description: 'description'
                        
                    });
                    
                }
                
            }

            
        }
		page.loading = false;
	});

