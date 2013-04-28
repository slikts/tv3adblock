(function() {
	var $container =  $('#flash-container');
		
	if (!$container.length) {
		// No player found
		return;
	}

	// XXX
	var productId = /id:(\d+)/.exec($container.find('> script')[0].textContent)[1];

	// Remove the default player
	$container.html('');

	$.ajax({
		url: 'http://viastream.viasat.tv/PlayProduct/' + productId,
		dataType: 'xml',
		success: function(data) {
			var url = data.getElementsByTagName('Video')[0].getElementsByTagName('Url')[0].textContent;
			if (/http:/.test(url)) {
				$.ajax({
					url: url,
					async: false,
					dataType: 'xml',
					success: function(data) {
						url = data.getElementsByTagName('Url')[0].textContent;
					}				
				});
			}
			
			// Parse clip and stream URLs
			var _index = url.indexOf('mp4:');
			var netConnectionUrl, videoUrl;
			if (~_index) {
				netConnectionUrl = url.substr(0, _index - 1);
				videoUrl = url.substr(_index);
			} else {
				var _parts = url.split('/');
				videoUrl = _parts.pop();
				netConnectionUrl = _parts.join('/');
			}

			$f($container.attr('id'), '//releases.flowplayer.org/swf/flowplayer-3.2.16.swf', {
				clip: {
					url: videoUrl,
					scaling: 'fit',
					provider: 'tv3',
					// XXX: Why doesn't this event fire?
					onMetaData: function (clip) {
						var width = parseInt(clip.metaData.width, 100);
						var height = parseInt(clip.metaData.height, 100);
						console.log('dimensions', width, height);
					}
				},
				plugins: {
					tv3: {
						url: 'flowplayer.rtmp-3.2.12.swf',
						netConnectionUrl: netConnectionUrl
					}
				},
				canvas: {
					backgroundGradient: 'none'
				}
			});
		}
	});
})();
