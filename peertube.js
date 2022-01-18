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
// v. 0.0.1

	var logo = plugin.path + "logo.png";
	var pluginDescriptor = plugin.getDescriptor();
	var service = plugin.createService(pluginDescriptor.title, pluginDescriptor.id + ":start", "video", true, logo);
    
    var page = require('showtime/page');
    var service = require('showtime/service');
    var settings = require('showtime/settings');
    var http = require('showtime/http');

   
    //var for settings
    var settings = plugin.createSettings(pluginDescriptor.title, logo, pluginDescriptor.synopsis);
    

    var MAIN_INSTANCE = null;
    
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
    var itemCounter = 15;
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
	function mapSearchResults(page, data) {
		for (var i = 0; i < doc.data.length; i++) {
			var item = doc.data[i]; 
			page.appendItem(plugin.getDescriptor().id + ":movie:" + item.url.toString(), "video", {
				title: item.name,
//				year: item.publishedAt,
// 				genre: item.genre,
// 				rating: parseInt(item.rating, 10)* 10,
// 				tagline: item.slogan,
 				icon: MAIN_INSTANCE.substring(0, MAIN_INSTANCE.length - 1) + item.thumbnailPath,//+ item.thumbnailPath.substring(1, item.thumbnailPath.length - 1),
 				backdrops: MAIN_INSTANCE.substring(0, MAIN_INSTANCE.length - 1) + item.previewPath, //+ item.previewPath.substring(1, item.previewPath.length - 1),
// 				duration: item.filmLength,
 				description: item.description
			});
		}
	}
	
	function itemList(page) {
        page.entries = 0;
        
        
        function loader() {
            page.loading = true;
            url = MAIN_INSTANCE + apiString + sortString + itemCounter.toString() + startItem + startItemCounter.toString();
            var doc = http.request(url).toString();
            
            page.loading = false;
            
            doc = showtime.JSONDecode(doc);
            for (var i = 0; i < doc.data.length; i++) {
			var item = doc.data[i]; 
			page.appendItem(plugin.getDescriptor().id + ":movie:" + item.url.toString(), "video", {
				title: item.name,
//				year: item.publishedAt,
// 				genre: item.genre,
// 				rating: parseInt(item.rating, 10)* 10,
// 				tagline: item.slogan,
 				icon: MAIN_INSTANCE.substring(0, MAIN_INSTANCE.length - 1) + item.thumbnailPath,//+ item.thumbnailPath.substring(1, item.thumbnailPath.length - 1),
 				backdrops: MAIN_INSTANCE.substring(0, MAIN_INSTANCE.length - 1) + item.previewPath, //+ item.previewPath.substring(1, item.previewPath.length - 1),
// 				duration: item.filmLength,
 				description: item.description
			});
            page.entries++;
		}
            startItemCounter = startItemCounter + itemCounter;
            if (startItemCounter >= doc.total) return false; 
            return true;
        }
        loader();
//        page.paginator = loader;
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
		
        //var itemCounter = doc.total;
        //var url = MAIN_INSTANCE + apiString + sortString + itemCounter.toString(); 
        //var doc = showtime.httpReq(url).toString();
		//doc = showtime.JSONDecode(doc);
		
		itemList(page);
		
		page.loading = false;
	});
    
//item page
    
	plugin.addURI(plugin.getDescriptor().id + ":movie:(.*)", function (page, id) {
		setPageHeader(page, plugin.getDescriptor().title);
		page.loading = true;
		var doc = showtime.httpReq(url).toString();
		doc = showtime.JSONDecode(doc);
        
//getting information from json

		if (doc) {            
			var docs = doc.data
			for (var i = 0; i < docs.length; i++) {
                
				if (docs[i].url.toString() == id) {
                    var videoJsonLink = MAIN_INSTANCE + apiString + docs[i].uuid;
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
                        
//creating correct link for videos
// 						var videoFormat = '-720-fragmented';
//                         var videoCatalog = 'download/videos/';
//                         var videoId = docs[i].id.split('videos/watch/', 2)[1];
//                         var videoContainer = '.mp4';
//                         if (torrentInfo.url.substring((torrentInfo.url.length - 12),(torrentInfo.url.length - 8)) == '-hls'){
//                             videoFormat = torrentInfo.url.substring((torrentInfo.url.length - 16),(torrentInfo.url.length - 12)) + '-fragmented';
//                             videoCatalog = 'download/streaming-playlists/hls/videos/';
//                         } else {
//                             videoFormat = torrentInfo.url.substring((torrentInfo.url.length - 12),(torrentInfo.url.length - 8));
//                         }
//                         if (videoFormat == '1080' || videoFormat == '1080-fragmented') {
//                             videoFormat = '-' + videoFormat;
//                         } 
//                         if (!docs[i].attachments.length){
//                             videoFormat = '';
//                             videoCatalog = 'download/streaming-playlists/hls/';
//                             videoContainer = '/0.m3u8'
//                             
//                         }                                           
                        
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
// 						var torrentInfoForDate = videoDoc.publishedAt;
                                                                      
						var videoLink = torrentInfo.fileDownloadUrl ;   
						

						page.appendItem(videoLink, "directory", {
							title: videoDoc.name + ' ' + torrentInfo.resolution.label,
							icon: MAIN_INSTANCE.substring(0, MAIN_INSTANCE.length - 1) + videoDoc.previewPath,
							description: 'description'
						});
                        
                    }
                    
				}
			}
		}
        }
		page.loading = false;
	});

